#!/bin/bash

echo "Starting Twibble App Development Server..."
echo

# Check if live-server is installed
if ! command -v live-server &> /dev/null; then
    echo "ERROR: live-server is not installed!"
    echo
    echo "Please install live-server first:"
    echo "  npm install -g live-server"
    echo
    echo "Or use npx to run without installing:"
    echo "  npx live-server --host=127.0.0.1 --port=8080 --open=/src/pages/onboarding.html"
    echo
    exit 1
fi

echo "Starting server at http://127.0.0.1:8080"
echo "Opening onboarding page..."
echo
echo "Press Ctrl+C to stop the server"
echo

# Start live-server with specific configuration for Twibble App
live-server --host=127.0.0.1 --port=8080 --open=/src/pages/onboarding.html --ignore=node_modules,claudedocs,orchestrator