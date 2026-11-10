# Mouvement des Libertariens: libertarien.net

A fresh rebuild of the MDL site, designed to run on ordinary SiteGround shared hosting.

| Part | Technology | On the server |
|---|---|---|
| Website | React 19 + Vite + Tailwind 4 | static files in `public_html/` |
| API | Plain PHP 8.2+ with no framework and no Composer packages | `public_html/api/` |
| Database | MySQL 8 (SQLite for local development) | one MySQL database |
| Email | Built-in SMTP client (or PHP `mail()`) | a SiteGround mailbox |

There's no Ruby, no Node process and no background worker on the server. You build on your computer and upload folders.

```
mdl/
├─ api/                 PHP API → public_html/api
│  ├─ index.php         single entry point (every /api/* request lands here)
│  ├─ lib/              Auth, Db, Quiz, Applications, Mailer, Xlsx…
│  ├─ routes/           the endpoints, grouped by area
│  ├─ schema/           mysql.sql (production) and sqlite.sql (local)
│  ├─ cli/              install.php, create-user.php, seed-demo.php (local only)
│  └─ config.sample.php template for mdl-config.php
├─ web/                 React source → built into public_html
└─ build.ps1            builds and assembles deploy/ for upload
```

## What the site does

- **Public**: home and manifesto, blog, links, a member directory (public profiles only), and the application form.
- **Applications**: the applicant confirms their email, then every porte-parole must approve (one refusal rejects). On acceptance, the applicant gets a personal signup link. Certified members can co-opt candidates directly.
- **Questionnaires**: two domains (Droit Naturel, École Autrichienne) and two levels (Bases Acquises, Sait Analyser). Questions are drawn in proportion to their difficulty, the timer runs on the server, and grading happens on the server. Both domains at "Sait Analyser" make a member *Membre certifié* automatically.
- **Member badge**: the target-and-arrow logo is drawn as an SVG whose rings light up with the member's levels. The top half of each ring is Droit Naturel, the bottom half École Autrichienne. It replaces the ten 480 KB JPEGs.
- **Management**: porte-parole review applications and manage members (certification, level reset, .xlsx export). Administrators also manage questions (.xlsx import/export compatible with the old spreadsheet format), questionnaire settings, blog posts (Markdown editor with image upload) and links.

### Security problems of the old app that this design rules out

- **Password reset**: no endpoint can change a password without a valid token or the current password.
- **Permissions**: every write is checked on the server (member / certified / porte-parole / admin), not only hidden in the UI.
- **Email addresses**: private profiles and email addresses never leave the server for public pages.
- **Quiz integrity**: answer points never reach the browser, and scores, tries and the timer can't be edited by the client.
- **Signup links**: the email-verification link can't be used to sign up. A separate token is issued only after acceptance.
- **Sessions**: they live in HttpOnly cookies (no token in localStorage). Writes need a custom header (CSRF), and logins, password resets and applications are rate-limited.
- **Secrets**: no password in the repository. Credentials live in `mdl-config.php`, outside the web root.

## Run it locally

