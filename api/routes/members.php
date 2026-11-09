<?php
declare(strict_types=1);

/** @var Router $router */

// Public directory: only members who chose a public profile, and no email addresses.
$router->get('/members', static function (): array {
    $rows = Users::sortByName(Db::all('SELECT id, username, first_name, last_name, intro, certification, created_at FROM users WHERE profile_public = 1'));
    $levels = Users::levelsFor(array_column($rows, 'id'));
    return ['members' => array_map(static fn(array $u): array => Users::publicShape($u, $levels[(int) $u['id']]), $rows)];
});

// ---- Porte-parole / admin member management -----------------------------------

$router->get('/admin/members', static function (): array {
    Auth::requireStaff();
    $rows = Users::sortByName(Db::all('SELECT * FROM users'));
    $levels = Users::levelsFor(array_column($rows, 'id'));
    return ['members' => array_map(static fn(array $u): array => Users::staffShape($u, $levels[(int) $u['id']]), $rows)];
});

$findMember = static function (string $id): array {
    $member = Users::find((int) $id);
    if (!$member) {
        throw HttpError::notFound('Membre introuvable.');
    }
    return $member;
};

$router->put('/admin/members/{id}/certification', static function (string $id) use ($findMember): array {
    Auth::requireStaff();
    $member = $findMember($id);
    $v = new V(Http::input());
    $cert = $v->in('certification', Users::CERTIFICATIONS);
    $v->check();
    if ($member['certification'] === 'PP' && $cert !== 'PP' && (int) Db::val("SELECT COUNT(*) FROM users WHERE certification = 'PP'") <= 1) {
        throw HttpError::conflict('Il doit rester au moins un porte-parole pour examiner les candidatures.');
    }
    $row = ['certification' => $cert, 'updated_at' => Util::now()];
    if ($cert === 'PP') {
        $row['wants_pp'] = 0;
    }
    Db::update('users', $row, 'id = ?', [$member['id']]);
    Applications::recheckPending();
    return ['ok' => true];
});

$router->delete('/admin/members/{id}/levels/{domain}', static function (string $id, string $domain) use ($findMember): array {
    Auth::requireStaff();
    $member = $findMember($id);
    if (!in_array($domain, Users::DOMAINS, true)) {
        throw HttpError::notFound();
    }
    Db::tx(static function () use ($member, $domain): void {
        Db::exec('DELETE FROM levels WHERE user_id = ? AND domain = ?', [$member['id'], $domain]);
        Db::exec('DELETE FROM attempts WHERE user_id = ? AND domain = ?', [$member['id'], $domain]);
    });
    return ['ok' => true];
});

$router->put('/admin/members/{id}/admin', static function (string $id) use ($findMember): array {
    $me = Auth::requireAdmin();
    $member = $findMember($id);
    $makeAdmin = Util::bool(Http::input()['is_admin'] ?? false);
    if (!$makeAdmin && $member['is_admin'] && (int) Db::val('SELECT COUNT(*) FROM users WHERE is_admin = 1') <= 1) {
        throw HttpError::conflict('Il doit rester au moins un administrateur.');
    }
    Db::update('users', ['is_admin' => $makeAdmin ? 1 : 0, 'updated_at' => Util::now()], 'id = ?', [$member['id']]);
    return ['ok' => true, 'self' => $member['id'] === $me['id']];
});

$router->delete('/admin/members/{id}', static function (string $id) use ($findMember): array {
    $me = Auth::requireAdmin();
    $member = $findMember($id);
    if ($member['id'] === $me['id']) {
        throw HttpError::conflict('Vous ne pouvez pas supprimer votre propre compte ici.');
    }
    if ($member['certification'] === 'PP' && (int) Db::val("SELECT COUNT(*) FROM users WHERE certification = 'PP'") <= 1) {
        throw HttpError::conflict('Impossible de supprimer le dernier porte-parole.');
    }
    Db::exec('DELETE FROM users WHERE id = ?', [$member['id']]);
    Applications::recheckPending();
    return ['ok' => true];
});

$router->get('/admin/members/export', static function (): string {
    Auth::requireStaff();
    $labels = ['beginner' => 'Débutant', 'BA' => 'Bases Acquises', 'SA' => 'Sait Analyser', 'SE' => 'Sait Extrapoler'];
    $certs = ['SM' => 'Simple membre', 'MC' => 'Membre certifié', 'PP' => 'Porte-parole'];
    $rows = Users::sortByName(Db::all('SELECT * FROM users'));
    $levels = Users::levelsFor(array_column($rows, 'id'));
    $sheet = [['ID', 'Prénom', 'Nom', 'Email', 'Nom d\'utilisateur', 'Certification', 'Droit Naturel', 'École Autrichienne', 'Administrateur', 'Profil public', 'Souhaite devenir porte-parole', 'Inscrit le']];
    foreach ($rows as $u) {
        $l = $levels[(int) $u['id']];
        $sheet[] = [
            (int) $u['id'], $u['first_name'], $u['last_name'], $u['email'], $u['username'],
            $certs[$u['certification']] ?? $u['certification'], $labels[$l['DN']] ?? $l['DN'], $labels[$l['EA']] ?? $l['EA'],
            $u['is_admin'] ? 'oui' : 'non', $u['profile_public'] ? 'oui' : 'non', $u['wants_pp'] ? 'oui' : 'non',
            substr($u['created_at'], 0, 10),
        ];
    }
    return Http::download(Xlsx::write($sheet, 'Membres'), 'membres-' . gmdate('Y-m-d') . '.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});
