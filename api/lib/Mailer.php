<?php
declare(strict_types=1);

/**
 * Sends multipart (text + HTML) emails with no library.
 * Transports (config mail.transport):
 *   smtp — authenticated SMTP, e.g. a SiteGround mailbox (best deliverability)
 *   mail — PHP's mail() function
 *   log  — writes the email to storage/mail.log (local development)
 * A failed email is logged and never breaks the request that triggered it.
 */
final class Mailer
{
    /** @return bool whether the email was handed over successfully */
    public static function send(string $to, string $subject, string $html, string $text): bool
    {
        try {
            $transport = (string) Config::get('mail.transport', 'log');
            [$headers, $body] = self::build($to, $subject, $html, $text);
            match ($transport) {
                'smtp' => self::smtp($to, $headers, $body),
                'mail' => self::phpMail($to, $headers, $body),
                default => Log::write('mail.log', sprintf("==== %s\nTo: %s\nSubject: %s\n\n%s\n\n", gmdate('c'), $to, $subject, $text)),
            };
            return true;
        } catch (Throwable $e) {
            Log::error($e);
            return false;
        }
    }

    private static function build(string $to, string $subject, string $html, string $text): array
    {
        $from = (string) Config::get('mail.from', 'noreply@localhost');
        $name = (string) Config::get('mail.from_name', 'Mouvement des Libertariens');
        $domain = substr((string) strrchr($from, '@'), 1) ?: 'localhost';
        $boundary = 'mdl-' . bin2hex(random_bytes(12));
        $headers = [
            'Date' => date('r'),
            'From' => self::encode($name) . " <$from>",
            'To' => $to,
            'Subject' => self::encode($subject),
            'Message-ID' => '<' . bin2hex(random_bytes(16)) . "@$domain>",
            'MIME-Version' => '1.0',
            'Content-Type' => "multipart/alternative; boundary=\"$boundary\"",
        ];
        $body = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($text))
            . "--$boundary\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($html))
            . "--$boundary--\r\n";
        return [$headers, $body];
    }

    private static function encode(string $value): string
    {
        return preg_match('/[^\x20-\x7e]/', $value) ? '=?UTF-8?B?' . base64_encode($value) . '?=' : $value;
    }

    private static function phpMail(string $to, array $headers, string $body): void
    {
        $subject = $headers['Subject'];
        unset($headers['To'], $headers['Subject']);
        $lines = [];
        foreach ($headers as $k => $v) {
            $lines[] = "$k: $v";
        }
        if (!mail($to, $subject, $body, implode("\r\n", $lines), '-f' . Config::get('mail.from'))) {
            throw new RuntimeException('mail() returned false');
        }
    }

    private static function smtp(string $to, array $headers, string $body): void
    {
        $host = (string) Config::get('mail.host');
        $port = (int) Config::get('mail.port', 465);
        $encryption = (string) Config::get('mail.encryption', 'ssl');
        $remote = ($encryption === 'ssl' ? 'ssl://' : 'tcp://') . "$host:$port";
        $context = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
        $fp = @stream_socket_client($remote, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $context);
        if (!$fp) {
            throw new RuntimeException("SMTP connection to $remote failed: $errstr");
        }
        stream_set_timeout($fp, 20);

        $expect = static function (array $codes, string $step) use ($fp): void {
            $response = '';
            while (($line = fgets($fp, 1024)) !== false) {
                $response .= $line;
                if (strlen($line) < 4 || $line[3] === ' ') {
                    break;
                }
            }
            if (!in_array((int) substr($response, 0, 3), $codes, true)) {
                throw new RuntimeException("SMTP $step failed: " . trim($response));
            }
        };
        $send = static function (string $command) use ($fp): void {
            fwrite($fp, $command . "\r\n");
        };

        $expect([220], 'greeting');
        $helo = 'EHLO ' . (gethostname() ?: 'localhost');
        $send($helo);
        $expect([250], 'EHLO');
        if ($encryption === 'tls') {
            $send('STARTTLS');
            $expect([220], 'STARTTLS');
            if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('SMTP STARTTLS negotiation failed');
            }
            $send($helo);
            $expect([250], 'EHLO');
        }
        if ($user = Config::get('mail.username')) {
            $send('AUTH LOGIN');
            $expect([334], 'AUTH');
            $send(base64_encode((string) $user));
            $expect([334], 'AUTH user');
            $send(base64_encode((string) Config::get('mail.password')));
            $expect([235], 'AUTH password');
        }
        $send('MAIL FROM:<' . Config::get('mail.from') . '>');
        $expect([250], 'MAIL FROM');
        $send("RCPT TO:<$to>");
        $expect([250, 251], 'RCPT TO');
        $send('DATA');
        $expect([354], 'DATA');
        $message = '';
        foreach ($headers as $k => $v) {
            $message .= "$k: $v\r\n";
        }
        $message .= "\r\n" . $body;
        fwrite($fp, preg_replace('/^\./m', '..', $message) . "\r\n.\r\n");
        $expect([250], 'message');
        $send('QUIT');
        fclose($fp);
    }
}
