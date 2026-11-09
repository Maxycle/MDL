<?php
declare(strict_types=1);

/**
 * Input validation. Collects one message per field, then check() throws a 422
 * with all of them so the form can show each error under its field.
 * Missing keys return null and are only an error when required.
 */
final class V
{
    private array $errors = [];

    public function __construct(private readonly array $data)
    {
    }

    public function has(string $key): bool
    {
        return array_key_exists($key, $this->data);
    }

    public function str(string $key, int $min = 1, int $max = 255, bool $required = true): ?string
    {
        $v = $this->data[$key] ?? null;
        if ($v === null || (is_string($v) && trim($v) === '')) {
            if ($required) {
                $this->errors[$key] = 'Ce champ est requis.';
            }
            return $required ? null : '';
        }
        if (!is_string($v) && !is_int($v) && !is_float($v)) {
            $this->errors[$key] = 'Valeur invalide.';
            return null;
        }
        $v = trim((string) $v);
        $len = mb_strlen($v);
        if ($len < $min) {
            $this->errors[$key] = "Au moins $min caractères.";
        } elseif ($len > $max) {
            $this->errors[$key] = "$max caractères maximum.";
        }
        return $v;
    }

    public function email(string $key = 'email'): ?string
    {
        $v = $this->str($key, 3, 190);
        if ($v !== null && !isset($this->errors[$key]) && !filter_var($v, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$key] = 'Adresse email invalide.';
        }
        return $v === null ? null : mb_strtolower($v);
    }

    public function username(string $key = 'username'): ?string
    {
        $v = $this->str($key, 3, 30);
        if ($v !== null && !isset($this->errors[$key]) && !preg_match('/^[\p{L}\p{N}._-]+$/u', $v)) {
            $this->errors[$key] = 'Lettres, chiffres, points, tirets et soulignés uniquement.';
        }
        return $v;
    }

    public function password(string $key = 'password'): ?string
    {
        $v = $this->data[$key] ?? null;
        if (!is_string($v) || $v === '') {
            $this->errors[$key] = 'Ce champ est requis.';
            return null;
        }
        if (mb_strlen($v) < 8) {
            $this->errors[$key] = 'Au moins 8 caractères.';
        } elseif (mb_strlen($v) > 200) {
            $this->errors[$key] = '200 caractères maximum.';
        }
        return $v;
    }

    public function int(string $key, int $min, int $max, bool $required = true): ?int
    {
        $v = $this->data[$key] ?? null;
        if ($v === null || $v === '') {
            if ($required) {
                $this->errors[$key] = 'Ce champ est requis.';
            }
            return null;
        }
        if (filter_var($v, FILTER_VALIDATE_INT) === false) {
            $this->errors[$key] = 'Nombre entier attendu.';
            return null;
        }
        $v = (int) $v;
        if ($v < $min || $v > $max) {
            $this->errors[$key] = "Entre $min et $max.";
        }
        return $v;
    }

    public function bool(string $key, bool $default = false): bool
    {
        return array_key_exists($key, $this->data) ? Util::bool($this->data[$key]) : $default;
    }

    public function in(string $key, array $allowed, bool $required = true): ?string
    {
        $v = $this->data[$key] ?? null;
        if ($v === null || $v === '') {
            if ($required) {
                $this->errors[$key] = 'Ce champ est requis.';
            }
            return null;
        }
        if (!in_array($v, $allowed, true)) {
            $this->errors[$key] = 'Valeur invalide.';
            return null;
        }
        return $v;
    }

    /** http(s) links only, so "javascript:" URLs can never reach a page. */
    public function url(string $key, bool $required = true): ?string
    {
        $v = $this->str($key, 1, 500, $required);
        if ($v === null || $v === '' || isset($this->errors[$key])) {
            return $v === '' ? null : $v;
        }
        $scheme = strtolower((string) parse_url($v, PHP_URL_SCHEME));
        if (!filter_var($v, FILTER_VALIDATE_URL) || !in_array($scheme, ['http', 'https'], true)) {
            $this->errors[$key] = 'Lien invalide (doit commencer par https://).';
        }
        return $v;
    }

    public function error(string $key, string $message): void
    {
        $this->errors[$key] ??= $message;
    }

    public function check(): void
    {
        if ($this->errors) {
            throw new HttpError(422, 'Vérifiez les champs indiqués.', $this->errors);
        }
    }
}
