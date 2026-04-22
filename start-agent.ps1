# Start the Math-Tutor adaptive agent server (rule-based engine).
# Usage: .\start-agent.ps1
# Requires Python 3.10+ and pip.

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerDir = Join-Path $ScriptDir "server"
$VenvDir = Join-Path $ServerDir ".agent-venv"

Set-Location $ServerDir

# Create venv if it doesn't exist
if (-not (Test-Path $VenvDir)) {
    Write-Host "Creating virtual environment..."
    python -m venv $VenvDir
}

# Activate venv and install deps
Write-Host "Activating venv and installing deps..."
$ActivateScript = Join-Path $VenvDir "Scripts\Activate.ps1"
& $ActivateScript
pip install -q -r requirements.txt

# Start the server
Write-Host "Starting agent server on http://localhost:8001"
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
