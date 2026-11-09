<?php
declare(strict_types=1);

// Creates the tables (MySQL or SQLite, depending on the configured DSN).
// Usage:  php api/cli/install.php
if (PHP_SAPI !== 'cli') {
    exit;
}
require dirname(__DIR__) . '/lib/bootstrap.php';

$schema = Db::isSqlite() ? 'sqlite.sql' : 'mysql.sql';
if (Db::val(Db::isSqlite() ? "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'" : "SHOW TABLES LIKE 'users'")) {
    fwrite(STDERR, "Tables already exist. Nothing to do.\n");
    exit(1);
}
$sql = (string) file_get_contents(dirname(__DIR__) . "/schema/$schema");
$sql = preg_replace('/^--.*$/m', '', $sql) ?? '';
foreach (preg_split('/;\s*\n/', $sql) as $statement) {
    if (trim($statement) !== '') {
        Db::pdo()->exec($statement);
    }
}
echo "Database ready ($schema).\nNext: php api/cli/create-user.php --help\n";
