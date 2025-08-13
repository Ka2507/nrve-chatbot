#!/bin/bash

echo "🚀 Setting up NRVE Mobile App Development Environment"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install Expo CLI globally if not installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI globally..."
    npm install -g @expo/cli
else
    echo "✅ Expo CLI is already installed"
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Check if server is running
echo "🔍 Checking if NRVE server is running..."
if curl -s http://localhost:4000/api/journal > /dev/null; then
    echo "✅ NRVE server is running on http://localhost:4000"
else
    echo "⚠️  NRVE server is not running on http://localhost:4000"
    echo "   Please start the server first:"
    echo "   cd ../server && npm install && node index.js"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the development server: npm start"
echo "2. Press 'i' for iOS Simulator"
echo "3. Press 'a' for Android Emulator"
echo "4. Or scan QR code with Expo Go app on your phone"
echo ""
echo "For physical device testing, update config.ts with your computer's IP address"
