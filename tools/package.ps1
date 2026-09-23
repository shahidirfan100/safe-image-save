param(
  [string]$OutputPath = ""
)

$projectRoot = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content -Raw (Join-Path $projectRoot 'manifest.json') | ConvertFrom-Json
if (-not $OutputPath) {
  $OutputPath = Join-Path $projectRoot "safe-image-save-v$($manifest.version).zip"
}

if (Test-Path -LiteralPath $OutputPath) {
  Remove-Item -LiteralPath $OutputPath -Force
}

$runtimeFiles = @(
  'manifest.json',
  'service-worker.js',
  'about.html',
  'about.css',
  'shared',
  'popup',
  'icons'
) | ForEach-Object { Join-Path $projectRoot $_ }

Compress-Archive -Path $runtimeFiles -DestinationPath $OutputPath -CompressionLevel Optimal
Write-Output "Packaged $($manifest.name) $($manifest.version) at $OutputPath"
