#!/bin/bash

echo "🔧 Rebuilding WINZO Frontend with MIME type fixes..."

# Navigate to frontend directory
cd winzo-frontend

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf build/
rm -rf node_modules/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️ Building application..."
npm run build

# Check if build was successful
if [ -d "build" ] && [ -f "build/index.html" ]; then
    echo "✅ Build successful!"
    echo "📁 Build directory contents:"
    ls -la build/
    echo ""
    echo "📁 Static assets:"
    ls -la build/static/
    echo ""
    echo "🚀 Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Commit and push these changes to your repository"
    echo "2. Trigger a new Netlify deployment"
    echo "3. The MIME type issues should be resolved"
else
    echo "❌ Build failed!"
    exit 1
fi 