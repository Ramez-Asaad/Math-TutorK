#!/usr/bin/env bash
# Start the Math-Tutor adaptive agent server (rule-based engine).
# Requires Python 3.10+ and pip.

set -e
cd "$(dirname "$0")/server"

if [ ! -d ".agent-venv" ]; then
    echo "Creating virtual environment..."
    python -m venv .agent-venv
fi

echo "Activating venv and installing deps..."
source .agent-venv/bin/activate 2>/dev/null || source .agent-venv/Scripts/activate
pip install -q -r requirements.txt

echo "Starting agent server on http://localhost:8001"
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
