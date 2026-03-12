#!/bin/bash

echo "🌟 Starting Vibe UI 2.0..."

# Start server in background
echo "🚀 Starting WebSocket server..."
cd server && npm start &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Start frontend
echo "🎨 Starting React frontend..."
cd ..
npm run dev

# Cleanup on exit
trap "kill $SERVER_PID" EXIT