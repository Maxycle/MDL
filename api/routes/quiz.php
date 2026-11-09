<?php
declare(strict_types=1);

/** @var Router $router */

$router->get('/quiz', static fn(): array => Quiz::overview(Auth::requireUser()));

$router->post('/quiz/attempts', static function (): array {
    $user = Auth::requireUser();
    $in = Http::input();
    return Http::created(['attempt' => Quiz::start($user, (string) ($in['domain'] ?? ''), (string) ($in['level'] ?? ''))]);
});

$router->get('/quiz/attempts/current', static function (): array {
    $user = Auth::requireUser();
    Quiz::closeExpired($user['id']);
    $attempt = Quiz::current($user['id']);
    return ['attempt' => $attempt ? Quiz::payload($attempt) : null];
});

$router->put('/quiz/attempts/{id}/answers', static function (string $id): array {
    $user = Auth::requireUser();
    $in = Http::input();
    $answerId = isset($in['answer_id']) && $in['answer_id'] !== null ? (int) $in['answer_id'] : null;
    Quiz::saveAnswer(Quiz::owned($user, (int) $id), (int) ($in['question_id'] ?? 0), $answerId);
    return ['ok' => true];
});

$router->post('/quiz/attempts/{id}/finish', static function (string $id): array {
    $user = Auth::requireUser();
    $result = Quiz::finish(Quiz::owned($user, (int) $id));
    $fresh = Users::find($user['id']);
    return [
        'result' => $result,
        'levels' => Users::levelsFor([$user['id']])[$user['id']],
        'certification' => $fresh['certification'],
        'user' => Users::self($fresh),
    ];
});
