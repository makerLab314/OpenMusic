#!/bin/bash
# OpenMusic Startup Script

echo "Starting OpenMusic Server..."
echo "================================"

# Check Python version
python_version=$(python --version 2>&1)
echo "Python version: $python_version"

# Check if dependencies are installed
if ! python -c "import flask" 2>/dev/null; then
    echo "Error: Dependencies not installed!"
    echo "Please run: pip install -r requirements.txt"
    exit 1
fi

# Start the server
echo ""
echo "Starting server on http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
python app/main.py
