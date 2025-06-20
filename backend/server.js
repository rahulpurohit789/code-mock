const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow frontend origins
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Add session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'code_mock_interview_secret_2024', // Better secret handling
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 2 * 60 * 60 * 1000, // 2 hours for longer interviews
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax' // Allow cross-origin requests
  }
}));

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Sample DSA story problems pool
const dsaStoryProblems = [
  {
    title: "Library Book Organization",
    story: "You're helping the town librarian organize returned books. Books come back in random order, but need to be placed on shelves in alphabetical order by title. However, you can only move books from the return cart to a temporary sorting area, and from there to the final shelf position.",
    problem: "Given an array of book titles, find the minimum number of moves needed to sort them alphabetically.",
    requirements: [
      "Input: Array of strings (book titles)",
      "Output: Minimum number of swaps/moves to sort alphabetically",
      "Consider case-insensitive sorting"
    ],
    testCases: [
      { input: '["Python", "Java", "C++", "JavaScript"]', output: '2', explanation: "Need to swap Python with C++, and Python with Java" },
      { input: '["Alice", "Bob", "Charlie"]', output: '0', explanation: "Already sorted alphabetically" },
      { input: '["Zebra", "Apple", "Banana"]', output: '2', explanation: "Multiple swaps needed to get Apple, Banana, Zebra" }
    ]
  },
  {
    title: "Pizza Delivery Route",
    story: "You're a pizza delivery driver with multiple orders to deliver. Each house is located on a straight street with house numbers. You want to minimize the total distance traveled while delivering all pizzas, starting and ending at the pizza shop (position 0).",
    problem: "Given an array of house numbers, find the minimum total distance to visit all houses and return to the shop.",
    requirements: [
      "Input: Array of integers (house positions)",
      "Output: Minimum total distance traveled",
      "Start and end at position 0 (pizza shop)"
    ],
    testCases: [
      { input: '[1, 3, 5]', output: '10', explanation: "Go 0→1→3→5→0 = 1+2+2+5 = 10 or 0→5→3→1→0 = 5+2+2+1 = 10" },
      { input: '[2, 4]', output: '8', explanation: "Go 0→2→4→0 = 2+2+4 = 8" },
      { input: '[10]', output: '20', explanation: "Go 0→10→0 = 10+10 = 20" }
    ]
  },
  {
    title: "Student Grade Calculator",
    story: "As a teaching assistant, you need to calculate final grades for students. Each student has multiple quiz scores, but you can drop the lowest score before calculating the average. However, if a student has fewer than 3 quizzes, you cannot drop any scores.",
    problem: "Given a list of students with their quiz scores, calculate each student's final grade after dropping the lowest score (if they have 3+ quizzes).",
    requirements: [
      "Input: Array of objects with student name and quiz scores",
      "Output: Array of objects with student name and final grade",
      "Drop lowest score only if student has 3 or more quizzes"
    ],
    testCases: [
      { input: '[{name: "Alice", scores: [85, 92, 78, 96]}]', output: '[{name: "Alice", grade: 91}]', explanation: "Drop 78, average of 85,92,96 = 91" },
      { input: '[{name: "Bob", scores: [80, 90]}]', output: '[{name: "Bob", grade: 85}]', explanation: "Only 2 scores, can't drop any, average = 85" },
      { input: '[{name: "Charlie", scores: [100, 95, 85, 90, 92]}]', output: '[{name: "Charlie", grade: 94.25}]', explanation: "Drop 85, average of remaining = 94.25" }
    ]
  }
];

