<?php
declare(strict_types=1);

/**
 * Question images. Members never receive the image address: the API serves the picture itself,
 * with a horizontal band (by default the bottom of the image, where the commentary is) blurred
 * until the member has validated an answer to that question. The blur is applied here, on the
 * server, so the hidden text cannot be read from the page or from the network.
 *
 * Remote images are downloaded once and kept in <storage_dir>/question-images/.
 */
final class QuestionImages
{
    private const MAX_BYTES = 12 * 1024 * 1024;
    private const MAX_PIXELS = 40_000_000;
    private const MAX_WIDTH = 1600;
    private const MIME = [IMAGETYPE_JPEG => 'image/jpeg', IMAGETYPE_PNG => 'image/png', IMAGETYPE_GIF => 'image/gif', IMAGETYPE_WEBP => 'image/webp'];

    /** http(s) addresses only. */
    public static function isValidUrl(string $url): bool
    {
        return strlen($url) <= 2048
            && filter_var($url, FILTER_VALIDATE_URL) !== false
            && in_array(strtolower((string) parse_url($url, PHP_URL_SCHEME)), ['http', 'https'], true);
    }

    /** Short token that changes with the image or the blurred band, so browsers never show a stale copy. */
    public static function version(string $url): string
    {
        $s = Settings::get();
        return substr(sha1("$url|{$s['image_blur_top']}|{$s['image_blur_bottom']}"), 0, 12);
    }

    /** Outputs the image, clear or blurred. $top and $bottom override the settings (admin preview). */
    public static function send(string $url, bool $blurred, ?int $top = null, ?int $bottom = null): string
    {
        $original = self::original($url);
        if ($blurred) {
            $s = Settings::get();
            $path = self::blurred($original, $top ?? $s['image_blur_top'], $bottom ?? $s['image_blur_bottom']);
            $mime = 'image/jpeg';
        } else {
            [$path, $mime] = self::clear($original);
        }
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($path));
        header('Cache-Control: private, max-age=86400');
        header('X-Content-Type-Options: nosniff');
        readfile($path);
        return Http::SENT;
    }

    private static function original(string $url): string
    {
        $file = self::dir() . '/' . sha1($url) . '.img';
        if (!is_file($file)) {
            $bytes = self::download($url);
            $info = @getimagesizefromstring($bytes);
            if (!$info || !isset(self::MIME[$info[2]])) {
                throw new HttpError(502, 'Cette adresse ne mène pas à une image JPG, PNG, GIF ou WebP.');
            }
            if ($info[0] * $info[1] > self::MAX_PIXELS) {
                throw new HttpError(502, 'Image trop grande.');
            }
            self::write($file, $bytes);
        }
        return $file;
    }

    private static function download(string $url): string
    {
        if (!self::isValidUrl($url)) {
            throw new HttpError(422, 'Adresse d\'image invalide.');
        }
        $context = stream_context_create(['http' => [
            'method' => 'GET',
            'follow_location' => 1,
            'max_redirects' => 5,
            'timeout' => 20,
            'ignore_errors' => true,
            'header' => "Accept: image/jpeg,image/png,image/webp,image/gif;q=0.9,*/*;q=0.5\r\nUser-Agent: libertarien.net question images\r\n",
        ]]);
        $stream = @fopen($url, 'rb', false, $context);
        if (!$stream) {
            throw new HttpError(502, 'Image injoignable : vérifiez son adresse.');
        }
        $meta = stream_get_meta_data($stream);
        $bytes = (string) stream_get_contents($stream, self::MAX_BYTES + 1);
        fclose($stream);
        $status = 0;
        foreach ($meta['wrapper_data'] ?? [] as $line) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', (string) $line, $m)) {
                $status = (int) $m[1]; // after redirects, the last status line is the one that counts
            }
        }
        if ($status !== 200) {
            throw new HttpError(502, "Image injoignable (le site d'origine répond $status).");
        }
        if (strlen($bytes) > self::MAX_BYTES) {
            throw new HttpError(502, 'Image trop lourde (12 Mo maximum).');
        }
        return $bytes;
    }

    private static function blurred(string $original, int $top, int $bottom): string
    {
        $top = max(0, min(99, $top));
        $bottom = max($top + 1, min(100, $bottom));
        $file = substr($original, 0, -4) . "-blur-$top-$bottom.jpg";
        if (is_file($file)) {
            return $file;
        }
        $img = self::load($original);
        $w = imagesx($img);
        $h = imagesy($img);
        $y0 = (int) floor($h * $top / 100);
        $bandH = max(1, min($h, (int) ceil($h * $bottom / 100)) - $y0);
        // Shrink the band to a handful of pixels and stretch it back: letters become soft smudges.
        $small = imagecreatetruecolor(max(2, intdiv($w, 28)), max(2, intdiv($bandH, 28)));
        imagecopyresampled($small, $img, 0, 0, 0, $y0, imagesx($small), imagesy($small), $w, $bandH);
        $band = imagescale($small, $w, $bandH, IMG_BILINEAR_FIXED);
        if (!$band) {
            throw new RuntimeException('imagescale failed');
        }
        for ($i = 0; $i < 6; $i++) {
            imagefilter($band, IMG_FILTER_GAUSSIAN_BLUR);
        }
        imagecopy($img, $band, 0, $y0, 0, 0, $w, $bandH);
        self::saveJpeg($img, $file);
        return $file;
    }

    /** The original, or a lighter copy when it is wider than the page needs. */
    private static function clear(string $original): array
    {
        $info = getimagesize($original);
        if ($info[0] <= self::MAX_WIDTH) {
            return [$original, self::MIME[$info[2]]];
        }
        $file = substr($original, 0, -4) . '-clear.jpg';
        if (!is_file($file)) {
            self::saveJpeg(self::load($original), $file);
        }
        return [$file, 'image/jpeg'];
    }

    /** Decodes, scales down to MAX_WIDTH and flattens transparency onto white. */
    private static function load(string $file): GdImage
    {
        $src = @imagecreatefromstring((string) file_get_contents($file));
        if (!$src) {
            throw new HttpError(502, 'Image illisible.');
        }
        $w = imagesx($src);
        $h = imagesy($src);
        $scale = min(1, self::MAX_WIDTH / $w);
        $nw = max(1, (int) round($w * $scale));
        $nh = max(1, (int) round($h * $scale));
        $img = imagecreatetruecolor($nw, $nh);
        imagefill($img, 0, 0, imagecolorallocate($img, 255, 255, 255));
        imagecopyresampled($img, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
        return $img;
    }

    private static function saveJpeg(GdImage $img, string $file): void
    {
        imageinterlace($img, true);
        ob_start();
        imagejpeg($img, null, 82);
        self::write($file, (string) ob_get_clean());
    }

    /** Write then rename, so a half-written file is never served. */
    private static function write(string $file, string $bytes): void
    {
        $tmp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp';
        file_put_contents($tmp, $bytes);
        rename($tmp, $file);
    }

    private static function dir(): string
    {
        $dir = Config::storageDir() . '/question-images';
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        return $dir;
    }
}
