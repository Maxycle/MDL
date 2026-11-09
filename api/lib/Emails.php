<?php
declare(strict_types=1);

/** Every email the site sends, in French, with a shared layout. */
final class Emails
{
    public static function verifyApplication(array $req, string $url): void
    {
        self::send($req['email'], 'Confirmez votre candidature', [
            "Bonjour {$req['first_name']},",
            'Merci pour votre candidature au Mouvement des Libertariens. Confirmez votre adresse email pour la transmettre aux porte-parole :',
        ], ['Confirmer mon adresse', $url], ['Ce lien est valable 48 heures. Si vous n\'êtes pas à l\'origine de cette demande, ignorez ce message.']);
    }

    public static function newApplication(array $req, ?array $referrer): void
    {
        $who = "{$req['first_name']} {$req['last_name']}";
        $intro = $referrer
            ? "$who a été coopté(e) par {$referrer['first_name']} {$referrer['last_name']}."
            : "$who demande à rejoindre le mouvement.";
        foreach (Users::ppEmails() as $email) {
            self::send($email, "Nouvelle candidature : $who", [
                'Bonjour,',
                $intro . ' Votre avis est attendu : la candidature est acceptée quand tous les porte-parole l\'ont approuvée.',
            ], ['Examiner la candidature', Util::url('/gestion/candidatures')]);
        }
    }

    public static function accepted(array $req, string $url): void
    {
        self::send($req['email'], 'Votre candidature est acceptée', [
            "Bonjour {$req['first_name']},",
            'Les porte-parole ont accepté votre candidature. Bienvenue au Mouvement des Libertariens ! Créez votre compte avec ce lien personnel :',
        ], ['Créer mon compte', $url], ['Ce lien est valable 30 jours et ne fonctionne qu\'une fois.']);
    }

    public static function refused(array $req): void
    {
        self::send($req['email'], 'Votre candidature', [
            "Bonjour {$req['first_name']},",
            'Après examen, les porte-parole n\'ont pas retenu votre candidature au Mouvement des Libertariens.',
            'Merci de l\'intérêt que vous portez au mouvement.',
        ]);
    }

    public static function banned(array $req): void
    {
        self::send($req['email'], 'Votre candidature', [
            "Bonjour {$req['first_name']},",
            'Votre candidature au Mouvement des Libertariens a été définitivement refusée. Il n\'est plus possible de postuler avec cette adresse.',
        ]);
    }

    public static function unbanned(array $req): void
    {
        self::send($req['email'], 'Vous pouvez postuler à nouveau', [
            "Bonjour {$req['first_name']},",
            'Les porte-parole ont levé le refus définitif de votre candidature. Vous pouvez de nouveau postuler au Mouvement des Libertariens.',
        ], ['Postuler', Util::url('/adherer')]);
    }

    public static function passwordReset(array $user, string $url): void
    {
        self::send($user['email'], 'Réinitialisation de votre mot de passe', [
            "Bonjour {$user['first_name']},",
            'Vous avez demandé à réinitialiser votre mot de passe. Choisissez-en un nouveau avec ce lien :',
        ], ['Choisir un nouveau mot de passe', $url], ['Ce lien est valable une heure. Si vous n\'avez rien demandé, ignorez ce message : votre mot de passe reste inchangé.']);
    }

    /** First admin or an account created from the command line: the member chooses their own password. */
    public static function accountInvite(array $user, string $url): bool
    {
        return self::send($user['email'], 'Votre compte au Mouvement des Libertariens', [
            "Bonjour {$user['first_name']},",
            'Un compte vient d\'être créé pour vous sur le site du Mouvement des Libertariens. Choisissez votre mot de passe pour vous connecter :',
        ], ['Choisir mon mot de passe', $url], ['Ce lien est valable 7 jours. Passé ce délai, utilisez « Mot de passe oublié » sur la page de connexion.']);
    }

    public static function ppRequest(array $member): void
    {
        $who = "{$member['first_name']} {$member['last_name']} ({$member['username']})";
        foreach (Users::ppEmails() as $email) {
            self::send($email, "Demande de porte-parole : {$member['first_name']} {$member['last_name']}", [
                'Bonjour,',
                "$who, membre certifié, souhaite devenir porte-parole du mouvement. Vous pouvez le contacter à {$member['email']}.",
            ], ['Voir les membres', Util::url('/gestion/membres')]);
        }
    }

    /** @param string[] $paragraphs @param array{0:string,1:string}|null $button @param string[] $footnotes */
    private static function send(string $to, string $subject, array $paragraphs, ?array $button = null, array $footnotes = []): bool
    {
        $e = static fn(string $s): string => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
        $html = '';
        foreach ($paragraphs as $p) {
            $html .= '<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#14191d">' . $e($p) . '</p>';
        }
        if ($button) {
            $html .= '<p style="margin:24px 0"><a href="' . $e($button[1]) . '" style="display:inline-block;background:#0162af;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:8px">' . $e($button[0]) . '</a></p>'
                . '<p style="margin:0 0 16px;font-size:13px;color:#5a6672">Si le bouton ne fonctionne pas, copiez ce lien : <br><span style="word-break:break-all">' . $e($button[1]) . '</span></p>';
        }
        foreach ($footnotes as $f) {
            $html .= '<p style="margin:0 0 8px;font-size:13px;color:#5a6672">' . $e($f) . '</p>';
        }
        $page = '<!doctype html><html lang="fr"><body style="margin:0;background:#f3f5f8;font-family:Segoe UI,Helvetica,Arial,sans-serif">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f8;padding:24px 12px"><tr><td align="center">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">'
            . '<tr><td style="background:#14191d;padding:18px 28px;color:#ffffff;font-weight:700;font-size:17px;letter-spacing:.2px">Mouvement des Libertariens'
            . '<div style="height:3px;margin-top:14px;background:linear-gradient(90deg,#ee4127,#f6911e,#ffde00)"></div></td></tr>'
            . '<tr><td style="padding:28px">' . $html . '</td></tr></table>'
            . '<p style="font-size:12px;color:#8a96a3;margin:16px 0 0">' . $e(parse_url(Util::url('/'), PHP_URL_HOST) ?: '') . '</p>'
            . '</td></tr></table></body></html>';

        $text = implode("\n\n", $paragraphs);
        if ($button) {
            $text .= "\n\n{$button[0]} : {$button[1]}";
        }
        if ($footnotes) {
            $text .= "\n\n" . implode("\n", $footnotes);
        }
        $text .= "\n\n— Mouvement des Libertariens";
        return Mailer::send($to, $subject, $page, $text);
    }
}
