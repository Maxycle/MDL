<?php
declare(strict_types=1);

/**
 * Cookie sessions stored in the database.
 * The browser holds a random token in an HttpOnly cookie; the server keeps only its SHA-256.
 * No JWT, nothing readable by JavaScript.
 */
final class Auth
{
    private const COOKIE = 'mdl_sid';
    private const LIFETIME = 30 * 86400;

    private static array|null|false $user = false;

    public static function user(): ?array
    {
        if (self::$user !== false) {
            return self::$user;
        }
        self::$user = null;
        $token = $_COOKIE[self::COOKIE] ?? null;
        if (!Util::isToken($token)) {
            return null;
        }
        $sid = Util::hash($token);
        $row = Db::one('SELECT s.expires_at AS session_expires_at, u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?', [$sid]);
        if (!$row || Util::ts($row['session_expires_at']) < time()) {
            if ($row) {
                Db::exec('DELETE FROM sessions WHERE id = ?', [$sid]);
            }
            self::setCookie('', time() - 3600);
            return null;
        }
        // Sliding expiry, refreshed at most once a day.
        if (Util::ts($row['session_expires_at']) - time() < self::LIFETIME - 86400) {
            Db::exec('UPDATE sessions SET expires_at = ? WHERE id = ?', [Util::now(self::LIFETIME), $sid]);
            self::setCookie($token, time() + self::LIFETIME);
        }
        unset($row['session_expires_at']);
        return self::$user = Users::cast($row);
    }

    public static function login(int $userId): void
    {
        $token = Util::token();
        Db::insert('sessions', [
            'id' => Util::hash($token),
            'user_id' => $userId,
            'created_at' => Util::now(),
            'expires_at' => Util::now(self::LIFETIME),
        ]);
        self::setCookie($token, time() + self::LIFETIME);
        self::$user = false;
        $_COOKIE[self::COOKIE] = $token;
        if (random_int(1, 50) === 1) {
            Db::exec('DELETE FROM sessions WHERE expires_at < ?', [Util::now()]);
        }
    }

    public static function logout(): void
    {
        $token = $_COOKIE[self::COOKIE] ?? null;
        if (Util::isToken($token)) {
            Db::exec('DELETE FROM sessions WHERE id = ?', [Util::hash($token)]);
        }
        self::setCookie('', time() - 3600);
        self::$user = null;
    }

    public static function logoutEverywhere(int $userId): void
    {
        Db::exec('DELETE FROM sessions WHERE user_id = ?', [$userId]);
    }

    /**
     * Blocks cross-site form posts: the session cookie is SameSite=Lax, and every
     * write must carry a custom header that only our own fetch() calls send.
     */
    public static function checkCsrf(): void
    {
        if (Http::header('X-Requested-With') !== 'mdl') {
            throw HttpError::forbidden('Requête refusée.');
        }
    }

    public static function requireUser(): array
    {
        $user = self::user();
        if (!$user) {
            throw new HttpError(401, 'Connectez-vous pour continuer.');
        }
        return $user;
    }

    /** Porte-parole only: voting on applications is their prerogative. */
    public static function requirePP(): array
    {
        $user = self::requireUser();
        if ($user['certification'] !== 'PP') {
            throw HttpError::forbidden('Réservé aux porte-parole.');
        }
        return $user;
    }

    /** Porte-parole or administrator. */
    public static function requireStaff(): array
    {
        $user = self::requireUser();
        if ($user['certification'] !== 'PP' && !$user['is_admin']) {
            throw HttpError::forbidden('Réservé aux porte-parole et administrateurs.');
        }
        return $user;
    }

    public static function requireAdmin(): array
    {
        $user = self::requireUser();
        if (!$user['is_admin']) {
            throw HttpError::forbidden('Réservé aux administrateurs.');
        }
        return $user;
    }

    public static function isAdmin(): bool
    {
        return (bool) (self::user()['is_admin'] ?? false);
    }

    private static function setCookie(string $value, int $expires): void
    {
        if (PHP_SAPI === 'cli') {
            return;
        }
        setcookie(self::COOKIE, $value, [
            'expires' => $expires,
            'path' => (string) Config::get('cookie_path', '/'),
            'secure' => (bool) Config::get('cookie_secure', true),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }
}
