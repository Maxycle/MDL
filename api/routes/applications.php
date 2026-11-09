<?php
declare(strict_types=1);

/** @var Router $router */

// Apply (visitor) or co-opt a candidate (certified member, porte-parole or admin).
$router->post('/applications', static function (): array {
    $user = Auth::user();
    $v = new V(Http::input());
    $first = $v->str('first_name', 1, 80);
    $last = $v->str('last_name', 1, 80);
    $email = $v->email();
    $motivations = $v->str('motivations', 20, 5000);
    $v->check();

    $coopt = $user && (in_array($user['certification'], ['MC', 'PP'], true) || $user['is_admin']);
    if (!$coopt) {
        Throttle::hit('apply:' . Http::ip(), 5, 3600);
    }
    if (Users::emailTaken($email)) {
        throw HttpError::conflict('Un compte existe déjà avec cette adresse email.');
    }
    $existing = Db::one('SELECT * FROM account_requests WHERE LOWER(email) = ?', [$email]);
    if ($existing && !in_array($existing['status'], ['unverified', 'refused'], true)) {
        throw HttpError::conflict('Une candidature existe déjà pour cette adresse email.');
    }

    $now = Util::now();
    $emailToken = $coopt ? null : Util::token();
    $row = [
        'first_name' => $first,
        'last_name' => $last,
        'motivations' => $motivations,
        'referrer_id' => $coopt ? $user['id'] : null,
        'status' => $coopt ? 'pending' : 'unverified',
        'email_token_hash' => $emailToken ? Util::hash($emailToken) : null,
        'email_token_expires_at' => $emailToken ? Util::now(2 * 86400) : null,
        'submitted_at' => $coopt ? $now : null,
        'decided_at' => null,
        'updated_at' => $now,
    ];
    if ($existing) {
        Db::update('account_requests', $row, 'id = ?', [$existing['id']]);
        $id = (int) $existing['id'];
    } else {
        $id = Db::insert('account_requests', $row + ['email' => $email, 'created_at' => $now]);
    }
    Applications::log($id, $coopt ? $user['id'] : null, $coopt ? 'coopt' : 'submit');
    $req = Applications::find($id);
    if ($coopt) {
        Applications::notifyPPs($req);
    } else {
        Emails::verifyApplication($req, Util::url('/candidature/verifier/' . $emailToken));
    }
    return Http::created(['status' => $req['status'], 'cooptation' => $coopt]);
});

$router->post('/applications/verify', static function (): array {
    $token = Http::input()['token'] ?? null;
    $req = Util::isToken($token) ? Db::one('SELECT * FROM account_requests WHERE email_token_hash = ?', [Util::hash($token)]) : null;
    if (!$req || $req['status'] !== 'unverified' || Util::ts($req['email_token_expires_at']) < time()) {
        throw new HttpError(400, 'Ce lien a déjà été utilisé ou a expiré. Si besoin, déposez une nouvelle candidature avec la même adresse.');
    }
    Db::update('account_requests', [
        'status' => 'pending',
        'email_token_hash' => null,
        'email_token_expires_at' => null,
        'submitted_at' => Util::now(),
        'updated_at' => Util::now(),
    ], 'id = ?', [$req['id']]);
    Applications::log((int) $req['id'], null, 'verify');
    Applications::notifyPPs(Applications::find((int) $req['id']));
    return ['first_name' => $req['first_name']];
});

$router->get('/signup/{token}', static function (string $token): array {
    $req = Applications::bySignupToken($token);
    return ['email' => $req['email'], 'first_name' => $req['first_name'], 'last_name' => $req['last_name']];
});

