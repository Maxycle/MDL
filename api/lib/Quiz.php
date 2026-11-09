<?php
declare(strict_types=1);

/**
 * Certification questionnaires. Everything that decides a result happens here, on the server:
 * which questions are served, the time limit, the number of tries, the grading.
 * The browser never receives answer points.
 *
 * Tries: within a cycle that starts with the first attempt, a member gets `tries_permitted`
 * attempts during the first `try_length_days`. After that they wait until `cycle_length_days`
 * have passed since the cycle started, then a new cycle begins.
 */
final class Quiz
{
    public const DOMAINS = ['DN' => 'Droit Naturel', 'EA' => 'École Autrichienne'];
    public const TRACKS = ['BA', 'SA'];
    public const RANK = ['beginner' => 0, 'BA' => 1, 'SA' => 2, 'SE' => 3];
    public const DIFFICULTIES = ['LOW', 'MID', 'HIGH'];
    private const GRACE = 30; // seconds of network slack after the deadline

    public static function overview(array $user): array
    {
        $uid = (int) $user['id'];
        self::closeExpired($uid);
        $settings = Settings::get();
        $levels = Users::levelsFor([$uid])[$uid];
        $tracks = [];
        foreach (array_keys(self::DOMAINS) as $domain) {
            foreach (self::TRACKS as $level) {
                $tracks[] = self::track($user, $domain, $level, $levels, $settings);
            }
        }
        $current = self::current($uid);
        $history = array_map([self::class, 'result'], Db::all(
            'SELECT * FROM attempts WHERE user_id = ? AND finished_at IS NOT NULL ORDER BY started_at DESC LIMIT 10',
            [$uid]
        ));
        return [
            'levels' => $levels,
            'certification' => Users::find($uid)['certification'],
            'tracks' => $tracks,
            'current_attempt_id' => $current ? (int) $current['id'] : null,
            'history' => $history,
            'rules' => [
                'questions_per_attempt' => $settings['questions_per_attempt'],
                'time_limit_minutes' => $settings['time_limit_minutes'],
                'tries_permitted' => $settings['tries_permitted'],
                'try_length_days' => $settings['try_length_days'],
                'cycle_length_days' => $settings['cycle_length_days'],
                'thresholds' => self::thresholds($settings),
            ],
        ];
    }

    public static function track(array $user, string $domain, string $level, array $levels, array $settings): array
    {
        $base = ['domain' => $domain, 'level' => $level, 'tries_left' => null, 'window_ends_at' => null, 'next_available_at' => null];
        $rank = self::RANK[$levels[$domain] ?? 'beginner'] ?? 0;
        $target = self::RANK[$level];
        if ($rank >= $target) {
            return ['state' => 'done'] + $base;
        }
        if ($rank < $target - 1) {
            return ['state' => 'locked'] + $base;
        }
        if ($level === 'SA' && !$settings['sa_open'] && !$user['is_admin']) {
            return ['state' => 'closed'] + $base;
        }
        if (!Db::val('SELECT COUNT(*) FROM questions WHERE domain = ? AND level = ? AND active = 1', [$domain, $level])) {
            return ['state' => 'empty'] + $base;
        }
        if ($user['is_admin']) {
            return ['state' => 'available'] + $base;
        }
        return self::cycle((int) $user['id'], $domain, $level, $settings) + $base;
    }

    private static function cycle(int $uid, string $domain, string $level, array $s): array
    {
        $starts = Db::all('SELECT started_at FROM attempts WHERE user_id = ? AND domain = ? AND level = ? ORDER BY started_at', [$uid, $domain, $level]);
        $cycleLen = $s['cycle_length_days'] * 86400;
        $cycleStart = null;
        $count = 0;
        foreach ($starts as $row) {
            $t = Util::ts($row['started_at']);
            if ($cycleStart === null || $t >= $cycleStart + $cycleLen) {
                $cycleStart = $t;
                $count = 1;
            } else {
                $count++;
            }
        }
        $now = time();
        if ($cycleStart === null || $now >= $cycleStart + $cycleLen) {
            return ['state' => 'available', 'tries_left' => $s['tries_permitted']];
        }
        $left = $s['tries_permitted'] - $count;
        $windowEnd = $cycleStart + $s['try_length_days'] * 86400;
        if ($left > 0 && $now <= $windowEnd) {
            return ['state' => 'available', 'tries_left' => $left, 'window_ends_at' => Util::isoTs($windowEnd)];
        }
        return ['state' => 'cooldown', 'tries_left' => 0, 'next_available_at' => Util::isoTs($cycleStart + $cycleLen)];
    }

