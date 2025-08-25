#!/bin/bash

echo "Starting Sharada Research Unified Application"

# Start backend server in the background
echo "Starting Backend Server on port 8001..."
cd backend
python server.py &
BACKEND_PID=$!
cd ..

# Wait a few seconds for backend to start
sleep 5

# Start frontend server in the background
echo "Starting Frontend Server on port 3510..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "Both servers started successfully!"
echo "Frontend: http://localhost:3510"
echo "Backend: http://localhost:8001"
echo "Backend API Docs: http://localhost:8001/api/docs"

# Function to stop both servers
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID
    exit 0
}

# Trap Ctrl+C to stop both servers
trap cleanup SIGINT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID