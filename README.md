# AI Interviewer - Technical Interview Platform

A full-stack web application that provides an AI-powered technical interview experience with real-time code execution, problem-solving challenges, and interactive coding sessions.

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (v6 or higher) - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **Ollama** - [Download here](https://ollama.ai/download) (for local AI model)
- **At least 8GB RAM** (recommended for AI model)
- **At least 10GB free disk space** (for AI model storage)

### 1. Download the Project

```bash
# Clone the repository
git clone <your-repository-url>
cd AI-Interviewer

# Or if you have the ZIP file, extract it and navigate to the folder
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install separately:
# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies  
cd frontend
npm install
cd ..
```

### 3. Set Up AI Model (Ollama)

The AI Interviewer uses Ollama to run AI models locally. You need to install and configure Ollama with the required model.

#### Step 1: Install Ollama
```bash
# Windows (using winget)
winget install Ollama.Ollama

# Or download from: https://ollama.ai/download
# Then run the installer
```

#### Step 2: Download the AI Model
```bash
# Start Ollama service
ollama serve

# In a new terminal, pull the required model
ollama pull qwen2.5-coder:7b

# Alternative model (if qwen2.5-coder:7b is not available)
ollama pull deepseek-coder:7b
```

#### Step 3: Verify Model Installation
```bash
# List installed models
ollama list

# Test the model
ollama run qwen2.5-coder:7b "Hello, can you help me with coding?"
```

### 4. Start the Application

#### Option A: Using the Root Script (Recommended)
```bash
# Start both frontend and backend simultaneously
npm start
```

#### Option B: Using Windows Scripts
```bash
# PowerShell
.\start-dev.ps1

# Or Command Prompt
start-dev.bat
```

#### Option C: Manual Startup
```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend  
cd frontend
npm start
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Ollama API**: http://localhost:11434

## 🎯 Features

- **Interactive Code Editor**: Monaco Editor with syntax highlighting
- **Real-time Code Execution**: Execute code in multiple programming languages
- **AI Interview Sessions**: Simulated technical interviews with local AI model
- **Local AI Processing**: Runs completely offline using Ollama
- **Problem Library**: Collection of coding challenges and problems
- **Test Case Management**: Add and run custom test cases
- **Modern UI**: Clean, responsive interface with TailwindCSS
- **Multi-language Support**: Python, JavaScript, Java, C++

## 🛠️ Project Structure

```
AI-Interviewer/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── data/           # Mock data and hooks
│   │   ├── styles/         # CSS files
│   │   └── utils/          # Utility functions
│   └── package.json
├── backend/                 # Express backend server
│   ├── src/
│   │   ├── config/         # Configuration settings
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Express middleware
│   │   └── routes/         # API routes
│   └── package.json
├── start-dev.bat           # Windows batch script
├── start-dev.ps1           # PowerShell script
└── package.json            # Root workspace configuration
```

## 🔧 Configuration

### Backend Configuration
The backend runs on port 3001 by default. You can modify this in `backend/src/config/index.js`:

```javascript
module.exports = {
  port: process.env.PORT || 3001,
  // ... other config
}
```

### Frontend Configuration
The frontend runs on port 3000 by default. The API endpoint is configured to connect to the backend.

## 🧪 Testing the Interview System

### Run Test Scripts
```bash
# Install test dependencies
npm install axios axios-cookiejar-support tough-cookie

# Test interview session
node test-interview-session.js

# Test DSA phase
node test-dsa-phase.js

# Test questions pool
node test-questionspool.js
```

### Test AI Model
```bash
# Test if Ollama is working
ollama run qwen2.5-coder:7b "Write a simple hello world program in Python"

# Test interview flow with AI
node test-interview.js
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Windows - Find and kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Windows - Find and kill process using port 3001  
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Windows - Find and kill process using port 11434 (Ollama)
netstat -ano | findstr :11434
taskkill /PID <PID> /F
```

#### Ollama Issues
```bash
# Check if Ollama is running
ollama list

# Restart Ollama service
ollama serve

# If model is not found, reinstall it
ollama pull qwen2.5-coder:7b

# Check Ollama logs
ollama logs
```

#### AI Model Not Responding
- Ensure Ollama is running: `ollama serve`
- Verify model is installed: `ollama list`
- Check if the correct model is being used (qwen2.5-coder:7b)
- Test the model directly: `ollama run qwen2.5-coder:7b "test"`
- Check backend logs for AI communication errors

#### PowerShell Issues
- If you get `&&` operator errors, use the provided scripts or run commands separately
- PowerShell doesn't support `&&` like bash does

#### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Node.js Version Issues
- Ensure you have Node.js v16 or higher
- Use `node --version` to check your version
- Update Node.js if needed

### Error Messages

#### "Cannot read properties of undefined (reading 'success')"
- This has been fixed in recent versions
- Ensure you're using the latest code

#### "Module not found" errors
```bash
# Reinstall dependencies
npm run install:all
```

## 📚 API Documentation

### Backend Endpoints

#### Code Execution
- **POST** `/api/code/execute`
  ```json
  {
    "code": "print('Hello, World!')",
    "language": "python"
  }
  ```

#### Health Check
- **GET** `/health`
  ```json
  {
    "status": "ok"
  }
  ```

### Supported Programming Languages
- Python (3.10)
- JavaScript (18.15.0)
- Java (15.0.2)
- C++ (10.2.0)

## 🚀 Deployment

### Development
```bash
npm start
```

### Production Build
```bash
# Build frontend
npm run build:frontend

# Start production backend
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the error logs in the terminal
3. Ensure all prerequisites are installed
4. Try running the test scripts to verify functionality

---

**Happy Coding! 🎉**