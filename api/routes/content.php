<?php
declare(strict_types=1);

/** @var Router $router */

// ---- Blog -----------------------------------------------------------------

$router->get('/posts', static fn(): array => ['posts' => Posts::list(Auth::isAdmin())]);

$router->get('/posts/{slug}', static function (string $slug): array {
    $post = Posts::find($slug);
    if (!$post || (!$post['published'] && !Auth::isAdmin())) {
        throw HttpError::notFound('Article introuvable.');
    }
    return ['post' => Posts::full($post)];
});

$postInput = static function (): array {
    $v = new V(Http::input());
    $row = [
        'title' => $v->str('title', 1, 200),
        'body' => $v->str('body', 1, 200000),
        'cover_url' => $v->str('cover_url', 0, 500, false) ?: null,
        'published' => $v->bool('published', true) ? 1 : 0,
    ];
    if ($row['cover_url'] && !preg_match('#^(uploads/|/uploads/|https://)#', $row['cover_url'])) {
        $v->error('cover_url', 'Image invalide.');
    }
    $v->check();
    return $row;
};

$router->post('/admin/posts', static function () use ($postInput): array {
    $admin = Auth::requireAdmin();
    $row = $postInput();
    $id = Db::insert('posts', $row + [
        'author_id' => $admin['id'],
        'slug' => Posts::uniqueSlug($row['title']),
        'created_at' => Util::now(),
        'updated_at' => Util::now(),
    ]);
    return Http::created(['post' => Posts::full(Posts::find((string) $id))]);
});

$router->put('/admin/posts/{id}', static function (string $id) use ($postInput): array {
    Auth::requireAdmin();
    if (!Db::val('SELECT id FROM posts WHERE id = ?', [(int) $id])) {
        throw HttpError::notFound('Article introuvable.');
    }
    Db::update('posts', $postInput() + ['updated_at' => Util::now()], 'id = ?', [(int) $id]);
    return ['post' => Posts::full(Posts::find($id))];
});

$router->delete('/admin/posts/{id}', static function (string $id): array {
    Auth::requireAdmin();
    Db::exec('DELETE FROM posts WHERE id = ?', [(int) $id]);
    return ['ok' => true];
});

$router->post('/admin/uploads', static function (): array {
    Auth::requireAdmin();
    return Http::created(['url' => Uploads::storeImage($_FILES['file'] ?? [])]);
});

// ---- Links ("Liens") --------------------------------------------------------

$resourceShape = static fn(array $r): array => [
    'id' => (int) $r['id'],
    'title' => $r['title'],
    'url' => $r['url'],
    'description' => $r['description'] ?? '',
    'created_at' => Util::iso($r['created_at']),
];

$router->get('/resources', static fn(): array => [
    'resources' => array_map($resourceShape, Db::all('SELECT * FROM resources ORDER BY created_at DESC, id DESC')),
]);

$resourceInput = static function (): array {
    $v = new V(Http::input());
    $row = [
        'title' => $v->str('title', 1, 200),
        'url' => $v->url('url'),
        'description' => $v->str('description', 0, 1000, false),
    ];
    $v->check();
    return $row;
};

$router->post('/admin/resources', static function () use ($resourceInput, $resourceShape): array {
    $admin = Auth::requireAdmin();
    $id = Db::insert('resources', $resourceInput() + ['created_by' => $admin['id'], 'created_at' => Util::now(), 'updated_at' => Util::now()]);
    return Http::created(['resource' => $resourceShape(Db::one('SELECT * FROM resources WHERE id = ?', [$id]))]);
});

$router->put('/admin/resources/{id}', static function (string $id) use ($resourceInput, $resourceShape): array {
    Auth::requireAdmin();
    if (!Db::update('resources', $resourceInput() + ['updated_at' => Util::now()], 'id = ?', [(int) $id])
        && !Db::val('SELECT id FROM resources WHERE id = ?', [(int) $id])) {
        throw HttpError::notFound('Lien introuvable.');
    }
    return ['resource' => $resourceShape(Db::one('SELECT * FROM resources WHERE id = ?', [(int) $id]))];
});

$router->delete('/admin/resources/{id}', static function (string $id): array {
    Auth::requireAdmin();
    Db::exec('DELETE FROM resources WHERE id = ?', [(int) $id]);
    return ['ok' => true];
});
