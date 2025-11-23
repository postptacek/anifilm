# Anifilm AR Hunt

Festival AR treasure hunt application with MindAR image tracking.

## Project Structure
- `client/` - Mobile scanner web app (React + MindAR)
- `display/` - CRT display web app (React)
- `server/` - Node.js backend with FFmpeg video generation

## Setup

### Important: Add targets.mind
Before deploying, you MUST add your compiled `targets.mind` file:
```bash
cp /path/to/your/targets.mind client/public/targets.mind
```

The `targets.mind` file is too large for git (~4MB), so it must be added manually.

### Local Development
```bash
./start-server.sh  # Start the backend
cd client && npm run dev  # Start client
cd display && npm run dev  # Start display
```

### Deployment
The project auto-deploys to GitHub Pages via GitHub Actions when you push to `main`.

**Live URLs:**
- Client: https://postptacek.github.io/anifilm/client/
- Display: https://postptacek.github.io/anifilm/display/

## Server Setup
Run the server on your Mac Mini:
```bash
./start-server.sh
```

To expose it publicly, use ngrok:
```bash
ngrok http 3000
```

Then update `client/.env.production` with your server URL.
