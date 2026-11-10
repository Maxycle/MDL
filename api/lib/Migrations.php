<?php
declare(strict_types=1);

/**
 * Brings an existing database up to date with schema/*.sql (new installs already have everything).
 * Each step checks first, so running it again changes nothing. deploy.ps1 runs it after every upload.
 */
final class Migrations
{
    /** Columns added after the first release: [table, column, MySQL definition, SQLite definition]. */
    private const COLUMNS = [
        ['questions', 'image_url', 'VARCHAR(2048) NULL AFTER content', 'TEXT NULL'],
        ['attempt_answers', 'revealed', 'TINYINT(1) NOT NULL DEFAULT 0', 'INTEGER NOT NULL DEFAULT 0'],
        ['settings', 'image_blur_top', 'INT NOT NULL DEFAULT 55 AFTER sa_open', 'INTEGER NOT NULL DEFAULT 55'],
        ['settings', 'image_blur_bottom', 'INT NOT NULL DEFAULT 100 AFTER image_blur_top', 'INTEGER NOT NULL DEFAULT 100'],
    ];

    /** @return string[] the changes made, e.g. ["questions.image_url"] */
    public static function run(): array
    {
        $done = [];
        foreach (self::COLUMNS as [$table, $column, $mysql, $sqlite]) {
            if (self::hasColumn($table, $column)) {
                continue;
            }
            Db::pdo()->exec("ALTER TABLE $table ADD COLUMN $column " . (Db::isSqlite() ? $sqlite : $mysql));
            $done[] = "$table.$column";
        }
        return $done;
    }

    private static function hasColumn(string $table, string $column): bool
    {
        if (Db::isSqlite()) {
            return in_array($column, array_column(Db::all("PRAGMA table_info($table)"), 'name'), true);
        }
        return (bool) Db::val(
            'SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            [$table, $column]
        );
    }
}