You need [Node.js](https://nodejs.org) 20+ and [PHP](https://windows.php.net/download) 8.2+. In `php.ini`, enable `pdo_sqlite`, `mbstring`, `zip` and `openssl`.

1. Create the local SQLite database with demo content:

   ```bash
   php api/cli/install.php
   ```

   ```bash
   php api/cli/seed-demo.php
   ```

2. Start the API (leave it running):

   ```bash
   php -S 127.0.0.1:8081 api/index.php
   ```

3. In a second terminal, start the website:

   ```bash
   cd web && npm install && npm run dev
   ```

4. Open http://localhost:5173 and log in as `admin@demo.test` with the password `demo-mdl-2026` (porte-parole and admin). Other demo accounts: `pp@demo.test`, `mc@demo.test`, `membre@demo.test`, all with the same password.

Emails aren't sent locally. They're written to `api/storage/mail.log`, which is where you'll find the confirmation and signup links.

## Deploy on SiteGround

On the server, the site folder looks like this:

```
~/www/libertarien.net/
├─ mdl-config.php     domain, database name/user, email settings (no passwords)
├─ mdl-secrets.php    passwords only, created by you
├─ mdl-storage/       error log
└─ public_html/       the site (index.html, assets/), the API (api/), blog images (uploads/)
```

### 1. Prepare the hosting (once, in Site Tools)

1. **PHP**: Devs → PHP Manager. Choose PHP 8.3 or newer.
2. **Database**: Site → MySQL. Create a database and a user, and give the user all privileges on the database.
3. **SSH**: Devs → SSH Keys Manager. Import your public key. "SSH Credentials" shows the host, username and port.
4. **Passwords**: in Site → File Manager, open `www/<your site>/` (the folder that contains `public_html`). Create `mdl-secrets.php` there with this content:

   ```php
   <?php return ['db_password' => 'the database user password'];
   ```

5. **Settings**: copy `api/config.sample.php` to the same folder as `mdl-config.php`. Set `app_url`, the database name and the database user.
6. **HTTPS**: once the domain points to SiteGround, open Security → SSL Manager, install Let's Encrypt, then turn on **HTTPS Enforce**.

Email goes out through SiteGround's built-in sending (`'transport' => 'mail'`), so no mailbox password is needed. For better deliverability you can switch to SMTP later: see the comments in `mdl-config.php`.

### 2. Publish

From this folder:

```bash
powershell -ExecutionPolicy Bypass -File deploy.ps1 -SshHost ssh.libertarien.net -SshUser u123-abc456 -RemoteDir www/libertarien.net/public_html -Key C:\path\to\private_key
```

The script does four things:
- It builds the site.
- It uploads the build.
- It saves the previous version to `~/mdl-backups/<folder>-<date>.tar.gz`.
- It swaps in the new files.
- It adds any new database columns (`api/cli/migrate.php`, which never deletes anything).

Your database, `uploads/`, `mdl-config.php` and `mdl-secrets.php` are left untouched. Run the same command for every later update.

Without SSH, you can instead run `build.ps1` and upload `deploy/public_html/` with File Manager or FTP.

### 3. First time only: create the tables and the first administrator

Connect over SSH:

```bash
ssh -p 18765 u123-abc456@ssh.libertarien.net
```

Then:

```bash
cd www/libertarien.net
```

```bash
php public_html/api/cli/install.php
```

```bash
php public_html/api/cli/create-user.php --email=you@example.org --username=you --first=Prénom --last=Nom --pp --admin --invite
```

`--invite` emails you a link, valid 7 days, to choose your own password. If you can't use SSH, you can import `api/schema/mysql.sql` with phpMyAdmin instead of running `install.php`.

Once you're logged in, everything is managed from **Gestion**:
- Import your question spreadsheet under Questions → Importer.
- Check the rules and texts under Paramètres.
- Promote the other porte-parole under Membres.

## Notes

- **Spreadsheet format**: the importer reads the first sheet and finds these columns by name, in any order: `question_content`, `question_domain`, `question_level`, `LMH`, `status`, `Image`, `answer1_content`, `answer1_value`, `answer2_…`. All other columns (`ID`, `theme`, `date`, reviewers…) are ignored.
- **Question images**: a question with an `Image` address (https://) shows that image with a band blurred (by default the bottom 45 %, set in Paramètres). Once the member validates an answer, the image appears in full and that answer can no longer change. The server downloads the image once, blurs it itself and serves it: the browser never gets the original address before the answer, so the hidden text can't be read from the page. Copies are kept in `mdl-storage/question-images/`.
- **Import statuses**: the import screen analyses the file first and shows which `status` values it contains. You tick which ones become active (`inProdOn` and `reviewedOn` are pre-ticked). Rows with other statuses are stored as inactive and never shown to members. To bring your bank in line with an updated master file, use **Remplacer**; **Ajouter** ignores questions that already exist.
- **Rule changes from the old app**:
  - An unanswered question counts 0 points (before, it was ignored, so skipping hard questions raised the average).
  - A threshold is met when the average **reaches** it (≥).
  - Tries are counted per level ("Bases Acquises" and "Sait Analyser" each have their own cycle).
- **Backups**: SiteGround's daily backups cover the database and `public_html/uploads/`.
