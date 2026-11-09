<?php
declare(strict_types=1);

final class Users
{
    public const CERTIFICATIONS = ['SM', 'MC', 'PP'];
    public const DOMAINS = ['DN', 'EA'];

    public static function find(int $id): ?array
    {
        $row = Db::one('SELECT * FROM users WHERE id = ?', [$id]);
        return $row ? self::cast($row) : null;
    }

    public static function cast(array $u): array
    {
        $u['id'] = (int) $u['id'];
        foreach (['is_admin', 'profile_public', 'wants_pp'] as $flag) {
            if (array_key_exists($flag, $u)) {
                $u[$flag] = (bool) $u[$flag];
            }
        }
        return $u;
    }

    /** @return array<int, array{DN: string, EA: string}> */
    public static function levelsFor(array $ids): array
    {
        $out = [];
        foreach ($ids as $id) {
            $out[(int) $id] = ['DN' => 'beginner', 'EA' => 'beginner'];
        }
        if (!$ids) {
            return $out;
        }
        $list = implode(',', array_map('intval', $ids));
        foreach (Db::all("SELECT user_id, domain, level FROM levels WHERE user_id IN ($list)") as $r) {
            $out[(int) $r['user_id']][$r['domain']] = $r['level'];
        }
        return $out;
    }

    /** What anyone may see about a member who made their profile public. */
    public static function publicShape(array $u, ?array $levels = null): array
    {
        return [
            'id' => (int) $u['id'],
            'username' => $u['username'],
            'first_name' => $u['first_name'],
            'last_name' => $u['last_name'],
            'intro' => $u['intro'] ?? '',
            'certification' => $u['certification'],
            'levels' => $levels ?? self::levelsFor([$u['id']])[(int) $u['id']],
            'member_since' => Util::iso($u['created_at'] ?? null),
        ];
    }

    /** The signed-in member's own data. */
    public static function self(array $u): array
    {
        $u = self::cast($u);
        return self::publicShape($u) + [
            'email' => $u['email'],
            'is_admin' => $u['is_admin'],
            'profile_public' => $u['profile_public'],
            'wants_pp' => $u['wants_pp'],
        ];
    }

    /** Full row for porte-parole / admin screens. */
    public static function staffShape(array $u, array $levels): array
    {
        $u = self::cast($u);
        return self::publicShape($u, $levels) + [
            'email' => $u['email'],
            'is_admin' => $u['is_admin'],
            'profile_public' => $u['profile_public'],
            'wants_pp' => $u['wants_pp'],
        ];
    }

    public static function sortByName(array $rows): array
    {
        usort($rows, static fn(array $a, array $b): int =>
            [Util::ascii($a['last_name']), Util::ascii($a['first_name'])] <=> [Util::ascii($b['last_name']), Util::ascii($b['first_name'])]);
        return $rows;
    }

    public static function ppEmails(): array
    {
        return array_column(Db::all("SELECT email FROM users WHERE certification = 'PP'"), 'email');
    }

    public static function usernameTaken(string $username, int $exceptId = 0): bool
    {
        return (bool) Db::val('SELECT id FROM users WHERE LOWER(username) = ? AND id <> ?', [mb_strtolower($username), $exceptId]);
    }

    public static function emailTaken(string $email, int $exceptId = 0): bool
    {
        return (bool) Db::val('SELECT id FROM users WHERE LOWER(email) = ? AND id <> ?', [mb_strtolower($email), $exceptId]);
    }
}
