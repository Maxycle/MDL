<?php
declare(strict_types=1);

final class Http
{
    /** Returned by a handler that already sent its own response (file downloads). */
    public const SENT = '__sent__';

    private static ?array $body = null;

    public static function method(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }

    /** The route path, without the /api prefix: "/api/posts/3" -> "/posts/3". */
    public static function path(): string
    {
        $uri = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
        if (preg_match('#/api(/.*)?$#', $uri, $m)) {
            $uri = $m[1] ?? '/';
        }
        return rtrim($uri, '/') ?: '/';
    }

    public static function input(): array
    {
        if (self::$body !== null) {
            return self::$body;
        }
        $type = $_SERVER['CONTENT_TYPE'] ?? '';
        if (str_contains($type, 'application/json')) {
            $raw = file_get_contents('php://input') ?: '';
            $data = $raw === '' ? [] : json_decode($raw, true);
            if (!is_array($data)) {
                throw new HttpError(400, 'Requête invalide.');
            }
            return self::$body = $data;
        }
        return self::$body = $_POST;
    }

    public static function header(string $name): string
    {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        return (string) ($_SERVER[$key] ?? '');
    }

    public static function ip(): string
    {
        return (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
    }

    public static function json(mixed $data, ?int $status = null): void
    {
        if ($status !== null) {
            http_response_code($status);
        }
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    }

    public static function created(array $data): array
    {
        http_response_code(201);
        return $data;
    }

    public static function download(string $bytes, string $filename, string $mime): string
    {
        header('Content-Type: ' . $mime);
        header('Content-Disposition: attachment; filename="' . str_replace('"', '', $filename) . '"');
        header('Content-Length: ' . strlen($bytes));
        header('Cache-Control: no-store');
        echo $bytes;
        return self::SENT;
    }
}