// Core topic questions pool
const coreTopicQuestions = {
  os: [
    "Explain the difference between processes and threads. When would you choose one over the other?",
    "What is virtual memory and how does paging work? Why is it important in modern operating systems?",
    "Describe the concept of deadlocks. What are the four necessary conditions for a deadlock to occur?",
    "Explain different CPU scheduling algorithms like FCFS, SJF, and Round Robin. What are their trade-offs?"
  ],
  oops: [
    "Explain the four pillars of Object-Oriented Programming with real-world examples.",
    "What's the difference between inheritance and composition? When would you choose composition over inheritance?",
    "Explain polymorphism and provide examples of both compile-time and runtime polymorphism.",
    "What are abstract classes and interfaces? How do they differ and when would you use each?"
  ],
  dbms: [
    "Explain ACID properties in database transactions. Why is each property important?",
    "What are the different types of database indexes? How do they improve query performance?",
    "Describe the different levels of database normalization. What problems does each level solve?",
    "Explain the difference between SQL and NoSQL databases. When would you choose one over the other?"
  ],
  cns: [
    "What's the difference between TCP and UDP? Provide scenarios where you'd use each protocol.",
    "Explain how DNS works. What happens when you type a URL in your browser?",
    "Describe the OSI model layers. How does data flow through these layers?",
    "What is HTTP vs HTTPS? How does SSL/TLS ensure secure communication?"
  ]
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', interviewer: 'Code Mock is ready!' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize session state and conversation history if not present
    if (!req.session.interviewState) {
      req.session.interviewState = {
        phase: 'introduction',
        step: 0,
        introQuestionsAsked: 0,
        coreQuestionsAsked: 0,
        dsaGenerated: false,
        usedTopics: [] // Track which topics have been covered
      };
    }
    if (!req.session.conversationHistory) {
      req.session.conversationHistory = [];
    }

    const state = req.session.interviewState;
    const history = req.session.conversationHistory;

    // Add the latest user message to the history
    history.push({ role: 'candidate', content: message });

    let fullPrompt = '';
    const baseSystemPrompt = `You are "Code Mock", a technical interviewer conducting a real interview. You must follow the interview flow and respond as the interviewer, not generate scripts or examples. You are having a conversation with a real candidate right now.

IMPORTANT: You are the interviewer. Respond directly to the candidate. Do NOT create scripts, examples, or hypothetical conversations.`;

    // Log current phase for debugging
    console.log('Current phase:', state.phase);
    console.log('Intro questions asked:', state.introQuestionsAsked);
    console.log('Core questions asked:', state.coreQuestionsAsked);
    console.log('Used topics:', state.usedTopics);
    console.log('DSA generated:', state.dsaGenerated);
    console.log('User message:', message.substring(0, 100) + '...');

    // INTERVIEW FLOW LOGIC
    if (state.phase === 'introduction' && state.introQuestionsAsked === 0) {
      // Introduction phase - first question
      state.introQuestionsAsked = 1;
      
      fullPrompt = `${baseSystemPrompt}

RESPOND AS THE INTERVIEWER NOW. The candidate said: "${message}"

You are Code Mock, the interviewer. Introduce yourself and ask them about their technical background. Do NOT generate scripts, examples, or hypothetical conversations. Respond directly as the interviewer speaking to this candidate.

Say something like: "Hello there! I'm Code Mock, and I'll be your technical interviewer today. I'm really excited to get to know you and explore your technical skills together! To get started, could you please introduce yourself and tell me about your technical background?"`;
      
    } else if (state.phase === 'introduction' && state.introQuestionsAsked === 1) {
      // Introduction phase - second question
      state.introQuestionsAsked = 2;
      
      fullPrompt = `${baseSystemPrompt}

The candidate just answered your first introduction question: "${message}"

Acknowledge their response warmly and ask your second introduction question about their projects and experience.

Ask them to tell you about a recent project they're particularly proud of, including:
- What the project was about and what problem it solved
- What technologies and tools they used
- Their specific role and contributions
- Any interesting challenges they faced and how they overcame them

Show genuine interest in their project experience.`;
      
    } else if (state.phase === 'introduction' && state.introQuestionsAsked === 2) {
      // After second introduction question, move to core topics
      state.phase = 'core_topics';
      state.coreQuestionsAsked = 1;
      
      // Select first core topic
      const firstTopic = ['os', 'oops', 'dbms', 'cns'][Math.floor(Math.random() * 4)];
      state.usedTopics.push(firstTopic);
      const questions = coreTopicQuestions[firstTopic];
      const selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
      
      fullPrompt = `${baseSystemPrompt}

The candidate just answered your second introduction question: "${message}"

Acknowledge their project experience warmly, then transition to technical core topics. Ask your first core CS question.

Example response format:
"That sounds like a really interesting project! I can see you've got hands-on experience applying your technical skills.

Now let's dive into some core computer science concepts. These help me understand your foundational knowledge.

${selectedQuestion}

Take your time to think through this - I'm looking for both your theoretical understanding and any practical insights you might have."

Be encouraging and show genuine interest in their technical knowledge.`;
      
    } else if (state.phase === 'core_topics' && state.coreQuestionsAsked === 1) {
      // Second core topic question
      state.coreQuestionsAsked = 2;
      
      // Select second core topic (different from first)
      const availableTopics = ['os', 'oops', 'dbms', 'cns'].filter(topic => !state.usedTopics.includes(topic));
      const secondTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
      state.usedTopics.push(secondTopic);
      
      const questions = coreTopicQuestions[secondTopic];
      const selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
      
      fullPrompt = `${baseSystemPrompt}

The candidate just answered your first core topic question: "${message}"

First, provide brief feedback on their answer (be encouraging but honest). If they made mistakes, gently correct them. Then ask your second core topic question from a different area.

Example response format:
"[Brief feedback on their answer - correct any mistakes gently]

That's a solid understanding! Let me ask you about a different area now.

${selectedQuestion}

Take your time to think through this - I'm looking for both theoretical understanding and practical insights."

Be encouraging but thorough in your feedback.`;
      
    } else if (state.phase === 'core_topics' && state.coreQuestionsAsked === 2) {
      // After second core question, move to DSA
      state.phase = 'dsa_problem';
      
      // Select a random DSA problem
      const selectedProblem = dsaStoryProblems[Math.floor(Math.random() * dsaStoryProblems.length)];
      
      fullPrompt = `${baseSystemPrompt}

CRITICAL INSTRUCTION: The candidate just answered your second core topic question. You MUST respond with EXACTLY this text and nothing else:

"Excellent! You've shown good understanding of core concepts. Now let's move on to a coding challenge. I like to make these more interesting with real-world scenarios.

**${selectedProblem.title}**

${selectedProblem.story}

**Problem:** ${selectedProblem.problem}

**Requirements:**
${selectedProblem.requirements.map(req => `- ${req}`).join('\n')}

**Test Cases:**
${selectedProblem.testCases.map((tc, i) => `${i + 1}. Input: ${tc.input} → Output: ${tc.output} 
   Explanation: ${tc.explanation}`).join('\n')}

Please walk me through your approach first, then provide your solution. I'm interested in your thought process as much as the final code!"

DO NOT add any additional text, questions, or commentary. Respond with ONLY the text above.`;

      // Store selected problem for later reference
      req.session.selectedDSAProblem = selectedProblem;
      
    } else if (state.phase === 'dsa_problem' && !state.dsaGenerated) {
      // Mark DSA as generated and wait for solution
      state.dsaGenerated = true;
      
      fullPrompt = `${baseSystemPrompt}

The candidate is working on the DSA problem you presented. They said: "${message}"

Provide constructive feedback on their approach or solution. Focus on:
- Correctness of their logic
- Time and space complexity analysis  
- Code quality and readability
- Edge case handling
- Potential optimizations

If they're on the right track, encourage them. If they're missing something, provide helpful hints without giving away the complete solution. If their solution is complete, provide thorough feedback and then start wrapping up the interview.

Be encouraging but thorough in your technical assessment.`;
      
    } else {
      // Handle final discussion and wrap up
      fullPrompt = `${baseSystemPrompt}

This is the final part of the interview. The candidate provided: "${message}"

Provide comprehensive feedback on their overall interview performance. Address:
- Strengths you observed across all topics covered
- Areas for improvement (be constructive and specific)
- Their problem-solving approach
- Technical knowledge demonstrated
- Communication skills

Then wrap up the interview professionally with encouragement for their future endeavors.

Example format:
"[Comprehensive feedback on their performance]

Thank you for a great technical discussion! You've shown [specific strengths]. Keep working on [specific areas for improvement]. Best of luck with your job search, and keep coding!"

Be warm, professional, and encouraging in your closing.`;
    }

    // Update session state
    req.session.interviewState = state;
    req.session.conversationHistory = history;

    console.log('Sending prompt to Ollama (first 200 chars):', fullPrompt.substring(0, 200) + '...');

    // Call Ollama API with qwen2.5-coder:7b model
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5-coder:7b',
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.3, // Lower temperature for more focused responses
          top_p: 0.7, // Lower top_p for more focused responses
          max_tokens: 600, // Reasonable response length
          repeat_penalty: 1.1, // Prevent repetition
          stop: ['\n\n\n', 'Human:', 'Assistant:'] // Stop at natural breaks
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Enhanced response cleaning
    const cleanResponse = (response) => {
      // Remove <think>...</think> blocks and variations
      let cleaned = response.replace(/<think>[\s\S]*?<\/think>/gi, '');
      cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
      
      // Remove any remaining thinking indicators
      cleaned = cleaned.replace(/AI Assistant\s*<think>/gi, '');
      cleaned = cleaned.replace(/<think>/gi, '');
      cleaned = cleaned.replace(/<\/think>/gi, '');
      cleaned = cleaned.replace(/\*thinking\*/gi, '');
      
      // Remove excessive whitespace and newlines
      cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
      cleaned = cleaned.trim();
      
      // If the response is empty after cleaning, provide a fallback
      if (!cleaned || cleaned.length < 10) {
        cleaned = "I apologize, but I need to process that response better. Could you please repeat your answer? I want to make sure I give you proper feedback.";
      }
      
      return cleaned;
    };
    
    const cleanedResponse = cleanResponse(data.response);
    
    // Add interviewer response to history
    history.push({ role: 'interviewer', content: cleanedResponse });
    req.session.conversationHistory = history;
    
    console.log('Received response from Ollama');
    console.log('Updated phase:', state.phase);

    res.json({ 
      response: cleanedResponse,
      phase: state.phase,
      progress: {
        step: state.step,
        coreQuestionsAsked: state.coreQuestionsAsked,
        dsaGenerated: state.dsaGenerated,
        usedTopics: state.usedTopics
      }
    });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ 
      error: 'Failed to communicate with Ollama. Make sure Ollama is running with qwen2.5-coder:7b model.',
      details: error.message 
    });
  }
});

