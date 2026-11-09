<?php
declare(strict_types=1);

/** @var Router $router */

// ---- Questionnaire settings ---------------------------------------------------

$router->get('/admin/settings', static function (): array {
    Auth::requireAdmin();
    return ['settings' => Settings::get()];
});

$router->put('/admin/settings', static function (): array {
    Auth::requireAdmin();
    $v = new V(Http::input());
    $row = [];
    foreach (Settings::INTS as $key => [$min, $max]) {
        $row[$key] = $v->int($key, $min, $max);
    }
    foreach (Settings::TEXTS as $key => $max) {
        // Welcome texts keep their spaces ("Bienvenue" + pseudo + " !"); the intro is trimmed.
        $raw = Http::input()[$key] ?? '';
        $row[$key] = $key === 'intro' ? $v->str($key, 0, $max, false) : mb_substr(is_string($raw) ? $raw : '', 0, $max);
    }
    $row['sa_open'] = $v->bool('sa_open') ? 1 : 0;
    $v->check();
    Db::update('settings', $row + ['updated_at' => Util::now()], 'id = 1');
    Settings::forget();
    return ['settings' => Settings::get()];
});

// ---- Questions ----------------------------------------------------------------

$questionsWithAnswers = static function (string $where = '', array $params = []): array {
    $questions = Db::all("SELECT * FROM questions $where ORDER BY domain, level, id", $params);
    if (!$questions) {
        return [];
    }
    $ids = array_column($questions, 'id');
    $answers = [];
    foreach (Db::all('SELECT * FROM answers WHERE question_id IN (' . Db::placeholders($ids) . ') ORDER BY position, id', $ids) as $a) {
        $answers[(int) $a['question_id']][] = ['id' => (int) $a['id'], 'content' => $a['content'], 'points' => (int) $a['points']];
    }
    return array_map(static fn(array $q): array => [
        'id' => (int) $q['id'],
        'domain' => $q['domain'],
        'level' => $q['level'],
        'difficulty' => $q['difficulty'],
        'content' => $q['content'],
        'active' => (bool) $q['active'],
        'answers' => $answers[(int) $q['id']] ?? [],
        'updated_at' => Util::iso($q['updated_at']),
    ], $questions);
};

$router->get('/admin/questions', static function () use ($questionsWithAnswers): array {
    Auth::requireAdmin();
    return ['questions' => $questionsWithAnswers()];
});

$questionInput = static function (): array {
    $in = Http::input();
    $v = new V($in);
    $q = [
        'content' => $v->str('content', 1, 5000),
        'domain' => $v->in('domain', array_keys(Quiz::DOMAINS)),
        'level' => $v->in('level', ['BA', 'SA', 'SE']),
        'difficulty' => $v->in('difficulty', Quiz::DIFFICULTIES),
        'active' => $v->bool('active', true) ? 1 : 0,
    ];
    $answers = [];
    foreach (is_array($in['answers'] ?? null) ? $in['answers'] : [] as $i => $a) {
        $content = trim((string) ($a['content'] ?? ''));
        if ($content === '') {
            continue;
        }
        if (filter_var($a['points'] ?? null, FILTER_VALIDATE_INT) === false) {
            $v->error('answers', 'Chaque réponse doit avoir un nombre de points entier.');
            continue;
        }
        $answers[] = ['id' => isset($a['id']) ? (int) $a['id'] : null, 'content' => mb_substr($content, 0, 2000), 'points' => (int) $a['points'], 'position' => $i];
    }
    if (count($answers) < 2) {
        $v->error('answers', 'Au moins deux réponses.');
    }
    $v->check();
    return [$q, $answers];
};

$saveAnswers = static function (int $questionId, array $answers): void {
    $keep = [];
    foreach ($answers as $a) {
        $row = ['content' => $a['content'], 'points' => $a['points'], 'position' => $a['position']];
        // Update answers in place so in-progress attempts keep pointing at valid ids.
        if ($a['id'] && Db::update('answers', $row, 'id = ? AND question_id = ?', [$a['id'], $questionId])) {
            $keep[] = $a['id'];
        } elseif ($a['id'] && Db::val('SELECT id FROM answers WHERE id = ? AND question_id = ?', [$a['id'], $questionId])) {
            $keep[] = $a['id'];
        } else {
            $keep[] = Db::insert('answers', $row + ['question_id' => $questionId]);
        }
    }
    Db::exec('DELETE FROM answers WHERE question_id = ? AND id NOT IN (' . Db::placeholders($keep) . ')', [$questionId, ...$keep]);
};

