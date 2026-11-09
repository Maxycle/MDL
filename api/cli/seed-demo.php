<?php
declare(strict_types=1);

// LOCAL DEVELOPMENT ONLY. Fills an empty database with demo members, questions, posts and links.
// Every demo account uses the password "demo-mdl-2026".
// Usage:  php api/cli/seed-demo.php
if (PHP_SAPI !== 'cli') {
    exit;
}
require dirname(__DIR__) . '/lib/bootstrap.php';

if (!Db::isSqlite()) {
    fwrite(STDERR, "Refusing to seed demo data into a MySQL database.\n");
    exit(1);
}
if ((int) Db::val('SELECT COUNT(*) FROM users') > 0) {
    fwrite(STDERR, "Database is not empty.\n");
    exit(1);
}

$now = Util::now();
$hash = password_hash('demo-mdl-2026', PASSWORD_DEFAULT);
$user = static function (array $u) use ($hash, $now): int {
    return Db::insert('users', $u + ['password_hash' => $hash, 'created_at' => $now, 'updated_at' => $now]);
};
$level = static fn(int $uid, string $d, string $l) => Db::insert('levels', ['user_id' => $uid, 'domain' => $d, 'level' => $l, 'updated_at' => $now]);

$admin = $user(['email' => 'admin@demo.test', 'username' => 'admin', 'first_name' => 'Claire', 'last_name' => 'Dumont', 'certification' => 'PP', 'is_admin' => 1,
    'intro' => 'Porte-parole et administratrice du site.']);
$level($admin, 'DN', 'SA');
$level($admin, 'EA', 'SA');
$pp2 = $user(['email' => 'pp@demo.test', 'username' => 'bastiat', 'first_name' => 'Julien', 'last_name' => 'Marchal', 'certification' => 'PP',
    'intro' => 'Lecteur de Bastiat depuis vingt ans, porte-parole du mouvement.']);
$level($pp2, 'DN', 'SA');
$level($pp2, 'EA', 'SA');
$mc = $user(['email' => 'mc@demo.test', 'username' => 'menger', 'first_name' => 'Sophie', 'last_name' => 'Arnaud', 'certification' => 'MC',
    'intro' => 'Économiste de formation, je m\'intéresse à la théorie autrichienne du cycle.']);
$level($mc, 'DN', 'SA');
$level($mc, 'EA', 'SA');
$m1 = $user(['email' => 'membre@demo.test', 'username' => 'thomas', 'first_name' => 'Thomas', 'last_name' => 'Lefèvre', 'certification' => 'SM',
    'intro' => 'Nouveau venu, je prépare les questionnaires.']);
$level($m1, 'DN', 'BA');
$user(['email' => 'prive@demo.test', 'username' => 'discret', 'first_name' => 'Hélène', 'last_name' => 'Roux', 'certification' => 'SM', 'profile_public' => 0]);

// Applications waiting for porte-parole votes.
$req = Db::insert('account_requests', ['email' => 'candidat@demo.test', 'first_name' => 'Marc', 'last_name' => 'Garnier',
    'motivations' => "J'ai découvert Rothbard avec « L'Éthique de la liberté » et je souhaite m'engager dans un mouvement qui défend clairement le droit naturel.",
    'status' => 'pending', 'submitted_at' => $now, 'created_at' => $now, 'updated_at' => $now]);
Applications::log($req, null, 'verify');
Applications::log($req, $pp2, 'approve');
$req2 = Db::insert('account_requests', ['email' => 'coopte@demo.test', 'first_name' => 'Léa', 'last_name' => 'Bernard', 'referrer_id' => $mc,
    'motivations' => 'Collègue rencontrée lors d\'une conférence sur Hoppe, très au fait de l\'éthique de l\'argumentation.',
    'status' => 'pending', 'submitted_at' => $now, 'created_at' => $now, 'updated_at' => $now]);
Applications::log($req2, $mc, 'coopt');

