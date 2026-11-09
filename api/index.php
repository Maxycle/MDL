<?php
declare(strict_types=1);

// Single entry point for the JSON API. Apache sends every /api/* request here (see .htaccess).
require __DIR__ . '/lib/bootstrap.php';

// Local development only: `php -S` has no Apache, so serve uploaded images from here.
if (PHP_SAPI === 'cli-server' && Uploads::serveDev()) {
    return;
}

$router = new Router();
foreach (['auth', 'me', 'content', 'members', 'applications', 'quiz', 'admin'] as $group) {
    require __DIR__ . "/routes/$group.php";
}
$router->dispatch(Http::method(), Http::path());