$router->post('/signup', static function (): array {
    $in = Http::input();
    $req = Applications::bySignupToken($in['token'] ?? null);
    $v = new V($in);
    $row = [
        'username' => $v->username(),
        'first_name' => $v->str('first_name', 1, 80),
        'last_name' => $v->str('last_name', 1, 80),
        'intro' => $v->str('intro', 0, 2000, false),
        'profile_public' => $v->bool('profile_public', true) ? 1 : 0,
    ];
    $password = $v->password();
    if ($row['username'] && Users::usernameTaken($row['username'])) {
        $v->error('username', 'Ce nom d\'utilisateur est déjà pris.');
    }
    if (Users::emailTaken($req['email'])) {
        throw HttpError::conflict('Un compte existe déjà avec cette adresse email. Connectez-vous.');
    }
    $v->check();
    $id = Db::tx(static function () use ($row, $password, $req): int {
        $id = Db::insert('users', $row + [
            'email' => mb_strtolower($req['email']),
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            'certification' => 'SM',
            'created_at' => Util::now(),
            'updated_at' => Util::now(),
        ]);
        Db::update('account_requests', ['user_id' => $id, 'signup_token_hash' => null, 'signup_token_expires_at' => null, 'updated_at' => Util::now()], 'id = ?', [$req['id']]);
        return $id;
    });
    Applications::log((int) $req['id'], $id, 'signup');
    Auth::login($id);
    return Http::created(['user' => Users::self(Users::find($id))]);
});

// ---- Porte-parole review ----------------------------------------------------

$router->get('/admin/applications', static function (): array {
    $me = Auth::requireStaff();
    $pps = Users::sortByName(Db::all("SELECT id, username, first_name, last_name FROM users WHERE certification = 'PP'"));
    return [
        'applications' => Applications::listing(),
        'pps' => array_map(static fn(array $p): array => ['id' => (int) $p['id'], 'name' => "{$p['first_name']} {$p['last_name']}", 'username' => $p['username']], $pps),
        'can_vote' => $me['certification'] === 'PP',
        'me' => $me['id'],
    ];
});

$router->post('/admin/applications/{id}/{action}', static function (string $id, string $action): array {
    $me = Auth::requirePP();
    $req = Applications::find((int) $id);
    if (!$req) {
        throw HttpError::notFound('Candidature introuvable.');
    }
    $set = static function (string $status) use ($req): void {
        Db::update('account_requests', ['status' => $status, 'decided_at' => Util::now(), 'updated_at' => Util::now()], 'id = ?', [$req['id']]);
    };
    switch ($action) {
        case 'approve':
            if ($req['status'] !== 'pending') {
                throw HttpError::conflict('Cette candidature n\'est plus en attente.');
            }
            if (in_array($me['id'], Applications::approvals($req), true)) {
                throw HttpError::conflict('Vous avez déjà approuvé cette candidature.');
            }
            Applications::log($req['id'], $me['id'], 'approve');
            Applications::maybeAccept($req);
            break;
        case 'refuse':
            if ($req['status'] !== 'pending') {
                throw HttpError::conflict('Seule une candidature en attente peut être refusée.');
            }
            $set('refused');
            Applications::log($req['id'], $me['id'], 'refuse');
            Emails::refused($req);
            break;
        case 'ban':
            if (!in_array($req['status'], ['pending', 'refused', 'unverified'], true)) {
                throw HttpError::conflict('Cette candidature ne peut pas être bannie.');
            }
            $set('banned');
            Applications::log($req['id'], $me['id'], 'ban');
            Emails::banned($req);
            break;
        case 'unban':
            if ($req['status'] !== 'banned') {
                throw HttpError::conflict('Cette candidature n\'est pas bannie.');
            }
            $set('refused');
            Applications::log($req['id'], $me['id'], 'unban');
            Emails::unbanned($req);
            break;
        case 'resend':
            if ($req['status'] !== 'accepted' || $req['user_id']) {
                throw HttpError::conflict('Il n\'y a pas d\'invitation à renvoyer.');
            }
            Applications::sendInvite($req);
            Applications::log($req['id'], $me['id'], 'resend');
            break;
        default:
            throw HttpError::notFound();
    }
    return ['status' => Applications::find((int) $id)['status']];
});
