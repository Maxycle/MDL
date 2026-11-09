<?php
declare(strict_types=1);

final class Posts
{
    private const SELECT = 'SELECT p.*, u.first_name, u.last_name FROM posts p LEFT JOIN users u ON u.id = p.author_id';

    public static function list(bool $includeDrafts): array
    {
        $where = $includeDrafts ? '' : ' WHERE p.published = 1';
        return array_map([self::class, 'summary'], Db::all(self::SELECT . $where . ' ORDER BY p.created_at DESC'));
    }

    public static function find(string $slugOrId): ?array
    {
        return Db::one(self::SELECT . ' WHERE p.slug = ? OR p.id = ?', [$slugOrId, ctype_digit($slugOrId) ? (int) $slugOrId : 0]);
    }

    public static function summary(array $p): array
    {
        return [
            'id' => (int) $p['id'],
            'title' => $p['title'],
            'slug' => $p['slug'],
            'excerpt' => self::excerpt($p['body']),
            'cover_url' => $p['cover_url'],
            'published' => (bool) $p['published'],
            'author' => $p['first_name'] ? trim("{$p['first_name']} {$p['last_name']}") : null,
            'created_at' => Util::iso($p['created_at']),
            'updated_at' => Util::iso($p['updated_at']),
        ];
    }

    public static function full(array $p): array
    {
        return self::summary($p) + ['body' => $p['body']];
    }

    public static function uniqueSlug(string $title, int $exceptId = 0): string
    {
        $base = Util::slug($title);
        $slug = $base;
        for ($i = 2; Db::val('SELECT id FROM posts WHERE slug = ? AND id <> ?', [$slug, $exceptId]); $i++) {
            $slug = "$base-$i";
        }
        return $slug;
    }

    /** Plain-text preview of a Markdown body. */
    public static function excerpt(string $markdown, int $length = 220): string
    {
        $text = preg_replace([
            '/!\[[^\]]*\]\([^)]*\)/',   // images
            '/\[([^\]]*)\]\([^)]*\)/',  // links -> their text
            '/<[^>]+>/',                // html tags
            '/^[#>\-\*\+\s]+/m',        // headings, quotes, bullets
            '/[*_`~]/',                 // emphasis marks
        ], ['', '$1', '', '', ''], $markdown) ?? '';
        $text = trim(preg_replace('/\s+/', ' ', $text) ?? '');
        return mb_strlen($text) > $length ? rtrim(mb_substr($text, 0, $length)) . '…' : $text;
    }
}
