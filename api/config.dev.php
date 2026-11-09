<?php
// Local development configuration (SQLite, emails written to storage/mail.log).
// Not used in production: there, mdl-config.php outside public_html takes precedence.
return [
    'app_url' => 'http://localhost:5173',
    'debug' => true,
    'cookie_secure' => false,
    'db' => [
        'dsn' => 'sqlite:' . __DIR__ . '/storage/dev.sqlite',
        'user' => null,
        'pass' => null,
    ],
    'mail' => [
        'transport' => 'log',
        'from' => 'noreply@libertarien.net',
        'from_name' => 'Mouvement des Libertariens',
    ],
    'uploads_dir' => __DIR__ . '/storage/uploads',
    'uploads_url' => 'uploads',
    'storage_dir' => __DIR__ . '/storage',
];
