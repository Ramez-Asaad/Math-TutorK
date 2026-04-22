# Start the Pocket TTS server for Math Tutor voice instructions.
# Usage: .\start-tts.ps1
#
# Uses uv (https://docs.astral.sh/uv/) for fast dependency management.
# First run downloads the model weights (~200MB).
# The server runs on http://localhost:8000

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvDir = Join-Path $ScriptDir ".tts-venv"
$UvBin = if ($env:UV_BIN) { $env:UV_BIN } else { "uv" }

Write-Host ""
Write-Host "  Starting Pocket TTS server on http://localhost:8000"
Write-Host "  First run will download model + dependencies"
Write-Host "  Press Ctrl+C to stop"
Write-Host ""

# Ensure venv exists
if (-not (Test-Path $VenvDir)) {
    Write-Host "  Creating virtual environment with uv..."
    & $UvBin venv $VenvDir --python 3.12
}

# Ensure pocket-tts is installed
$PocketTtsBin = Join-Path $VenvDir "Scripts\pocket-tts.exe"
if (-not (Test-Path $PocketTtsBin)) {
    Write-Host "  Installing pocket-tts into venv..."
    $PythonBin = Join-Path $VenvDir "Scripts\python.exe"
    & $UvBin pip install pocket-tts --python $PythonBin
}

# Launch the server
& $PocketTtsBin serve --host 0.0.0.0 --port 8000 --voice alba
