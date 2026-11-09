<?php
declare(strict_types=1);

final class Util
{
    /** UTC "Y-m-d H:i:s", optionally offset by some seconds. */
    public static function now(int $offset = 0): string
    {
        return gmdate('Y-m-d H:i:s', time() + $offset);
    }

    public static function ts(?string $datetime): int
    {
        return $datetime ? (int) strtotime(substr($datetime, 0, 19) . ' UTC') : 0;
    }

    /** DB datetime -> ISO 8601 for the browser. */
    public static function iso(?string $datetime): ?string
    {
        return $datetime ? str_replace(' ', 'T', substr($datetime, 0, 19)) . 'Z' : null;
    }

    public static function isoTs(int $ts): string
    {
        return gmdate('Y-m-d\TH:i:s\Z', $ts);
    }

    public static function token(): string
    {
        return bin2hex(random_bytes(32));
    }

    public static function hash(string $token): string
    {
        return hash('sha256', $token);
    }

    public static function isToken(mixed $token): bool
    {
        return is_string($token) && preg_match('/^[a-f0-9]{64}$/', $token) === 1;
    }

    public static function url(string $path): string
    {
        return rtrim((string) Config::get('app_url'), '/') . $path;
    }

    /** Lowercase ASCII, for slugs and accent-insensitive sorting. */
    public static function ascii(string $s): string
    {
        $map = [
            'à' => 'a', 'â' => 'a', 'ä' => 'a', 'á' => 'a', 'ã' => 'a', 'å' => 'a', 'ç' => 'c',
            'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e', 'í' => 'i', 'ì' => 'i', 'î' => 'i', 'ï' => 'i',
            'ñ' => 'n', 'ó' => 'o', 'ò' => 'o', 'ô' => 'o', 'ö' => 'o', 'õ' => 'o', 'ú' => 'u', 'ù' => 'u',
            'û' => 'u', 'ü' => 'u', 'ý' => 'y', 'ÿ' => 'y', 'œ' => 'oe', 'æ' => 'ae', 'ß' => 'ss',
        ];
        return strtr(mb_strtolower($s), $map);
    }

    public static function slug(string $s): string
    {
        $slug = trim(preg_replace('/[^a-z0-9]+/', '-', self::ascii($s)) ?? '', '-');
        return substr($slug, 0, 180) ?: 'article';
    }

    public static function bool(mixed $v): bool
    {
        return $v === true || $v === 1 || $v === '1' || $v === 'true' || $v === 'on';
    }
}
