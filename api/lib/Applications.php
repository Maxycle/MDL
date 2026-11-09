<?php
declare(strict_types=1);

/**
 * Membership applications ("candidatures").
 *
 * Status flow:
 *   unverified --(applicant clicks email link)--> pending
 *   (co-opted by a member: created directly as pending)
 *   pending --(every current porte-parole approves)--> accepted --(applicant signs up)--> account created
 *   pending --(any porte-parole refuses)--> refused   (the applicant may apply again)
 *   pending|refused|unverified --(ban)--> banned --(unban)--> refused
 *
 * The signup link is a separate token, issued only on acceptance.
 */
final class Applications
{
    public static function find(int $id): ?array
    {
        return Db::one('SELECT * FROM account_requests WHERE id = ?', [$id]);
    }

    public static function bySignupToken(mixed $token): array
    {
        if (!Util::isToken($token)) {
            throw new HttpError(400, 'Ce lien d\'inscription est invalide.');
        }
        $req = Db::one('SELECT * FROM account_requests WHERE signup_token_hash = ?', [Util::hash($token)]);
        if (!$req || $req['status'] !== 'accepted' || $req['user_id'] || Util::ts($req['signup_token_expires_at']) < time()) {
            throw new HttpError(400, 'Ce lien d\'inscription est invalide ou a expiré. Demandez à un porte-parole de vous en renvoyer un.');
        }
        return $req;
    }

    public static function log(int|string $requestId, ?int $userId, string $action): void
    {
        Db::insert('request_events', [
            'request_id' => (int) $requestId,
            'user_id' => $userId,
            'action' => $action,
            'created_at' => Util::now(),
        ]);
    }

    /** Ids of current porte-parole who approved since the application was (re)submitted. */
    public static function approvals(array $req): array
    {
        $rows = Db::all(
            "SELECT DISTINCT e.user_id FROM request_events e JOIN users u ON u.id = e.user_id
             WHERE e.request_id = ? AND e.action = 'approve' AND e.created_at >= ? AND u.certification = 'PP'",
            [$req['id'], $req['submitted_at'] ?? $req['created_at']]
        );
        return array_map('intval', array_column($rows, 'user_id'));
    }

    public static function maybeAccept(array $req): bool
    {
        if ($req['status'] !== 'pending') {
            return false;
        }
        $ppCount = (int) Db::val("SELECT COUNT(*) FROM users WHERE certification = 'PP'");
        if ($ppCount === 0 || count(self::approvals($req)) < $ppCount) {
            return false;
        }
        self::accept($req);
        return true;
    }

    /** Re-run unanimity after the set of porte-parole changes. */
    public static function recheckPending(): void
    {
        foreach (Db::all("SELECT * FROM account_requests WHERE status = 'pending'") as $req) {
            self::maybeAccept($req);
        }
    }

    public static function accept(array $req): void
    {
        Db::update('account_requests', ['status' => 'accepted', 'decided_at' => Util::now(), 'updated_at' => Util::now()], 'id = ?', [$req['id']]);
        self::log((int) $req['id'], null, 'accepted');
        self::sendInvite($req);
    }

    public static function sendInvite(array $req): void
    {
        $token = Util::token();
        Db::update('account_requests', [
            'signup_token_hash' => Util::hash($token),
            'signup_token_expires_at' => Util::now(30 * 86400),
            'updated_at' => Util::now(),
        ], 'id = ?', [$req['id']]);
        Emails::accepted($req, Util::url('/inscription/' . $token));
    }

    public static function notifyPPs(array $req): void
    {
        $referrer = $req['referrer_id'] ? Users::find((int) $req['referrer_id']) : null;
        Emails::newApplication($req, $referrer);
    }

    /** List for the porte-parole review screen. */
    public static function listing(): array
    {
        $requests = Db::all('SELECT * FROM account_requests ORDER BY COALESCE(submitted_at, created_at) DESC');
        $events = Db::all('SELECT e.request_id, e.user_id, e.action, e.created_at, u.first_name, u.last_name, u.certification
                           FROM request_events e LEFT JOIN users u ON u.id = e.user_id ORDER BY e.created_at, e.id');
        $byRequest = [];
        foreach ($events as $e) {
            $byRequest[(int) $e['request_id']][] = $e;
        }
        $people = [];
        foreach (Db::all('SELECT id, first_name, last_name, username, certification FROM users') as $u) {
            $people[(int) $u['id']] = $u;
        }

        return array_map(static function (array $r) use ($byRequest, $people): array {
            $since = $r['submitted_at'] ?? $r['created_at'];
            $history = [];
            $approvals = [];
            foreach ($byRequest[(int) $r['id']] ?? [] as $e) {
                $history[] = [
                    'action' => $e['action'],
                    'by' => $e['user_id'] ? trim("{$e['first_name']} {$e['last_name']}") : null,
                    'at' => Util::iso($e['created_at']),
                ];
                if ($e['action'] === 'approve' && $e['created_at'] >= $since && $e['user_id'] && ($e['certification'] ?? '') === 'PP') {
                    $approvals[(int) $e['user_id']] = true;
                }
            }
            $ref = $r['referrer_id'] ? ($people[(int) $r['referrer_id']] ?? null) : null;
            return [
                'id' => (int) $r['id'],
                'email' => $r['email'],
                'first_name' => $r['first_name'],
                'last_name' => $r['last_name'],
                'motivations' => $r['motivations'],
                'status' => $r['status'],
                'has_account' => $r['user_id'] !== null,
                'referrer' => $ref ? ['id' => (int) $ref['id'], 'name' => "{$ref['first_name']} {$ref['last_name']}", 'certification' => $ref['certification']] : null,
                'approvals' => array_keys($approvals),
                'history' => $history,
                'created_at' => Util::iso($r['created_at']),
                'submitted_at' => Util::iso($r['submitted_at']),
                'decided_at' => Util::iso($r['decided_at']),
                'invite_expires_at' => $r['status'] === 'accepted' && !$r['user_id'] ? Util::iso($r['signup_token_expires_at']) : null,
            ];
        }, $requests);
    }
}
