<?php
// mdl-config.php: lives NEXT TO public_html (outside the web root), e.g.
//
//   ~/www/libertarien.net/mdl-config.php      <- this file (no passwords in it)
//   ~/www/libertarien.net/mdl-secrets.php     <- passwords only (see secrets.sample.php)
//   ~/www/libertarien.net/public_html/        <- the site and the API
//
// Keeping passwords in a separate file means this one can be edited and shared safely.
$secrets = require __DIR__ . '/mdl-secrets.php';

return [
    'app_url' => 'https://www.libertarien.net',   // used in email links, no trailing slash
    'debug' => false,                              // true adds error details to API responses
    'cookie_secure' => true,                       // keep true in production (HTTPS)

    // Site Tools > Site > MySQL: the database and user you created.
    'db' => [
        'dsn' => 'mysql:host=localhost;dbname=DB_NAME;charset=utf8mb4',
        'user' => 'DB_USER',
        'pass' => $secrets['db_password'],
    ],

    // "mail" uses SiteGround's built-in sending, no mailbox password needed.
    // For SMTP instead: create noreply@ in Site Tools > Email > Accounts, set transport to "smtp",
    // fill host/port from its "Mail Configuration", and add 'mail_password' to mdl-secrets.php.
    'mail' => [
        'transport' => 'mail',          // mail | smtp | log
        'host' => 'mail.libertarien.net',
        'port' => 465,
        'encryption' => 'ssl',          // ssl (port 465) or tls (port 587)
        'username' => 'noreply@libertarien.net',
        'password' => $secrets['mail_password'] ?? '',
        'from' => 'noreply@libertarien.net',
        'from_name' => 'Mouvement des Libertariens',
    ],

    // For a site in a subfolder (e.g. churchofzer.com/libertarien.net/), restrict the login cookie to it:
    // 'cookie_path' => '/libertarien.net/',

    // Where blog images are stored, and their path relative to the site folder.
    'uploads_dir' => __DIR__ . '/public_html/uploads',
    'uploads_url' => 'uploads',

    // Logs (errors, and emails when transport is "log"). Outside public_html.
    'storage_dir' => __DIR__ . '/mdl-storage',
];
