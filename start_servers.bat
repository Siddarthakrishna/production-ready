@echo off
echo Starting Sharada Research Unified Application

echo Starting Backend Server on port 8001...
start "Backend" cmd /k "cd backend && python server.py"

timeout /t 8

echo Starting Frontend Server on port 3510...
start "Frontend" cmd /k "cd frontend && npm start"

echo Both servers started successfully!
echo Frontend: http://localhost:3510
echo Backend: http://localhost:8001
echo Backend API Docs: http://localhost:8001/api/docs
echo Connection Test: http://localhost:3510/connection-test.html
echo.
echo Note: Wait for both servers to fully start before testing the connection.
echo The frontend React server may take 1-2 minutes to compile and start.

pause