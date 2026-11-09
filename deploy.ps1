# Builds the site and publishes it to SiteGround over SSH.
#
# Site in a subfolder of another site (current setup):
#   .\deploy.ps1 -SshHost ssh.example.com -SshUser u123-abc `
#       -RemoteDir www/example.com/public_html/libertarien.net -BasePath /libertarien.net/ -Key C:\path\to\key
#
# Site at the root of its own domain:
#   .\deploy.ps1 -SshHost ssh.libertarien.net -SshUser u123-abc -RemoteDir www/libertarien.net/public_html -BasePath /
#
# SSH details: Site Tools > Devs > SSH Keys Manager > (key) > SSH Credentials. Port is usually 18765.
# On the server it:
#   1. saves the current site folder (without uploads/) to ~/mdl-backups/<folder>-<date>.tar.gz
#   2. replaces assets/ and api/ with the new build and updates the other files
#   3. never touches uploads/, mdl-config.php or mdl-secrets.php
param(
    [Parameter(Mandatory = $true)] [string]$SshHost,
    [Parameter(Mandatory = $true)] [string]$SshUser,
    [Parameter(Mandatory = $true)] [string]$RemoteDir,
    [string]$BasePath = '/',
    [int]$Port = 18765,
    [string]$Key = (Join-Path $HOME '.ssh\id_ed25519'),
    [switch]$SkipBuild
)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$target = "$SshUser@$SshHost"
$common = @('-i', $Key, '-o', 'StrictHostKeyChecking=accept-new', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=20')
$RemoteDir = $RemoteDir.Trim('/')
$name = Split-Path $RemoteDir -Leaf

if (-not $SkipBuild) { & (Join-Path $root 'build.ps1') -BasePath $BasePath }

$tmp = Join-Path ([IO.Path]::GetTempPath()) ('mdl-deploy-' + [guid]::NewGuid())
New-Item -ItemType Directory $tmp | Out-Null
try {
    $release = Join-Path $tmp 'mdl-release.tar.gz'
    & tar -czf $release -C (Join-Path $root 'deploy\public_html') .
    if ($LASTEXITCODE) { throw 'Packing failed' }

    # Server-side steps, written with Unix line endings and no BOM.
    $script = @"
set -e
cd ~/$RemoteDir
mkdir -p ~/mdl-backups
stamp=`$(date +%Y%m%d-%H%M%S)
tar -czf ~/mdl-backups/$name-`$stamp.tar.gz --exclude=./uploads .
rm -rf assets api
tar -xzf ~/mdl-release.tar.gz -C .
rm -f ~/mdl-release.tar.gz ~/mdl-deploy.sh
mkdir -p uploads
echo "Published to ~/$RemoteDir (previous version saved in ~/mdl-backups/$name-`$stamp.tar.gz)"
if [ ! -f mdl-config.php ] && [ ! -f ../mdl-config.php ]; then echo "Reminder: mdl-config.php is missing."; fi
if [ ! -f mdl-secrets.php ] && [ ! -f ../mdl-secrets.php ]; then echo "Reminder: mdl-secrets.php is missing."; fi
"@
    [IO.File]::WriteAllText((Join-Path $tmp 'mdl-deploy.sh'), ($script -replace "`r", ''), (New-Object System.Text.UTF8Encoding($false)))

    Write-Host "Uploading to $target ..."
    & scp @common -P $Port $release (Join-Path $tmp 'mdl-deploy.sh') "${target}:"
    if ($LASTEXITCODE) { throw 'Upload failed' }
    & ssh @common -p $Port $target 'bash ~/mdl-deploy.sh'
    if ($LASTEXITCODE) { throw "Publishing failed on the server (exit $LASTEXITCODE)" }
} finally {
    Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
}