$router->post('/admin/questions', static function () use ($questionInput, $saveAnswers, $questionsWithAnswers): array {
    Auth::requireAdmin();
    [$q, $answers] = $questionInput();
    $id = Db::tx(static function () use ($q, $answers, $saveAnswers): int {
        $id = Db::insert('questions', $q + ['created_at' => Util::now(), 'updated_at' => Util::now()]);
        $saveAnswers($id, $answers);
        return $id;
    });
    return Http::created(['question' => $questionsWithAnswers('WHERE id = ?', [$id])[0]]);
});

$router->put('/admin/questions/{id}', static function (string $id) use ($questionInput, $saveAnswers, $questionsWithAnswers): array {
    Auth::requireAdmin();
    if (!Db::val('SELECT id FROM questions WHERE id = ?', [(int) $id])) {
        throw HttpError::notFound('Question introuvable.');
    }
    [$q, $answers] = $questionInput();
    Db::tx(static function () use ($id, $q, $answers, $saveAnswers): void {
        Db::update('questions', $q + ['updated_at' => Util::now()], 'id = ?', [(int) $id]);
        $saveAnswers((int) $id, $answers);
    });
    return ['question' => $questionsWithAnswers('WHERE id = ?', [(int) $id])[0]];
});

$router->delete('/admin/questions/{id}', static function (string $id): array {
    Auth::requireAdmin();
    Db::exec('DELETE FROM questions WHERE id = ?', [(int) $id]);
    return ['ok' => true];
});

$router->delete('/admin/questions', static function (): array {
    Auth::requireAdmin();
    if ((Http::input()['confirm'] ?? '') !== 'SUPPRIMER') {
        throw new HttpError(422, 'Tapez SUPPRIMER pour confirmer.');
    }
    $count = (int) Db::val('SELECT COUNT(*) FROM questions');
    Db::exec('DELETE FROM questions');
    return ['deleted' => $count];
});

/*
 * Spreadsheet import. Columns are found by their header name, in any order; all others are ignored:
 *   question_content | question_domain (DN/EA) | question_level (BA/SA) | LMH (LOW/MID/HIGH)
 *   | answer1_content | answer1_value | ... answerN_* | status (optional)
 * The admin first gets a preview (mode=preview), then chooses which status values make a question active.
 * Rows with any other status are stored as inactive: visible in Gestion, never served to members.
 */
$parseQuestionFile = static function (string $path): array {
    $rows = Xlsx::read($path);

    $headerIndex = null;
    foreach ($rows as $i => $row) {
        if (in_array('question_content', array_map('strtolower', $row), true)) {
            $headerIndex = $i;
            break;
        }
    }
    if ($headerIndex === null) {
        throw new HttpError(422, 'Colonne « question_content » introuvable dans la première feuille.');
    }
    $cols = [];
    foreach ($rows[$headerIndex] as $c => $name) {
        $cols[strtolower(trim($name))] = $c;
    }
    $get = static fn(array $row, string $name): string => isset($cols[$name]) ? trim($row[$cols[$name]] ?? '') : '';
    $difficultyMap = ['LOW' => 'LOW', 'L' => 'LOW', 'MID' => 'MID', 'M' => 'MID', 'HIGH' => 'HIGH', 'H' => 'HIGH'];

    $valid = [];
    $errors = [];
    foreach (array_slice($rows, $headerIndex + 1, null, true) as $i => $row) {
        $line = $i + 1;
        $content = $get($row, 'question_content');
        if ($content === '') {
            continue;
        }
        $domain = strtoupper($get($row, 'question_domain'));
        $level = strtoupper($get($row, 'question_level'));
        $difficulty = $difficultyMap[strtoupper($get($row, 'lmh'))] ?? null;
        $answers = [];
        for ($n = 1; isset($cols["answer{$n}_content"]); $n++) {
            $text = $get($row, "answer{$n}_content");
            $points = $get($row, "answer{$n}_value");
            if ($text !== '' && is_numeric($points)) {
                $answers[] = ['content' => $text, 'points' => (int) round((float) $points), 'position' => $n];
            }
        }
        $problem = match (true) {
            !isset(Quiz::DOMAINS[$domain]) => "domaine « $domain » inconnu (DN ou EA)",
            !in_array($level, ['BA', 'SA', 'SE'], true) => "niveau « $level » inconnu (BA ou SA)",
            $difficulty === null => 'difficulté (colonne LMH) manquante : LOW, MID ou HIGH',
            count($answers) < 2 => 'moins de deux réponses avec des points',
            default => null,
        };
        if ($problem) {
            $errors[] = ['row' => $line, 'message' => ucfirst($problem) . '.'];
            continue;
        }
        $valid[] = [
            'content' => $content, 'domain' => $domain, 'level' => $level, 'difficulty' => $difficulty,
            'status' => isset($cols['status']) ? $get($row, 'status') : '', 'answers' => $answers,
        ];
    }
    return [$valid, $errors, isset($cols['status'])];
};