// Get interview progress
app.get('/api/progress', (req, res) => {
  const state = req.session.interviewState;
  if (!state) {
    return res.json({ phase: 'not_started', progress: 0 });
  }
  
  let progress = 0;
  switch (state.phase) {
    case 'introduction':
      if (state.introQuestionsAsked === 1) progress = 15;
      else if (state.introQuestionsAsked === 2) progress = 30;
      else progress = 5;
      break;
    case 'core_topics':
      if (state.coreQuestionsAsked === 1) progress = 50;
      else if (state.coreQuestionsAsked === 2) progress = 70;
      else progress = 35;
      break;
    case 'dsa_problem':
      progress = state.dsaGenerated ? 90 : 80;
      break;
    default:
      progress = 100;
  }
  
  res.json({
    phase: state.phase,
    progress: Math.min(progress, 100),
    details: {
      introQuestionsAsked: state.introQuestionsAsked,
      coreQuestionsAsked: state.coreQuestionsAsked,
      usedTopics: state.usedTopics,
      dsaGenerated: state.dsaGenerated
    }
  });
});

// Reset interview endpoint
app.post('/api/reset', (req, res) => {
  req.session.interviewState = null;
  req.session.conversationHistory = null;
  req.session.selectedDSAProblem = null;
  console.log('Code Mock interview session reset - ready for new candidate!');
  res.json({ 
    message: 'Interview session reset successfully! Code Mock is ready for a new candidate.',
    status: 'reset_complete'
  });
});

