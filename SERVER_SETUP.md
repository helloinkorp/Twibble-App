# Twibble App - Web Server Setup

## Quick Start

### Option 1: Using the Start Scripts (Recommended)

**Windows:**
```cmd
# Double-click start-server.bat or run from command prompt:
start-server.bat
```

**Mac/Linux:**
```bash
# Make executable and run:
chmod +x start-server.sh
./start-server.sh
```

### Option 2: Direct Command

If you prefer to run the server directly:
```bash
# With live-server installed globally:
live-server --host=127.0.0.1 --port=8080 --open=/src/pages/onboarding.html

# Or using npx (no installation required):
npx live-server --host=127.0.0.1 --port=8080 --open=/src/pages/onboarding.html
```

## Installation Requirements

### 1. Node.js (✓ Already installed)
- Node.js v22.18.0 detected
- No action needed

### 2. Live-server Installation

Choose one of these methods:

**Method A - Global Installation (Recommended):**
```bash
npm install -g live-server
```

**Method B - Local Installation:**
```bash
# In the Twibble App directory
npm install --save-dev live-server
# Then run with: npx live-server
```

**Method C - No Installation (Use npx):**
```bash
npx live-server --host=127.0.0.1 --port=8080 --open=/src/pages/onboarding.html
```

## Server Configuration

The server is configured with these settings:
- **Host:** 127.0.0.1 (localhost)
- **Port:** 8080
- **Auto-open:** `/src/pages/onboarding.html` (app starting point)
- **Auto-reload:** Yes (files changes trigger browser refresh)
- **Ignored directories:** node_modules, claudedocs, orchestrator

## Usage Flow

1. **Start the server** using any method above
2. **Browser automatically opens** to `http://127.0.0.1:8080/src/pages/onboarding.html`
3. **Complete the onboarding flow** (choose avatar, enter name)
4. **Select role** (Teacher or Student) on the main page
5. **Navigate through the app** - all ES6 modules will load properly

## Auto-reload Development

- **File changes** automatically reload the browser
- **Component modifications** are instantly reflected
- **CSS changes** update without full page reload
- **JavaScript edits** trigger automatic refresh

## Troubleshooting

### Permission Issues
If you get permission errors installing live-server globally:
```bash
# Use npx instead (no installation required)
npx live-server --host=127.0.0.1 --port=8080 --open=/src/pages/onboarding.html
```

### Port Already in Use
If port 8080 is busy:
```bash
live-server --host=127.0.0.1 --port=3000 --open=/src/pages/onboarding.html
```

### CORS Errors (Should be resolved with server)
The web server resolves the CORS issues that prevented ES6 modules from working with file:// protocol.

## Development Benefits

✅ **No more CORS errors** - Proper HTTP server eliminates file:// protocol issues
✅ **ES6 modules work** - Clean import/export syntax restored
✅ **Auto-reload** - Instant feedback on code changes  
✅ **Better debugging** - Proper source maps and error reporting
✅ **Production-like environment** - HTTP server mimics deployed app

## Next Steps

Once the server is running, the app has been restored to use clean ES6 module architecture:
- All components use proper `export` statements
- All HTML pages use `<script type="module">` imports
- No more global window assignments needed
- Cleaner, more maintainable code structure

Stop the server with `Ctrl+C` when done developing.