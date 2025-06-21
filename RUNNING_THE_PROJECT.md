# Running the AI Interviewer Project

## Quick Start (Windows)

### Option 1: Using the provided scripts
1. **PowerShell Script**: Run `.\start-dev.ps1` in PowerShell
2. **Batch File**: Run `start-dev.bat` in Command Prompt

### Option 2: Manual startup
1. **Start Backend**: Open a terminal and run:
   ```powershell
   cd backend
   npm start
   ```

2. **Start Frontend**: Open another terminal and run:
   ```powershell
   cd frontend
   npm start
   ```

## Access the Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## Troubleshooting

### PowerShell Issues
- If you get `&&` operator errors, use the provided scripts or run commands separately
- PowerShell doesn't support `&&` like bash does

### Port Issues
- Make sure ports 3000 and 3001 are available
- If you get "port already in use" errors, kill the processes using those ports

### Dependencies
- Make sure you've run `npm install` in both `backend/` and `frontend/` directories
- Node.js version 16+ is required

## Fixed Issues
- ✅ Fixed "Cannot read properties of undefined (reading 'success')" error in SubmissionPanel
- ✅ Fixed PowerShell `&&` operator compatibility
- ✅ Fixed incorrect function parameter passing in executeCode calls 