#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Deployment..."

# 1. Build Client
echo "📦 Building Client..."
cd client
npm install
npm run build
cd ..

# 2. Build Display
echo "📦 Building Display..."
cd display
npm install
npm run build
cd ..

# 3. Prepare Deploy Folder
echo "📂 Preparing 'deploy' directory..."
rm -rf deploy
mkdir deploy

# Copy builds
cp -r client/dist deploy/client
cp -r display/dist deploy/display

# Create an index.html for the root to redirect (optional)
echo '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=./client/" /></head><body>Redirecting to Client...</body></html>' > deploy/index.html

# 4. Deploy to gh-pages
echo "ww Uploading to GitHub Pages..."
# We use npx gh-pages to push the 'deploy' folder to the 'gh-pages' branch
npx gh-pages -d deploy -u "git-upload <git@example.com>" 

echo "✅ Deployed!"
echo "👉 Client: https://postptacek.github.io/YOUR_REPO_NAME/client/"
echo "👉 Display: https://postptacek.github.io/YOUR_REPO_NAME/display/"
