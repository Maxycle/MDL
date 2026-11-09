<?php
declare(strict_types=1);

final class Config
{
    private static array $values = [];
    private static string $apiDir = '';

    /**
     * Looks for the config file in this order:
     *  1. the MDL_CONFIG environment variable
     *  2. mdl-config.php next to public_html (site at a domain root: outside the web root)
     *  3. mdl-config.php in the site folder itself (site in a subfolder; .htaccess blocks downloads)
     *  4. api/config.dev.php (local development, never uploaded)
     */
    public static function load(string $apiDir): void
    {
        self::$apiDir = $apiDir;
        $candidates = array_filter([
            getenv('MDL_CONFIG') ?: null,
            dirname($apiDir, 2) . '/mdl-config.php',
            dirname($apiDir) . '/mdl-config.php',
            $apiDir . '/config.dev.php',
        ]);
        foreach ($candidates as $file) {
            if (is_file($file)) {
                // Swallow stray output (e.g. a UTF-8 BOM added by an editor) so it can't corrupt responses.
                ob_start();
                self::$values = require $file;
                ob_end_clean();
                return;
            }
        }
        throw new RuntimeException('Configuration file not found. Copy api/config.sample.php to mdl-config.php.');
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $value = self::$values;
        foreach (explode('.', $key) as $part) {
            if (!is_array($value) || !array_key_exists($part, $value)) {
                return $default;
            }
            $value = $value[$part];
        }
        return $value;
    }

    public static function storageDir(): string
    {
        $dir = self::get('storage_dir') ?: self::$apiDir . '/storage';
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        return rtrim($dir, '/\\');
    }

    public static function apiDir(): string
    {
        return self::$apiDir;
    }
}