    public static function start(array $user, string $domain, string $level): array
    {
        $uid = (int) $user['id'];
        if (!isset(self::DOMAINS[$domain]) || !in_array($level, self::TRACKS, true)) {
            throw new HttpError(422, 'Questionnaire inconnu.');
        }
        self::closeExpired($uid);
        if (self::current($uid)) {
            throw HttpError::conflict('Un questionnaire est déjà en cours.');
        }
        $settings = Settings::get();
        $levels = Users::levelsFor([$uid])[$uid];
        $track = self::track($user, $domain, $level, $levels, $settings);
        if ($track['state'] !== 'available') {
            throw HttpError::conflict(match ($track['state']) {
                'done' => 'Ce niveau est déjà validé.',
                'locked' => 'Validez d\'abord « Bases Acquises » dans ce domaine.',
                'closed' => 'Ce questionnaire n\'est pas encore ouvert.',
                'empty' => 'Aucune question n\'est disponible pour ce questionnaire.',
                default => 'Vous n\'avez plus d\'essai disponible pour le moment.',
            });
        }
        $ids = self::pick($domain, $level, $settings['questions_per_attempt']);
        $id = Db::insert('attempts', [
            'user_id' => $uid,
            'domain' => $domain,
            'level' => $level,
            'question_ids' => json_encode($ids),
            'started_at' => Util::now(),
            'deadline_at' => Util::now($settings['time_limit_minutes'] * 60),
        ]);
        return self::payload(self::find($id));
    }

    /** Questions in the same difficulty mix as the pool, easiest first. */
    private static function pick(string $domain, string $level, int $wanted): array
    {
        $byDifficulty = array_fill_keys(self::DIFFICULTIES, []);
        foreach (Db::all('SELECT id, difficulty FROM questions WHERE domain = ? AND level = ? AND active = 1', [$domain, $level]) as $r) {
            $byDifficulty[$r['difficulty']][] = (int) $r['id'];
        }
        $total = array_sum(array_map('count', $byDifficulty));
        $n = min($wanted, $total);
        $quota = [];
        foreach ($byDifficulty as $k => $ids) {
            $quota[$k] = (int) round($n * count($ids) / max(1, $total));
        }
        $counts = array_map('count', $byDifficulty);
        $largest = array_search(max($counts), $counts, true);
        $quota[$largest] += $n - array_sum($quota);

        $picked = array_fill_keys(self::DIFFICULTIES, []);
        $rest = [];
        foreach ($byDifficulty as $k => $ids) {
            shuffle($ids);
            $take = max(0, min($quota[$k], count($ids)));
            $picked[$k] = array_slice($ids, 0, $take);
            foreach (array_slice($ids, $take) as $id) {
                $rest[] = [$k, $id];
            }
        }
        shuffle($rest);
        while (array_sum(array_map('count', $picked)) < $n && $rest) {
            [$k, $id] = array_pop($rest);
            $picked[$k][] = $id;
        }
        return array_merge($picked['LOW'], $picked['MID'], $picked['HIGH']);
    }

    public static function find(int $id): ?array
    {
        return Db::one('SELECT * FROM attempts WHERE id = ?', [$id]);
    }

    public static function current(int $uid): ?array
    {
        return Db::one(
            'SELECT * FROM attempts WHERE user_id = ? AND finished_at IS NULL AND deadline_at >= ? ORDER BY started_at DESC LIMIT 1',
            [$uid, Util::now(-self::GRACE)]
        );
    }

