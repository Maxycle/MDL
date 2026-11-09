<?php
declare(strict_types=1);

// Creates a member directly (for the first porte-parole / administrator).
// Usage:
//   php api/cli/create-user.php --email=you@example.org --username=you --first=Prénom --last=Nom --pp --admin --invite
//
//   --invite      emails a link (valid 7 days) so the member chooses their own password. Recommended.
//   (otherwise)   the password is asked interactively, or pass --password=... for scripts.
if (PHP_SAPI !== 'cli') {
    exit;
}
require dirname(__DIR__) . '/lib/bootstrap.php';

$opts = getopt('', ['email:', 'username:', 'first:', 'last:', 'password::', 'pp', 'admin', 'invite', 'help']);
if (isset($opts['help']) || !isset($opts['email'], $opts['username'], $opts['first'], $opts['last'])) {
    echo "php api/cli/create-user.php --email=... --username=... --first=... --last=... [--pp] [--admin] [--invite | --password=...]\n";
    exit(isset($opts['help']) ? 0 : 1);
}
$invite = isset($opts['invite']);
if (!filter_var($opts['email'], FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Adresse email invalide.\n");
    exit(1);
}
if ($invite) {
    $password = bin2hex(random_bytes(24)); // never shown or used: replaced through the emailed link
} else {
    $password = $opts['password'] ?? null;
    if (!$password) {
        echo 'Mot de passe (8 caractères minimum) : ';
        $password = trim((string) fgets(STDIN));
    }
    if (mb_strlen($password) < 8) {
        fwrite(STDERR, "Mot de passe trop court.\n");
        exit(1);
    }
}
if (Users::emailTaken($opts['email']) || Users::usernameTaken($opts['username'])) {
    fwrite(STDERR, "Cet email ou ce nom d'utilisateur existe déjà.\n");
    exit(1);
}
$id = Db::insert('users', [
    'email' => mb_strtolower($opts['email']),
    'username' => $opts['username'],
    'first_name' => $opts['first'],
    'last_name' => $opts['last'],
    'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'certification' => isset($opts['pp']) ? 'PP' : 'SM',
    'is_admin' => isset($opts['admin']) ? 1 : 0,
    'created_at' => Util::now(),
    'updated_at' => Util::now(),
]);
echo "Compte créé (id $id).\n";

if ($invite) {
    $token = Util::token();
    Db::update('users', ['reset_token_hash' => Util::hash($token), 'reset_expires_at' => Util::now(7 * 86400)], 'id = ?', [$id]);
    if (Emails::accountInvite(Users::find($id), Util::url('/reinitialiser/' . $token))) {
        echo "Invitation envoyée à {$opts['email']} : le lien pour choisir le mot de passe est valable 7 jours.\n";
    } else {
        fwrite(STDERR, "L'email n'a pas pu partir (voir le journal d'erreurs). Le compte existe : utilisez « Mot de passe oublié » une fois l'email configuré.\n");
        exit(2);
    }
}
