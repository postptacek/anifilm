#!/bin/bash

# Ensure we are in the right directory
cd "$(dirname "$0")/server"

echo "🚀 Initializing Anifilm Server..."

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Check for FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  Warning: FFmpeg is not found in your PATH."
    echo "   The server uses 'ffmpeg-static' so it should work, but if you have issues, install ffmpeg via brew."
fi

echo "✅ Starting Server on port 3000..."
echo "   Local URL: http://localhost:3000"
echo "   To expose to internet: ngrok http 3000"
echo ""

npm start
