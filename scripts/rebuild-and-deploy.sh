#!/bin/bash

echo "🔧 Rebuilding WINZO Frontend (Next.js) for production..."

# Navigate to frontend directory
cd oddsx/oddsx-react

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf out/
rm -rf .next/
rm -rf node_modules/.cache/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

# Check if build was successful
if [ -d "out" ] && [ -f "out/index.html" ]; then
    echo "✅ Build successful!"
    echo "📁 Build directory contents:"
    ls -la out/
    echo ""
    echo "📁 Static assets:"
    if [ -d "out/_next/static" ]; then
        ls -la out/_next/static/
    fi
    echo ""
    echo "🚀 Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Commit and push these changes to your repository"
    echo "2. Netlify will auto-deploy from oddsx/oddsx-react/"
    echo "3. The Next.js static export will be served correctly"
else
    echo "❌ Build failed!"
    exit 1
fi 