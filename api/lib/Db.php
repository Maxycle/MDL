<?php
declare(strict_types=1);

/** Thin PDO wrapper. All SQL in the app stays portable between MySQL and SQLite. */
final class Db
{
    private static ?PDO $pdo = null;

    public static function pdo(): PDO
    {
        if (self::$pdo) {
            return self::$pdo;
        }
        $dsn = (string) Config::get('db.dsn');
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];
        if (str_starts_with($dsn, 'mysql:')) {
            $options[PDO::ATTR_EMULATE_PREPARES] = false;
        }
        if (str_starts_with($dsn, 'sqlite:') && !is_dir(dirname(substr($dsn, 7)))) {
            mkdir(dirname(substr($dsn, 7)), 0775, true);
        }
        $pdo = new PDO($dsn, Config::get('db.user'), Config::get('db.pass'), $options);
        if (str_starts_with($dsn, 'sqlite:')) {
            $pdo->exec('PRAGMA foreign_keys = ON');
            $pdo->exec('PRAGMA busy_timeout = 5000');
        } else {
            $pdo->exec("SET time_zone = '+00:00'");
        }
        return self::$pdo = $pdo;
    }

    public static function isSqlite(): bool
    {
        return str_starts_with((string) Config::get('db.dsn'), 'sqlite:');
    }

    public static function all(string $sql, array $params = []): array
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function one(string $sql, array $params = []): ?array
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public static function val(string $sql, array $params = []): mixed
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($params);
        $value = $stmt->fetchColumn();
        return $value === false ? null : $value;
    }

    public static function exec(string $sql, array $params = []): int
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    public static function insert(string $table, array $row): int
    {
        $cols = array_keys($row);
        $sql = "INSERT INTO $table (" . implode(', ', $cols) . ') VALUES (' . implode(', ', array_fill(0, count($cols), '?')) . ')';
        self::exec($sql, array_values($row));
        return (int) self::pdo()->lastInsertId();
    }

    public static function update(string $table, array $row, string $where, array $params = []): int
    {
        $set = implode(', ', array_map(static fn(string $c): string => "$c = ?", array_keys($row)));
        return self::exec("UPDATE $table SET $set WHERE $where", [...array_values($row), ...$params]);
    }

    /** "?, ?, ?" for an IN (...) list. */
    public static function placeholders(array $values): string
    {
        return implode(', ', array_fill(0, max(1, count($values)), '?'));
    }

    public static function tx(callable $fn): mixed
    {
        $pdo = self::pdo();
        $pdo->beginTransaction();
        try {
            $result = $fn();
            $pdo->commit();
            return $result;
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
}
