#!/bin/bash

# Kill all child processes on exit
trap 'kill $(jobs -p)' EXIT

echo "Starting Anifilm AR Hunt System..."

# Start Server
echo "Starting Server on port 3000..."
cd server && npm start &
SERVER_PID=$!

# Wait for server to be ready
sleep 2

# Start Client
echo "Starting Client on port 5173..."
cd client && npm run dev -- --port 5173 &
CLIENT_PID=$!

# Start Display
echo "Starting Display on port 5174..."
cd display && npm run dev -- --port 5174 &
DISPLAY_PID=$!

echo "System Running!"
echo "Server:  http://localhost:3000"
echo "Client:  http://localhost:5173"
echo "Display: http://localhost:5174"
echo ""
echo "Press Ctrl+C to stop."

wait