// Get current interview status
app.get('/api/status', (req, res) => {
  res.json({
    interviewer: 'Code Mock',
    phase: req.session.interviewState?.phase || 'not_started',
    state: req.session.interviewState || null,
    historyLength: req.session.conversationHistory?.length || 0,
    selectedProblem: req.session.selectedDSAProblem?.title || null
  });
});

// Force transition endpoint for testing
app.post('/api/force-transition', (req, res) => {
  const { phase } = req.body;
  if (req.session.interviewState) {
    req.session.interviewState.phase = phase || 'introduction';
    req.session.interviewState.step = 0;
    req.session.interviewState.introQuestionsAsked = 0;
    req.session.interviewState.coreQuestionsAsked = 0;
    req.session.interviewState.dsaGenerated = false;
    req.session.interviewState.usedTopics = [];
    console.log(`Forced transition to: ${phase || 'introduction'}`);
  }
  res.json({ 
    message: `Code Mock forced transition to ${phase || 'introduction'}`,
    newState: req.session.interviewState
  });
});

// Test interview flow endpoint
app.get('/api/test-flow', (req, res) => {
  const state = req.session.interviewState;
  res.json({
    currentState: state,
    nextPhase: state ? getNextPhase(state) : 'introduction',
    availableTopics: state && state.usedTopics ? ['os', 'oops', 'dbms', 'cns'].filter(t => !state.usedTopics.includes(t)) : ['os', 'oops', 'dbms', 'cns'],
    dsaProblems: dsaStoryProblems.length,
    coreQuestions: Object.keys(coreTopicQuestions).reduce((acc, topic) => {
      acc[topic] = coreTopicQuestions[topic].length;
      return acc;
    }, {})
  });
});

