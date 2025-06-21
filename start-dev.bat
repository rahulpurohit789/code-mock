@echo off
echo Starting AI Interviewer development servers...

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
pause 