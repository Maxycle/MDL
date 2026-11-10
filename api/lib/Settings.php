<?php
declare(strict_types=1);

final class Settings
{
    public const INTS = [
        'tries_permitted' => [1, 20],
        'try_length_days' => [1, 365],
        'cycle_length_days' => [1, 730],
        'questions_per_attempt' => [1, 200],
        'time_limit_minutes' => [1, 240],
        'low_threshold' => [0, 1000],
        'mid_threshold' => [0, 1000],
        'high_threshold' => [0, 1000],
        // Part of a question image hidden until the member validates an answer, in % of its height.
        'image_blur_top' => [0, 99],
        'image_blur_bottom' => [1, 100],
    ];
    public const TEXTS = ['intro' => 2000, 'welcome_start' => 120, 'welcome_end' => 120];

    private static ?array $cache = null;

    public static function get(): array
    {
        if (self::$cache !== null) {
            return self::$cache;
        }
        $row = Db::one('SELECT * FROM settings WHERE id = 1');
        if (!$row) {
            throw new RuntimeException('Settings row missing: run cli/install.php');
        }
        foreach (array_keys(self::INTS) as $k) {
            $row[$k] = (int) $row[$k];
        }
        $row['sa_open'] = (bool) $row['sa_open'];
        foreach (array_keys(self::TEXTS) as $k) {
            $row[$k] = (string) ($row[$k] ?? '');
        }
        unset($row['id'], $row['updated_at']);
        return self::$cache = $row;
    }

    public static function forget(): void
    {
        self::$cache = null;
    }
}