$router->post('/admin/questions/import', static function () use ($parseQuestionFile): array {
    Auth::requireAdmin();
    $file = $_FILES['file'] ?? null;
    if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
        throw new HttpError(422, 'Choisissez un fichier .xlsx.');
    }
    [$valid, $errors, $hasStatus] = $parseQuestionFile($file['tmp_name']);
    $key = static fn(array $q): string => "{$q['domain']}|{$q['level']}|{$q['content']}";
    $existing = [];
    foreach (Db::all('SELECT domain, level, content FROM questions') as $q) {
        $existing[$key($q)] = true;
    }
    $mode = $_POST['mode'] ?? 'append';
    $errorList = array_slice($errors, 0, 100);

    if ($mode === 'preview') {
        $statuses = [];
        $breakdown = [];
        $duplicates = 0;
        foreach ($valid as $q) {
            $statuses[$q['status']] = ($statuses[$q['status']] ?? 0) + 1;
            $group = "{$q['domain']}|{$q['level']}|{$q['status']}";
            $breakdown[$group] ??= ['domain' => $q['domain'], 'level' => $q['level'], 'status' => $q['status'], 'LOW' => 0, 'MID' => 0, 'HIGH' => 0];
            $breakdown[$group][$q['difficulty']]++;
            $duplicates += isset($existing[$key($q)]) ? 1 : 0;
        }
        ksort($breakdown);
        $list = [];
        foreach ($statuses as $status => $count) {
            $list[] = ['status' => (string) $status, 'count' => $count, 'default' => in_array((string) $status, ['inProdOn', 'reviewedOn'], true)];
        }
        return [
            'total' => count($valid), 'has_status' => $hasStatus, 'statuses' => $hasStatus ? $list : [],
            'breakdown' => array_values($breakdown), 'duplicates' => $duplicates,
            'errors' => $errorList, 'error_count' => count($errors),
        ];
    }

    $replace = $mode === 'replace';
    $activeStatuses = json_decode((string) ($_POST['active_statuses'] ?? ''), true);
    if (!is_array($activeStatuses)) {
        $activeStatuses = ['inProdOn', 'reviewedOn'];
    }
    $imported = $active = $duplicates = 0;
    Db::tx(static function () use ($valid, $replace, $hasStatus, $activeStatuses, $key, &$existing, &$imported, &$active, &$duplicates): void {
        if ($replace) {
            Db::exec('DELETE FROM questions');
            $existing = [];
        }
        foreach ($valid as $q) {
            if (isset($existing[$key($q)])) {
                $duplicates++;
                continue;
            }
            $existing[$key($q)] = true;
            $isActive = !$hasStatus || in_array($q['status'], $activeStatuses, true);
            $qid = Db::insert('questions', [
                'content' => $q['content'], 'domain' => $q['domain'], 'level' => $q['level'], 'difficulty' => $q['difficulty'],
                'active' => $isActive ? 1 : 0, 'created_at' => Util::now(), 'updated_at' => Util::now(),
            ]);
            foreach ($q['answers'] as $a) {
                Db::insert('answers', $a + ['question_id' => $qid]);
            }
            $imported++;
            $active += $isActive ? 1 : 0;
        }
    });
    return [
        'imported' => $imported, 'active' => $active, 'inactive' => $imported - $active, 'duplicates' => $duplicates,
        'errors' => $errorList, 'error_count' => count($errors), 'replaced' => $replace,
    ];
});

$router->get('/admin/questions/export', static function () use ($questionsWithAnswers): string {
    Auth::requireAdmin();
    $questions = $questionsWithAnswers();
    $max = max(5, ...array_map(static fn(array $q): int => count($q['answers']), $questions ?: [['answers' => []]]));
    $header = ['status', 'question_domain', 'question_level', 'LMH', 'question_content'];
    for ($n = 1; $n <= $max; $n++) {
        array_push($header, "answer{$n}_content", "answer{$n}_value");
    }
    $sheet = [$header];
    foreach ($questions as $q) {
        $row = [$q['active'] ? 'inProdOn' : 'off', $q['domain'], $q['level'], $q['difficulty'], $q['content']];
        foreach ($q['answers'] as $a) {
            array_push($row, $a['content'], $a['points']);
        }
        $sheet[] = $row;
    }
    return Http::download(Xlsx::write($sheet, 'Questions'), 'questions-' . gmdate('Y-m-d') . '.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});
