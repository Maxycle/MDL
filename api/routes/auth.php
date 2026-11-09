<?php
declare(strict_types=1);

/** @var Router $router */

$router->get('/session', static function (): array {
    $user = Auth::user();
    $s = Settings::get();
    return [
        'user' => $user ? Users::self($user) : null,
        'settings' => [
            'welcome_start' => $s['welcome_start'],
            'welcome_end' => $s['welcome_end'],
            'intro' => $s['intro'],
            'sa_open' => $s['sa_open'],
        ],
    ];
});

$router->post('/login', static function (): array {
    $in = Http::input();
    $login = mb_strtolower(trim((string) ($in['login'] ?? '')));
    $password = (string) ($in['password'] ?? '');
    if ($login === '' || $password === '') {
        throw new HttpError(422, 'Saisissez votre identifiant et votre mot de passe.');
    }
    Throttle::hit('login-ip:' . Http::ip(), 30, 900);
    Throttle::hit('login:' . $login, 8, 900);
    $user = Db::one('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?', [$login, $login]);
    // Verify against a dummy hash when the user doesn't exist, so timing doesn't reveal accounts.
    $hash = $user['password_hash'] ?? '$2y$12$w9vY4nqvQ0Hh8m3cS2gZFOq3pM8kq8N0b6mQyQyH1n5d5c9Z4yJ2e';
    if (!password_verify($password, $hash) || !$user) {
        throw new HttpError(401, 'Identifiant ou mot de passe incorrect.');
    }
    if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
        Db::update('users', ['password_hash' => password_hash($password, PASSWORD_DEFAULT)], 'id = ?', [$user['id']]);
    }
    Throttle::clear('login:' . $login);
    Auth::login((int) $user['id']);
    return ['user' => Users::self($user)];
});

$router->post('/logout', static function (): array {
    Auth::logout();
    return ['ok' => true];
});

$router->post('/password/forgot', static function (): array {
    $v = new V(Http::input());
    $email = $v->email();
    $v->check();
    Throttle::hit('forgot:' . Http::ip(), 10, 3600);
    $user = Db::one('SELECT * FROM users WHERE LOWER(email) = ?', [$email]);
    if ($user) {
        $token = Util::token();
        Db::update('users', ['reset_token_hash' => Util::hash($token), 'reset_expires_at' => Util::now(3600)], 'id = ?', [$user['id']]);
        Emails::passwordReset($user, Util::url('/reinitialiser/' . $token));
    }
    // Same answer either way: the form must not reveal who has an account.
    return ['message' => 'Si un compte correspond à cette adresse, un email de réinitialisation vient de lui être envoyé.'];
});

$router->post('/password/reset', static function (): array {
    $in = Http::input();
    $v = new V($in);
    $password = $v->password();
    $v->check();
    $token = $in['token'] ?? null;
    $user = Util::isToken($token) ? Db::one('SELECT * FROM users WHERE reset_token_hash = ?', [Util::hash($token)]) : null;
    if (!$user || Util::ts($user['reset_expires_at']) < time()) {
        throw new HttpError(400, 'Ce lien est invalide ou a expiré. Faites une nouvelle demande.');
    }
    Db::update('users', [
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'reset_token_hash' => null,
        'reset_expires_at' => null,
        'updated_at' => Util::now(),
    ], 'id = ?', [$user['id']]);
    Auth::logoutEverywhere((int) $user['id']);
    Auth::login((int) $user['id']);
    return ['user' => Users::self(Users::find((int) $user['id']))];
});
