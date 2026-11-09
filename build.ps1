# Builds the site and assembles deploy\public_html, ready to upload to SiteGround.
# Usage (PowerShell, from this folder):
#   .\build.ps1                                  site at a domain root (https://www.libertarien.net/)
#   .\build.ps1 -BasePath /libertarien.net/      site in a subfolder (https://churchofzer.com/libertarien.net/)
# Needs Node.js 20+ on this computer. PHP is not needed to build.
# Uses robocopy (built into Windows) so long folder paths are not a problem.
param([string]$BasePath = '/')
$ErrorActionPreference = 'Stop'
if ($BasePath -notmatch '^/(.*/)?$') { throw "BasePath must start and end with a slash, e.g. / or /libertarien.net/" }
$env:MDL_BASE = $BasePath
$root = $PSScriptRoot
$out = Join-Path $root 'deploy'
$public = Join-Path $out 'public_html'
$api = Join-Path $public 'api'

function Copy-Tree([string]$from, [string]$to, [string[]]$extra = @()) {
    $rcArgs = @($from, $to, '/E', '/NFL', '/NDL', '/NJH', '/NJS', '/NP', '/R:1', '/W:1') + $extra
    & robocopy @rcArgs | Out-Null
    if ($LASTEXITCODE -ge 8) { throw "robocopy failed copying $from (exit $LASTEXITCODE)" }
    $global:LASTEXITCODE = 0
}

Push-Location (Join-Path $root 'web')
try {
    if (-not (Test-Path node_modules)) { npm ci; if ($LASTEXITCODE) { throw 'npm ci failed' } }
    npm run build
    if ($LASTEXITCODE) { throw 'Build failed' }
} finally { Pop-Location }

# Empty deploy\ (mirroring an empty folder also works with long paths).
if (Test-Path $out) {
    $empty = Join-Path ([IO.Path]::GetTempPath()) ('mdl-empty-' + [guid]::NewGuid())
    New-Item -ItemType Directory $empty | Out-Null
    & robocopy $empty $out /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
    Remove-Item $empty, $out -Recurse -Force
}

# React build (index.html, assets/, .htaccess, favicon, robots.txt)
Copy-Tree (Join-Path $root 'web\dist') $public
# PHP API, without the local development config, data and demo seeder
# (full paths: robocopy matches names case-insensitively, so a bare "config.php" would also drop lib\Config.php)
Copy-Tree (Join-Path $root 'api') $api @('/XD', (Join-Path $root 'api\storage'), '/XF', (Join-Path $root 'api\config.dev.php'), (Join-Path $root 'api\cli\seed-demo.php'))
# The config templates go NEXT TO public_html, outside the web root.
Copy-Item (Join-Path $root 'api\config.sample.php') (Join-Path $out 'mdl-config.php')
Copy-Item (Join-Path $root 'api\secrets.sample.php') (Join-Path $out 'mdl-secrets.php')

Write-Host ""
Write-Host "Ready: $out"
Write-Host "  public_html\      -> upload its contents to your site's public_html"
Write-Host "  mdl-config.php    -> fill in domain and database name/user, upload next to public_html"
Write-Host "  mdl-secrets.php   -> put the database password in it, upload next to public_html"