// Demo questions (replace them with your own spreadsheet in Gestion > Questions).
$questions = [
    ['DN', 'BA', 'LOW', 'Selon la tradition du droit naturel, d\'où vient la propriété de soi ?', [
        ['De la nature de l\'individu, seul maître de son corps', 100], ['D\'une concession de l\'État', 0], ['D\'un vote majoritaire', 0], ['D\'un contrat social implicite', 20]]],
    ['DN', 'BA', 'LOW', 'Que désigne l\'appropriation originelle (homesteading) ?', [
        ['Acquérir une ressource sans maître en y mêlant son travail', 100], ['Recevoir un bien en héritage', 20], ['Obtenir un titre de l\'administration', 0], ['Occuper le bien d\'autrui', 0]]],
    ['DN', 'BA', 'LOW', 'Que pose le principe de non-agression ?', [
        ['L\'interdiction d\'initier la force contre une personne ou sa propriété', 100], ['L\'interdiction de toute violence, même défensive', 30], ['L\'obligation d\'obéir à la loi en vigueur', 0], ['Le refus de toute intervention militaire', 10]]],
    ['DN', 'BA', 'MID', 'Pour Rothbard, une promesse de servitude volontaire perpétuelle est-elle exécutoire ?', [
        ['Non, la volonté est inaliénable', 100], ['Oui, si elle a été signée librement', 0], ['Oui, mais pour dix ans au plus', 0], ['Seulement avec l\'accord d\'un juge', 10]]],
    ['DN', 'BA', 'MID', 'Quel auteur a fondé les droits de propriété sur l\'éthique de l\'argumentation ?', [
        ['Hans-Hermann Hoppe', 100], ['Murray Rothbard', 30], ['Friedrich Hayek', 0], ['Ayn Rand', 10]]],
    ['DN', 'BA', 'HIGH', 'En théorie libertarienne, la restitution vise d\'abord à…', [
        ['Réparer le préjudice subi par la victime', 100], ['Punir l\'agresseur pour l\'exemple', 20], ['Rééduquer l\'agresseur', 0], ['Indemniser l\'État', 0]]],
    ['EA', 'BA', 'LOW', 'Qui a fondé l\'École autrichienne d\'économie ?', [
        ['Carl Menger', 100], ['Ludwig von Mises', 30], ['Adam Smith', 0], ['John Maynard Keynes', 0]]],
    ['EA', 'BA', 'LOW', 'Selon la théorie subjective de la valeur, la valeur d\'un bien dépend…', [
        ['Des préférences de ceux qui l\'évaluent', 100], ['De la quantité de travail nécessaire', 0], ['De son coût de production', 10], ['Du prix fixé par l\'État', 0]]],
    ['EA', 'BA', 'LOW', 'Comment Mises nomme-t-il la science générale de l\'action humaine ?', [
        ['La praxéologie', 100], ['L\'économétrie', 0], ['La catallaxie', 40], ['La cybernétique', 0]]],
    ['EA', 'BA', 'MID', 'Qu\'est-ce que la préférence temporelle ?', [
        ['Préférer, à satisfaction égale, un bien présent à un bien futur', 100], ['Préférer les biens durables', 10], ['Préférer épargner plutôt que consommer', 20], ['Le temps de travail nécessaire', 0]]],
    ['EA', 'BA', 'MID', 'Pourquoi Mises juge-t-il le calcul économique impossible en socialisme ?', [
        ['Faute de prix de marché pour les moyens de production', 100], ['Faute d\'ordinateurs assez puissants', 0], ['Parce que les planificateurs sont incompétents', 10], ['Parce que la monnaie y est interdite', 20]]],
    ['EA', 'BA', 'HIGH', 'Que désigne l\'effet Cantillon ?', [
        ['Les premiers à recevoir la monnaie nouvelle gagnent aux dépens des derniers', 100], ['La baisse des prix due au progrès technique', 0], ['La fuite des capitaux vers l\'étranger', 0], ['La hausse des salaires en période de boom', 10]]],
];
foreach ($questions as [$d, $l, $diff, $content, $answers]) {
    $qid = Db::insert('questions', ['domain' => $d, 'level' => $l, 'difficulty' => $diff, 'content' => $content, 'active' => 1, 'created_at' => $now, 'updated_at' => $now]);
    foreach ($answers as $i => [$text, $points]) {
        Db::insert('answers', ['question_id' => $qid, 'content' => $text, 'points' => $points, 'position' => $i]);
    }
}

// Blog
Db::insert('posts', ['author_id' => $admin, 'title' => 'Pourquoi nous relançons le Mouvement des Libertariens', 'slug' => 'pourquoi-nous-relancons-le-mouvement',
    'body' => "En 2012 renaissait une première fois le Mouvement des Libertariens en France, plus de dix ans après sa création par des pionniers tels que Bertrand Lemennicier.\n\n## Un cadre de référence\n\nNous voulons donner un cadre clair à la doctrine de la Liberté héritée de ses grands auteurs : **Murray Rothbard**, **Hans-Hermann Hoppe** et bien d'autres.\n\n> La doctrine libertarienne est la seule pensée permettant à tout individu d'envisager un avenir de Liberté, de Paix et de Prospérité.\n\n## La suite\n\nLes questionnaires de certification permettent à chaque membre de mesurer sa maîtrise du droit naturel et de l'économie autrichienne.",
    'published' => 1, 'created_at' => Util::now(-86400 * 3), 'updated_at' => Util::now(-86400 * 3)]);
Db::insert('posts', ['author_id' => $pp2, 'title' => 'Lire Rothbard en 2026', 'slug' => 'lire-rothbard-en-2026',
    'body' => "Par où commencer ? Nous recommandons *L'Éthique de la liberté*, puis *Man, Economy, and State* pour l'économie.\n\n- Chapitres 1 à 6 de l'Éthique : le droit naturel\n- La propriété et l'appropriation originelle\n- La critique de l'État\n\nBonne lecture !",
    'published' => 1, 'created_at' => Util::now(-86400), 'updated_at' => Util::now(-86400)]);

// Links
foreach ([
    ['Mises Institute', 'https://mises.org', 'Bibliothèque en ligne de l\'École autrichienne : livres, cours et articles.'],
    ['Wikibéral', 'https://www.wikiberal.org', 'Encyclopédie libérale et libertarienne en français.'],
    ['Institut Coppet', 'https://www.institutcoppet.org', 'Rééditions de classiques libéraux français.'],
] as [$title, $url, $desc]) {
    Db::insert('resources', ['created_by' => $admin, 'title' => $title, 'url' => $url, 'description' => $desc, 'created_at' => $now, 'updated_at' => $now]);
}

echo "Demo data ready. Log in as admin@demo.test / demo-mdl-2026 (porte-parole + admin).\n";