// Helper function to determine next phase
function getNextPhase(state) {
  if (state.phase === 'introduction') {
    if (state.introQuestionsAsked < 2) return 'introduction';
    return 'core_topics';
  } else if (state.phase === 'core_topics') {
    if (state.coreQuestionsAsked < 2) return 'core_topics';
    return 'dsa_problem';
  } else if (state.phase === 'dsa_problem') {
    return 'wrap_up';
  }
  return 'complete';
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong with Code Mock!',
    details: err.message 
  });
});

app.listen(port, () => {
  console.log(`🚀 Code Mock Interview Server running on http://localhost:${port}`);
  console.log('\n📋 Interview Flow:');
  console.log('1. 👋 Introduction (2 questions: background + project experience)');
  console.log('2. 🧠 Core CS Topics (2 questions from OS, OOPs, DBMS, CNS)');
  console.log('3. 💻 DSA Story-based Coding Challenge');
  console.log('4. 🎯 Feedback & Wrap-up');
  console.log('\n🔗 Available Endpoints:');
  console.log('- POST /api/chat - Main interview conversation');
  console.log('- GET /api/progress - Get interview progress');
  console.log('- POST /api/reset - Reset interview session');
  console.log('- GET /api/status - Get current interview status');
  console.log('- POST /api/force-transition - Force phase transition (testing)');
  console.log('- GET /api/test-flow - Test interview flow');
  console.log('\n🤖 Make sure Ollama is running with qwen2.5-coder:7b model!');
  console.log('💡 Code Mock is ready to conduct technical interviews!');
});