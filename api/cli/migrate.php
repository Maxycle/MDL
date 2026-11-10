<?php
declare(strict_types=1);

// Updates an existing database to the current schema. Safe to run any number of times.
// Usage:  php api/cli/migrate.php
if (PHP_SAPI !== 'cli') {
    exit;
}
require dirname(__DIR__) . '/lib/bootstrap.php';

$done = Migrations::run();
echo $done ? 'Database updated: ' . implode(', ', $done) . "\n" : "Database already up to date.\n";
