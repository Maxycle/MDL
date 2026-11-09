<?php
declare(strict_types=1);

final class Log
{
    public static function error(Throwable $e): void
    {
        self::write('error.log', sprintf(
            "[%s] %s: %s in %s:%d\n%s\n",
            gmdate('c'), $e::class, $e->getMessage(), $e->getFile(), $e->getLine(), $e->getTraceAsString()
        ));
    }

    public static function write(string $file, string $line): void
    {
        try {
            file_put_contents(Config::storageDir() . '/' . $file, $line, FILE_APPEND | LOCK_EX);
        } catch (Throwable) {
            error_log($line);
        }
    }
}