    public static function owned(array $user, int $id): array
    {
        $attempt = self::find($id);
        if (!$attempt || (int) $attempt['user_id'] !== (int) $user['id']) {
            throw HttpError::notFound('Questionnaire introuvable.');
        }
        return $attempt;
    }

    /** What the browser gets: questions and answer texts, never points. */
    public static function payload(array $attempt): array
    {
        $ids = json_decode($attempt['question_ids'], true) ?: [];
        $questions = [];
        if ($ids) {
            $in = Db::placeholders($ids);
            $rows = Db::all("SELECT id, content FROM questions WHERE id IN ($in)", $ids);
            $answers = Db::all("SELECT id, question_id, content FROM answers WHERE question_id IN ($in)", $ids);
            $byQuestion = [];
            foreach ($answers as $a) {
                $byQuestion[(int) $a['question_id']][] = ['id' => (int) $a['id'], 'content' => $a['content']];
            }
            $text = array_column($rows, 'content', 'id');
            foreach ($ids as $qid) {
                if (!isset($text[$qid])) {
                    continue;
                }
                $list = $byQuestion[$qid] ?? [];
                // Stable shuffle: same order on every reload of this attempt.
                usort($list, static fn(array $a, array $b): int =>
                    strcmp(sha1($attempt['id'] . ':' . $a['id']), sha1($attempt['id'] . ':' . $b['id'])));
                $questions[] = ['id' => (int) $qid, 'content' => $text[$qid], 'answers' => $list];
            }
        }
        $chosen = [];
        foreach (Db::all('SELECT question_id, answer_id FROM attempt_answers WHERE attempt_id = ?', [$attempt['id']]) as $r) {
            $chosen[(string) $r['question_id']] = (int) $r['answer_id'];
        }
        return [
            'id' => (int) $attempt['id'],
            'domain' => $attempt['domain'],
            'level' => $attempt['level'],
            'started_at' => Util::iso($attempt['started_at']),
            'deadline_at' => Util::iso($attempt['deadline_at']),
            'server_now' => Util::isoTs(time()),
            'questions' => $questions,
            'answers' => (object) $chosen,
        ];
    }

    public static function saveAnswer(array $attempt, int $questionId, ?int $answerId): void
    {
        if ($attempt['finished_at']) {
            throw HttpError::conflict('Ce questionnaire est terminé.');
        }
        if (time() > Util::ts($attempt['deadline_at']) + self::GRACE) {
            self::finish($attempt);
            throw HttpError::conflict('Le temps est écoulé : le questionnaire a été clôturé.');
        }
        $ids = json_decode($attempt['question_ids'], true) ?: [];
        if (!in_array($questionId, $ids, true)) {
            throw new HttpError(422, 'Cette question ne fait pas partie du questionnaire.');
        }
        if ($answerId !== null && !Db::val('SELECT id FROM answers WHERE id = ? AND question_id = ?', [$answerId, $questionId])) {
            throw new HttpError(422, 'Réponse invalide.');
        }
        Db::tx(static function () use ($attempt, $questionId, $answerId): void {
            Db::exec('DELETE FROM attempt_answers WHERE attempt_id = ? AND question_id = ?', [$attempt['id'], $questionId]);
            if ($answerId !== null) {
                Db::insert('attempt_answers', ['attempt_id' => $attempt['id'], 'question_id' => $questionId, 'answer_id' => $answerId]);
            }
        });
    }

