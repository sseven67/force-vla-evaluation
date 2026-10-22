$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

try {
    $nodeCommand = Get-Command node -ErrorAction Stop
    $viteEntry = Join-Path $PSScriptRoot 'node_modules/vite/bin/vite.js'
    if (-not (Test-Path -LiteralPath $viteEntry)) {
        throw 'Dependencies missing. Run npm ci in this folder first.'
    }
    Write-Host 'Force-VLA Atlas: http://127.0.0.1:8765/#works'
    Write-Host 'Keep this window open. Press Ctrl+C to stop.'
    & $nodeCommand.Source $viteEntry --host 127.0.0.1 --port 8765 --strictPort
    exit $LASTEXITCODE
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host 'Press Enter to close'
    exit 1
}
