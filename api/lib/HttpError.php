<?php
declare(strict_types=1);

/** Thrown anywhere in a handler to return a JSON error with the given status. */
final class HttpError extends RuntimeException
{
    public function __construct(public readonly int $status, string $message, public readonly array $fields = [])
    {
        parent::__construct($message);
    }

    public static function notFound(string $message = 'Ressource introuvable.'): self
    {
        return new self(404, $message);
    }

    public static function forbidden(string $message = 'Accès refusé.'): self
    {
        return new self(403, $message);
    }

    public static function conflict(string $message): self
    {
        return new self(409, $message);
    }
}