    /** Grades with the answers saved so far. Unanswered questions score 0. */
    public static function finish(array $attempt): array
    {
        if ($attempt['finished_at']) {
            return self::result($attempt);
        }
        $settings = Settings::get();
        $ids = json_decode($attempt['question_ids'], true) ?: [];
        $difficulty = [];
        if ($ids) {
            $in = Db::placeholders($ids);
            $difficulty = array_column(Db::all("SELECT id, difficulty FROM questions WHERE id IN ($in)", $ids), 'difficulty', 'id');
        }
        $points = [];
        foreach (Db::all('SELECT aa.question_id, an.points FROM attempt_answers aa
                          JOIN answers an ON an.id = aa.answer_id AND an.question_id = aa.question_id
                          WHERE aa.attempt_id = ?', [$attempt['id']]) as $r) {
            $points[(int) $r['question_id']] = (int) $r['points'];
        }
        $sum = array_fill_keys(self::DIFFICULTIES, 0);
        $count = array_fill_keys(self::DIFFICULTIES, 0);
        foreach ($difficulty as $qid => $d) {
            $sum[$d] += $points[(int) $qid] ?? 0;
            $count[$d]++;
        }
        $avg = [];
        foreach (self::DIFFICULTIES as $d) {
            $avg[$d] = $count[$d] ? round($sum[$d] / $count[$d], 2) : null;
        }
        $thresholds = self::thresholds($settings);
        $graded = array_filter($avg, static fn($v) => $v !== null);
        $passed = $graded !== [];
        foreach ($graded as $d => $value) {
            if ($value < $thresholds[$d]) {
                $passed = false;
            }
        }

        Db::tx(static function () use ($attempt, $avg, $passed): void {
            Db::update('attempts', [
                'finished_at' => Util::now(),
                'avg_low' => $avg['LOW'],
                'avg_mid' => $avg['MID'],
                'avg_high' => $avg['HIGH'],
                'passed' => $passed ? 1 : 0,
            ], 'id = ?', [$attempt['id']]);
            if ($passed) {
                self::promote((int) $attempt['user_id'], $attempt['domain'], $attempt['level']);
            }
        });
        return self::result(self::find((int) $attempt['id']));
    }

    private static function promote(int $uid, string $domain, string $level): void
    {
        $current = Db::val('SELECT level FROM levels WHERE user_id = ? AND domain = ?', [$uid, $domain]);
        if ($current === null) {
            Db::insert('levels', ['user_id' => $uid, 'domain' => $domain, 'level' => $level, 'updated_at' => Util::now()]);
        } elseif ((self::RANK[$current] ?? 0) < self::RANK[$level]) {
            Db::update('levels', ['level' => $level, 'updated_at' => Util::now()], 'user_id = ? AND domain = ?', [$uid, $domain]);
        }
        // Both domains at "Sait Analyser": a simple member becomes a certified member.
        $levels = Users::levelsFor([$uid])[$uid];
        if (self::RANK[$levels['DN']] >= 2 && self::RANK[$levels['EA']] >= 2) {
            Db::exec("UPDATE users SET certification = 'MC', updated_at = ? WHERE id = ? AND certification = 'SM'", [Util::now(), $uid]);
        }
    }

    public static function closeExpired(int $uid): void
    {
        foreach (Db::all('SELECT * FROM attempts WHERE user_id = ? AND finished_at IS NULL AND deadline_at < ?', [$uid, Util::now(-self::GRACE)]) as $attempt) {
            self::finish($attempt);
        }
    }

    public static function result(array $attempt): array
    {
        $ids = json_decode($attempt['question_ids'], true) ?: [];
        $answered = (int) Db::val('SELECT COUNT(*) FROM attempt_answers WHERE attempt_id = ?', [$attempt['id']]);
        $num = static fn($v): ?float => $v === null ? null : (float) $v;
        return [
            'id' => (int) $attempt['id'],
            'domain' => $attempt['domain'],
            'level' => $attempt['level'],
            'started_at' => Util::iso($attempt['started_at']),
            'finished_at' => Util::iso($attempt['finished_at']),
            'passed' => (bool) $attempt['passed'],
            'averages' => ['LOW' => $num($attempt['avg_low']), 'MID' => $num($attempt['avg_mid']), 'HIGH' => $num($attempt['avg_high'])],
            'thresholds' => self::thresholds(Settings::get()),
            'answered' => $answered,
            'total' => count($ids),
        ];
    }

    private static function thresholds(array $s): array
    {
        return ['LOW' => $s['low_threshold'], 'MID' => $s['mid_threshold'], 'HIGH' => $s['high_threshold']];
    }
}
