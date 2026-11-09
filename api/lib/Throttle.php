<?php
declare(strict_types=1);

/** Fixed-window rate limiting stored in the database (login, forgot password, applications). */
final class Throttle
{
    public static function hit(string $key, int $max, int $windowSeconds): void
    {
        $k = Util::hash($key);
        $row = Db::one('SELECT hits, window_start FROM throttle WHERE k = ?', [$k]);
        $now = time();
        if (!$row || Util::ts($row['window_start']) + $windowSeconds < $now) {
            if ($row) {
                Db::exec('UPDATE throttle SET hits = 1, window_start = ? WHERE k = ?', [Util::now(), $k]);
            } else {
                try {
                    Db::insert('throttle', ['k' => $k, 'hits' => 1, 'window_start' => Util::now()]);
                } catch (PDOException) {
                    // Two requests raced to create the row; the other one counted.
                }
            }
            return;
        }
        if ((int) $row['hits'] >= $max) {
            $minutes = (int) ceil((Util::ts($row['window_start']) + $windowSeconds - $now) / 60);
            throw new HttpError(429, "Trop de tentatives. Réessayez dans $minutes min.");
        }
        Db::exec('UPDATE throttle SET hits = hits + 1 WHERE k = ?', [$k]);
    }

    public static function clear(string $key): void
    {
        Db::exec('DELETE FROM throttle WHERE k = ?', [Util::hash($key)]);
    }
}
