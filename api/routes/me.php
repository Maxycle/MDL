<?php
declare(strict_types=1);

/** @var Router $router */

// Partial update: only the fields sent are validated and saved.
$router->put('/me', static function (): array {
    $user = Auth::requireUser();
    $in = Http::input();
    $v = new V($in);
    $row = [];
    if ($v->has('first_name')) { $row['first_name'] = $v->str('first_name', 1, 80); }
    if ($v->has('last_name')) { $row['last_name'] = $v->str('last_name', 1, 80); }
    if ($v->has('intro')) { $row['intro'] = $v->str('intro', 0, 2000, false); }
    if ($v->has('profile_public')) { $row['profile_public'] = $v->bool('profile_public') ? 1 : 0; }
    if ($v->has('username')) {
        $row['username'] = $v->username();
        if ($row['username'] && Users::usernameTaken($row['username'], $user['id'])) {
            $v->error('username', 'Ce nom d\'utilisateur est déjà pris.');
        }
    }
    if ($v->has('email')) {
        $email = $v->email();
        if ($email && $email !== mb_strtolower($user['email'])) {
            if (!password_verify((string) ($in['current_password'] ?? ''), $user['password_hash'])) {
                $v->error('current_password', 'Saisissez votre mot de passe actuel pour changer d\'adresse.');
            }
            if (Users::emailTaken($email, $user['id'])) {
                $v->error('email', 'Cette adresse est déjà utilisée.');
            }
            $row['email'] = $email;
        }
    }
    $v->check();
    if ($row) {
        $row['updated_at'] = Util::now();
        Db::update('users', $row, 'id = ?', [$user['id']]);
    }
    return ['user' => Users::self(Users::find($user['id']))];
});

$router->put('/me/password', static function (): array {
    $user = Auth::requireUser();
    $in = Http::input();
    $v = new V($in);
    $password = $v->password();
    if (!password_verify((string) ($in['current_password'] ?? ''), $user['password_hash'])) {
        $v->error('current_password', 'Mot de passe actuel incorrect.');
    }
    $v->check();
    Db::update('users', ['password_hash' => password_hash($password, PASSWORD_DEFAULT), 'updated_at' => Util::now()], 'id = ?', [$user['id']]);
    Auth::logoutEverywhere($user['id']);
    Auth::login($user['id']);
    return ['ok' => true];
});

$router->put('/me/pp-request', static function (): array {
    $user = Auth::requireUser();
    if ($user['certification'] !== 'MC') {
        throw HttpError::forbidden('Seuls les membres certifiés peuvent demander à devenir porte-parole.');
    }
    $wants = Util::bool(Http::input()['wants_pp'] ?? false);
    Db::update('users', ['wants_pp' => $wants ? 1 : 0, 'updated_at' => Util::now()], 'id = ?', [$user['id']]);
    if ($wants && !$user['wants_pp']) {
        Emails::ppRequest($user);
    }
    return ['user' => Users::self(Users::find($user['id']))];
});
