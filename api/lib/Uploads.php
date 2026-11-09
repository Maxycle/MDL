<?php
declare(strict_types=1);

/** Blog images: validated as real images, renamed randomly, stored under uploads/YYYY/MM/. */
final class Uploads
{
    private const MAX_BYTES = 6 * 1024 * 1024;
    private const TYPES = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_GIF => 'gif', IMAGETYPE_WEBP => 'webp'];

    public static function storeImage(array $file): string
    {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            $tooBig = in_array($file['error'] ?? 0, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true);
            throw new HttpError(422, $tooBig ? 'Image trop lourde (6 Mo maximum).' : 'Aucune image reçue.');
        }
        if ($file['size'] > self::MAX_BYTES) {
            throw new HttpError(422, 'Image trop lourde (6 Mo maximum).');
        }
        $info = @getimagesize($file['tmp_name']);
        if (!$info || !isset(self::TYPES[$info[2]])) {
            throw new HttpError(422, 'Format non pris en charge : JPG, PNG, GIF ou WebP.');
        }
        $root = self::dir();
        $sub = gmdate('Y/m');
        if (!is_dir("$root/$sub")) {
            mkdir("$root/$sub", 0775, true);
        }
        $name = bin2hex(random_bytes(10)) . '.' . self::TYPES[$info[2]];
        $dest = "$root/$sub/$name";
        $moved = is_uploaded_file($file['tmp_name']) ? move_uploaded_file($file['tmp_name'], $dest) : rename($file['tmp_name'], $dest);
        if (!$moved) {
            throw new RuntimeException("Could not store upload in $dest");
        }
        // Relative to the site folder ("uploads/…"), so content keeps working if the site moves.
        return rtrim((string) Config::get('uploads_url', 'uploads'), '/') . "/$sub/$name";
    }

    private static function dir(): string
    {
        $dir = rtrim((string) Config::get('uploads_dir'), '/\\');
        if ($dir === '') {
            throw new RuntimeException('uploads_dir is not configured');
        }
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        // Belt and braces: never execute scripts from the uploads folder.
        if (!is_file("$dir/.htaccess")) {
            file_put_contents("$dir/.htaccess", "Options -Indexes -ExecCGI\n<FilesMatch \"\\.(?i:php\\d?|phtml|phar|pl|py|cgi|sh)$\">\n  Require all denied\n</FilesMatch>\n");
        }
        return $dir;
    }

    /** `php -S` only: serve /uploads/... files, since there is no Apache in development. */
    public static function serveDev(): bool
    {
        $path = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '');
        if (!str_starts_with($path, '/uploads/')) {
            return false;
        }
        $file = realpath(rtrim((string) Config::get('uploads_dir'), '/\\') . substr($path, 8));
        $root = realpath((string) Config::get('uploads_dir'));
        if (!$file || !$root || !str_starts_with($file, $root) || !is_file($file)) {
            http_response_code(404);
            return true;
        }
        $type = @getimagesize($file)['mime'] ?? 'application/octet-stream';
        header('Content-Type: ' . $type);
        readfile($file);
        return true;
    }
}
