# Code Mock AI Interviewer - User Guide

## 🎯 What's Fixed

The issue where the AI was stuck in the introduction phase has been resolved! Here are the key improvements:

### ✅ **Fixed Issues:**
1. **Strict Script Following**: The AI now follows exact scripts for each phase
2. **Better State Management**: Improved session tracking and phase progression
3. **Enhanced Debugging**: Added detailed logging to track interview flow
4. **Clear Phase Transitions**: Each phase now has explicit instructions

### 🔄 **Interview Flow:**
1. **Introduction Phase** (2 questions)
   - Question 1: Technical background and experience
   - Question 2: Recent project experience
   
2. **Core Topics Phase** (2 questions)
   - Question 1: Random topic from OS, OOPs, DBMS, or CNS
   - Question 2: Different topic from the remaining areas
   
3. **DSA Problem Phase** (1 coding challenge)
   - Story-based problem with real-world context
   - Multiple test cases provided
   
4. **Wrap-up Phase**
   - Feedback and interview conclusion

## 🚀 How to Use

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```

### 2. Make Sure Ollama is Running
```bash
# Install deepseek-r1:7b model if not already installed
ollama pull deepseek-r1:7b

# Start Ollama (if not already running)
ollama serve
```

### 3. Test the Interview Flow
```bash
# Run the test script to verify everything works
node test-interview.js
```

### 4. Use the Frontend (Optional)
```bash
cd frontend
npm install
npm start
```

## 🔧 Available Endpoints

### Main Interview Endpoints:
- `POST /api/chat` - Main interview conversation
- `GET /api/progress` - Get interview progress
- `POST /api/reset` - Reset interview session
- `GET /api/status` - Get current interview status

### Testing & Debugging:
- `GET /api/test-flow` - Test interview flow and see available topics
- `POST /api/force-transition` - Force phase transition (for testing)

## 🐛 Troubleshooting

### If the AI gets stuck again:
1. **Reset the session**: `POST /api/reset`
2. **Check the logs**: Look for phase progression in console
3. **Verify Ollama**: Make sure deepseek-r1:7b is running
4. **Test the flow**: Use `GET /api/test-flow` to see current state

### Common Issues:
- **AI not responding**: Check if Ollama is running on port 11434
- **Wrong model**: Ensure deepseek-r1:7b is installed and running
- **Session issues**: Reset the session using the reset endpoint

## 📊 Interview Progress Tracking

The system tracks:
- Current phase (introduction, core_topics, dsa_problem, wrap_up)
- Number of questions asked in each phase
- Topics covered (to avoid repetition)
- DSA problem selection
- Overall progress percentage

## 🎨 Customization

### Adding New Questions:
Edit the `coreTopicQuestions` object in `backend/server.js`:
```javascript
const coreTopicQuestions = {
  os: [
    "Your new OS question here",
    // ... existing questions
  ],
  // ... other topics
};
```

### Adding New DSA Problems:
Edit the `dsaStoryProblems` array in `backend/server.js`:
```javascript
const dsaStoryProblems = [
  {
    title: "Your Problem Title",
    story: "Your story context",
    problem: "The actual problem statement",
    requirements: ["Requirement 1", "Requirement 2"],
    testCases: [
      { input: "test input", output: "expected output", explanation: "explanation" }
    ]
  },
  // ... existing problems
];
```

## 🎯 Example Interview Session

1. **Start**: Send any message to begin
2. **Introduction**: AI asks about your background
3. **Project Experience**: AI asks about recent projects
4. **Core Topic 1**: AI asks a technical question (e.g., OS concepts)
5. **Core Topic 2**: AI asks another technical question (e.g., OOPs)
6. **DSA Problem**: AI presents a coding challenge
7. **Feedback**: AI provides feedback and wraps up

## 🚨 Important Notes

- **Session Persistence**: The interview state is maintained in the session
- **Model Requirements**: Requires Ollama with deepseek-r1:7b model
- **Port Configuration**: Backend runs on port 3001 by default
- **CORS**: Frontend can connect from port 3000

## 🎉 Success Indicators

When working correctly, you should see:
- Clear phase progression in console logs
- Different questions for each phase
- Proper topic selection (no repetition)
- Smooth transitions between phases
- Appropriate DSA problem presentation

---

**Happy Interviewing! 🚀** 