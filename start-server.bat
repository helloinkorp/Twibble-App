@echo off
echo Starting Twibble App Development Server...
echo.

REM Check if live-server is installed globally
where live-server >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: live-server is not installed!
    echo.
    echo Please install live-server first:
    echo   npm install -g live-server
    echo.
    echo Or if you don't have admin rights:
    echo   npx live-server --host=127.0.0.1 --port=8080 --open=/src/pages/onboarding.html
    echo.
    pause
    exit /b 1
)

echo Starting server at http://127.0.0.1:8080
echo Opening onboarding page...
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start live-server with specific configuration for Twibble App
live-server --host=127.0.0.1 --port=8080 --open=/src/pages/onboarding.html --ignore=node_modules,claudedocs,orchestrator