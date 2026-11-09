<?php
declare(strict_types=1);

spl_autoload_register(static function (string $class): void {
    $file = __DIR__ . '/' . $class . '.php';
    if (is_file($file)) {
        require $file;
    }
});

date_default_timezone_set('UTC');
error_reporting(E_ALL);
ini_set('display_errors', '0');
mb_internal_encoding('UTF-8');

set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

set_exception_handler(static function (Throwable $e): void {
    if (PHP_SAPI === 'cli') {
        fwrite(STDERR, 'Error: ' . $e->getMessage() . ' (' . basename($e->getFile()) . ':' . $e->getLine() . ")\n");
        exit(1);
    }
    if ($e instanceof HttpError) {
        $body = ['error' => $e->getMessage()];
        if ($e->fields) {
            $body['fields'] = $e->fields;
        }
        Http::json($body, $e->status);
        return;
    }
    Log::error($e);
    $body = ['error' => 'Erreur interne du serveur. Réessayez dans un instant.'];
    if (Config::get('debug')) {
        $body['debug'] = $e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine();
    }
    Http::json($body, 500);
});

Config::load(dirname(__DIR__));
