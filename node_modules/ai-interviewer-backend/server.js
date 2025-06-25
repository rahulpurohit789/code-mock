const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const session = require('express-session');
const { executeCode } = require('./src/controllers/codeController');
const { dsaProblemsPool } = require('./questionsPool');

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
    const { message, type, code, results, language, testCases } = req.body;
    
    if (!message && type !== 'code_analysis') {
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
        usedTopics: [], // Track which topics have been covered
        // New fields for progressive DSA interview
        dsaPhase: 'easy', // 'easy', 'complexity', 'optimization', 'medium_hard', 'feedback'
        easyProblemSolved: false,
        complexityAnalyzed: false,
        optimizationDiscussed: false,
        mediumHardProblemSolved: false,
        currentProblem: null,
        currentProblemCategory: null,
        currentProblemType: null
      };
    }
    if (!req.session.conversationHistory) {
      req.session.conversationHistory = [];
    }

    const state = req.session.interviewState;
    const history = req.session.conversationHistory;

    // Add the latest user message to the history
    if (type !== 'code_analysis') {
      history.push({ role: 'candidate', content: message });
    }

    let fullPrompt = '';
    const baseSystemPrompt = `You are "Code Mock", a technical interviewer conducting a real interview. You must follow the interview flow and respond as the interviewer, not generate scripts or examples. You are having a conversation with a real candidate right now.

IMPORTANT: You are the interviewer. Respond directly to the candidate. Do NOT create scripts, examples, or hypothetical conversations.

CRITICAL: When presenting DSA problems, you MUST use the exact problem data provided to you in the prompt. Do NOT generate or create your own problems. Use the title, problem statement, and requirements exactly as provided.

CRITICAL: Do NOT generate, create, or present any DSA problems unless explicitly instructed to do so with specific problem data. Only present problems when you are given the exact problem data to use.`;

    // Log current phase for debugging
    console.log('🔍 Current interview state:');
    console.log('  - Phase:', state.phase);
    console.log('  - DSA Phase:', state.dsaPhase);
    console.log('  - Intro questions asked:', state.introQuestionsAsked);
    console.log('  - Core questions asked:', state.coreQuestionsAsked);
    console.log('  - Used topics:', state.usedTopics);
    console.log('  - DSA generated:', state.dsaGenerated);
    console.log('  - Easy problem solved:', state.easyProblemSolved);
    console.log('  - Complexity analyzed:', state.complexityAnalyzed);
    console.log('  - Optimization discussed:', state.optimizationDiscussed);
    console.log('  - Medium-hard problem solved:', state.mediumHardProblemSolved);
    console.log('  - Current problem:', state.currentProblem?.title || 'None');
    console.log('  - User message:', message?.substring(0, 100) + '...');
    console.log('  - Message type:', type);

    // INTERVIEW FLOW LOGIC
    if (type === 'code_analysis') {
      console.log('🔍 Executing code analysis path');
      
      const allTestsPassed = results.testResults.every(r => r.passed);
      const passedTests = results.testResults.filter(r => r.passed).length;
      const totalTests = results.testResults.length;
      
      // Update interview state to move to complexity analysis phase
      if (state.phase === 'dsa_progressive' && state.dsaPhase === 'easy') {
        state.dsaPhase = 'complexity';
        // Clear the current problem after analysis
        state.currentProblem = null;
        console.log('🔍 Transitioning from easy problem to complexity analysis phase');
      } else if (state.phase === 'dsa_progressive' && state.dsaPhase === 'medium_hard') {
        state.dsaPhase = 'feedback';
        // Clear the current problem after analysis
        state.currentProblem = null;
        console.log('🔍 Transitioning from medium-hard problem to feedback phase');
      }
      
      fullPrompt = `${baseSystemPrompt}

You are analyzing the candidate's code solution. Here are the details:

CANDIDATE'S CODE (${language}):
\`\`\`${language}
${code}
\`\`\`

TEST RESULTS:
- Total test cases: ${totalTests}
- Passed: ${passedTests}
- Failed: ${totalTests - passedTests}
- All tests passed: ${allTestsPassed}

TEST CASE DETAILS:
${results.testResults.map((test, index) => 
  `Test ${index + 1}: ${test.passed ? 'PASSED' : 'FAILED'}
   Input: ${test.input}
   Expected: ${test.expectedOutput}
   Actual: ${test.actualOutput}
   ${test.error ? `Error: ${test.error}` : ''}`
).join('\n')}

YOUR TASK:
Analyze the candidate's code and ask them thoughtful questions about their solution. Focus on:

1. **If some tests failed:**
   - Ask them to explain their approach and identify potential issues
   - Ask about edge cases they might have missed
   - Encourage them to think about why certain test cases failed

2. **If all tests passed:**
   - Ask about their algorithm's time and space complexity
   - Ask if they can think of any optimizations
   - Ask about alternative approaches they considered
   - Challenge them with follow-up questions about their solution

3. **Code quality questions:**
   - Ask about their variable naming choices
   - Ask about their code structure and readability
   - Ask if they would change anything in their solution

4. **Problem-solving process:**
   - Ask how they approached the problem initially
   - Ask about any challenges they faced while coding
   - Ask what they learned from solving this problem

Be encouraging but thorough. Ask 2-3 specific questions about their code and approach.`;
      
    } else if (state.phase === 'introduction') {
      console.log('🔍 Executing introduction phase');
      
      // Handle introduction phase
      if (state.introQuestionsAsked === 0) {
        // First introduction question
        state.introQuestionsAsked = 1;
        fullPrompt = `${baseSystemPrompt}

You are starting the interview. The candidate just introduced themselves: "${message}"

Acknowledge their introduction warmly and ask about their technical background and experience. Be conversational and genuinely interested in their background.

Focus on:
- Acknowledge their introduction with their actual name
- Ask about their educational background
- Ask about their technical experience and programming languages
- Be warm and professional

Generate a natural, conversational response. Do not use placeholder text like "[Candidate's Name]" - use their actual name.`;
        
      } else if (state.introQuestionsAsked === 1) {
        // Second introduction question
        state.introQuestionsAsked = 2;
        fullPrompt = `${baseSystemPrompt}

The candidate just answered about their background: "${message}"

Acknowledge their background and ask about their most recent project or technical challenge. Be genuinely interested and ask follow-up questions.

Focus on:
- Acknowledge their background with specific details they mentioned
- Ask about a recent project or technical challenge they've worked on
- Ask about the project's purpose, technologies used, challenges faced, and what they learned
- Be conversational and show genuine interest

Generate a natural response that references specific details from their background.`;
        
      } else {
        // Move to core topics phase
        state.phase = 'core_topics';
        state.introQuestionsAsked = 2;
        fullPrompt = `${baseSystemPrompt}

The candidate just discussed their project experience: "${message}"

Acknowledge their project experience and transition smoothly to core computer science topics.

Focus on:
- Acknowledge their project experience with specific details they mentioned
- Transition to core computer science concepts
- Mention that you'll ask about fundamental topics like operating systems, object-oriented programming, databases, and computer networks
- Be encouraging and professional

Generate a natural transition that builds on their project experience.`;
      }
      
    } else if (state.phase === 'core_topics') {
      console.log('🔍 Executing core topics phase');
      
      // Handle core topics phase
      if (state.coreQuestionsAsked === 0) {
        // First core topic question
        state.coreQuestionsAsked = 1;
        
        // Select a random topic that hasn't been used
        const availableTopics = ['os', 'oops', 'dbms', 'cns'].filter(topic => !state.usedTopics.includes(topic));
        const selectedTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
        const selectedQuestion = coreTopicQuestions[selectedTopic][Math.floor(Math.random() * coreTopicQuestions[selectedTopic].length)];
        
        state.usedTopics.push(selectedTopic);
        
        fullPrompt = `${baseSystemPrompt}

The candidate just answered the first core topic question: "${message}"

Acknowledge their answer and ask the second core topic question. Provide feedback on their response and gently correct any misconceptions.

Focus on:
- Acknowledge their answer with specific feedback
- Gently correct any misconceptions if needed
- Ask the next question: "${selectedQuestion}"
- Be encouraging and supportive

Generate a natural response that provides constructive feedback and smoothly transitions to the next question.`;
        
      } else if (state.coreQuestionsAsked === 1) {
        // Second core topic question - transition to DSA
        state.coreQuestionsAsked = 2;
        state.phase = 'dsa_progressive';
        
        fullPrompt = `${baseSystemPrompt}

The candidate just answered the second core topic question: "${message}"

Acknowledge their answer and transition to the DSA coding challenges.

Focus on:
- Acknowledge their answer with specific feedback
- Transition to coding challenges
- Mention that you'll present algorithmic problems to test problem-solving skills
- Ask if they're ready for their first coding challenge
- Be encouraging and professional

Generate a natural transition that builds on their core topic performance.`;
        
      } else {
        // Should not reach here, but handle gracefully
        state.phase = 'dsa_progressive';
        fullPrompt = `${baseSystemPrompt}

The candidate has completed the core topics phase. Their last response was: "${message}"

Transition to the DSA coding challenges.

Focus on:
- Acknowledge their completion of core topics
- Transition to coding challenges
- Ask if they're ready for algorithmic problems
- Be encouraging and professional

Generate a natural transition to the coding phase.`;
      }
      
    } else if (state.phase === 'dsa_progressive' && state.dsaPhase === 'easy' && !state.easyProblemSolved) {
      console.log('🔍 Executing first DSA problem presentation');
      // Present the first easy DSA problem
      state.easyProblemSolved = true;
      
      // Select a random easy problem from the pool
      const easyProblems = dsaProblemsPool.filter(problem => problem.difficulty === 'easy');
      const selectedProblem = easyProblems[Math.floor(Math.random() * easyProblems.length)];
      
      state.currentProblem = selectedProblem;
      state.currentProblemCategory = 'easy';
      state.currentProblemType = 'easy';
      
      fullPrompt = `${baseSystemPrompt}

The candidate is ready for their first coding challenge. Their response is: "${message}"

IMPORTANT: Use the EXACT problem data provided below. Do NOT generate or create your own problem.

Present the first easy DSA problem to them. Be encouraging and supportive.

PROBLEM DATA TO USE:
- Title: "${selectedProblem.title}"
- Problem Statement: "${selectedProblem.problem}"
- Requirements: ${selectedProblem.requirements.map(req => `- ${req}`).join('\n')}

Focus on:
- Acknowledge their readiness
- Present the problem using the EXACT title and problem statement above
- List the requirements exactly as provided above
- Encourage them to take their time and walk through their approach
- Be supportive and encouraging

Generate a natural response that presents the problem clearly and encouragingly using ONLY the provided problem data.`;
      
    } else if (state.phase === 'dsa_progressive' && state.dsaPhase === 'easy' && state.easyProblemSolved && !state.currentProblem) {
      console.log('🔍 Executing first DSA problem presentation');
      // Present the first easy DSA problem (when transitioning from core topics)
      
      // Select a random easy problem from the pool
      const easyProblems = dsaProblemsPool.filter(problem => problem.difficulty === 'easy');
      const selectedProblem = easyProblems[Math.floor(Math.random() * easyProblems.length)];
      
      state.currentProblem = selectedProblem;
      state.currentProblemCategory = 'easy';
      state.currentProblemType = 'easy';
      
      fullPrompt = `${baseSystemPrompt}

The candidate is ready for their first coding challenge. Their response is: "${message}"

IMPORTANT: Use the EXACT problem data provided below. Do NOT generate or create your own problem.

Present the first easy DSA problem to them. Be encouraging and supportive.

PROBLEM DATA TO USE:
- Title: "${selectedProblem.title}"
- Problem Statement: "${selectedProblem.problem}"
- Requirements: ${selectedProblem.requirements.map(req => `- ${req}`).join('\n')}

Focus on:
- Acknowledge their readiness
- Present the problem using the EXACT title and problem statement above
- List the requirements exactly as provided above
- Encourage them to take their time and walk through their approach
- Be supportive and encouraging

Generate a natural response that presents the problem clearly and encouragingly using ONLY the provided problem data.`;
      
    } else if (state.phase === 'dsa_progressive' && state.dsaPhase === 'easy' && state.easyProblemSolved && state.currentProblem) {
      console.log('🔍 User is working on the first DSA problem');
      // User is working on the first problem - provide guidance and encouragement
      
      fullPrompt = `${baseSystemPrompt}

The candidate is working on the first DSA problem: "${message}"

Provide guidance and encouragement while they work on the problem. Ask them about their approach and help them think through the solution.

IMPORTANT: Do NOT generate or present any new problems. Only provide guidance on the current problem.

Focus on:
- Acknowledge their progress and approach
- Ask about their thought process and strategy
- Provide gentle hints if they seem stuck (without giving away the solution)
- Encourage them to think about data structures, time complexity, and edge cases
- Be supportive and helpful
- Do NOT present any new problems or problem statements

Generate a natural response that guides them without providing the solution. Do NOT generate any new problems.`;
      
    } else if (state.phase === 'dsa_progressive' && state.dsaPhase === 'easy' && state.easyProblemSolved && !state.currentProblem && message.toLowerCase().includes('yes')) {
      console.log('🔍 User said yes to first problem - transitioning to complexity analysis');
      // User said yes to the first problem, transition to complexity analysis
      state.dsaPhase = 'complexity';
      
      fullPrompt = `${baseSystemPrompt}

The candidate said "yes" to the first problem. Their response is: "${message}"

Transition to complexity analysis phase. Ask them about their solution's time and space complexity.

Focus on:
- Acknowledge their readiness to proceed
- Ask about their algorithm's time complexity
- Ask about their algorithm's space complexity
- Ask if they can think of any optimizations
- Be encouraging and supportive

Generate a natural response that transitions to complexity analysis.`;
      
    } else if (state.phase === 'dsa_progressive' && state.dsaPhase === 'complexity' && !state.complexityAnalyzed) {
      console.log('🔍 Executing complexity analysis - waiting for response path');
      // Mark complexity as analyzed and wait for response
      state.complexityAnalyzed = true;
      
      fullPrompt = `${baseSystemPrompt}

The candidate is analyzing the complexity of their solution. Their response is: "${message}"

Provide feedback on their complexity analysis and then ask about optimization opportunities.

IMPORTANT: Do NOT generate or present any new problems. Only provide feedback on their complexity analysis and ask about optimization opportunities.

Focus on:
- Provide feedback on their complexity analysis
- Gently correct any mistakes if needed
- Ask about optimization opportunities
- Encourage them to think about time complexity, space complexity, edge cases, and alternative approaches
- Be encouraging and constructive
- Do NOT present any new problems or problem statements

Generate a natural response that provides helpful feedback and guides them toward optimization thinking. Do NOT generate any problems.`;
      
    } else if (state.phase === 'dsa_progressive' && state.dsaPhase === 'complexity' && state.complexityAnalyzed) {
      console.log('🔍 Executing optimization discussion path');
      // After complexity analysis, move to optimization discussion
      state.dsaPhase = 'optimization';
      
      fullPrompt = `${baseSystemPrompt}

The candidate just discussed optimization strategies: "${message}"

Acknowledge their optimization thinking and then transition to a more challenging problem.

IMPORTANT: Do NOT generate or present any problems yet. Only acknowledge their optimization discussion and ask if they're ready for the next challenge.

Focus on:
- Acknowledge their optimization ideas with specific feedback
- Transition to a more challenging problem phase
- Ask if they're ready for the next challenge
- Be encouraging and prepare them for increased difficulty
- Do NOT present any specific problems or problem statements

Generate a natural response that acknowledges their progress and asks if they're ready for the next challenge. Do NOT generate any problems.`;
      
    } else if (state.phase === 'dsa_progressive' && state.dsaPhase === 'optimization' && !state.optimizationDiscussed) {
      console.log('🔍 Executing optimization - waiting for response path');
      // Mark optimization as discussed and wait for response
      state.optimizationDiscussed = true;
      
      fullPrompt = `${baseSystemPrompt}

The candidate is responding to the optimization discussion. Their response is: "${message}"

Acknowledge their readiness and present the medium-hard problem.

IMPORTANT: Do NOT generate or create your own problem. Wait for the next phase to present the problem from the pool.

Focus on:
- Acknowledge their response and readiness
- Prepare to present the medium-hard problem
- Be encouraging and supportive
- Do NOT present any problem statements or examples

Generate a natural response that acknowledges their readiness. Do NOT present any problems.`;
      
    } else if (state.phase === 'dsa_progressive' && state.dsaPhase === 'optimization' && state.optimizationDiscussed) {
      console.log('🔍 Executing medium-hard problem generation path');
      // Generate medium-hard problem
      state.dsaPhase = 'medium_hard';
      
      // Select medium or hard problem from the pool
      const mediumHardProblems = dsaProblemsPool.filter(problem => 
        problem.difficulty === 'medium' || problem.difficulty === 'hard'
      );
      
      // Select a random medium-hard problem
      const selectedProblem = mediumHardProblems[Math.floor(Math.random() * mediumHardProblems.length)];
      
      state.currentProblem = selectedProblem;
      state.currentProblemCategory = 'medium_hard';
      state.currentProblemType = 'medium_hard';
      
      fullPrompt = `${baseSystemPrompt}

The candidate is ready for the medium-hard problem. Their response is: "${message}"

IMPORTANT: Use the EXACT problem data provided below. Do NOT generate or create your own problem.

Present the medium-hard problem to them.

PROBLEM DATA TO USE:
- Title: "${selectedProblem.title}"
- Problem Statement: "${selectedProblem.problem}"
- Requirements: ${selectedProblem.requirements.map(req => `- ${req}`).join('\n')}

Focus on:
- Acknowledge their readiness
- Present the problem using the EXACT title and problem statement above
- List the requirements exactly as provided above
- Mention that this involves advanced algorithmic thinking and may require dynamic programming, two pointers, or other advanced techniques
- Encourage them to take their time and walk through their approach
- Be encouraging but emphasize the increased complexity

Generate a natural response that presents the problem clearly and prepares them for the challenge using ONLY the provided problem data.`;
      
    } else if (state.phase === 'dsa_progressive' && state.dsaPhase === 'medium_hard' && !state.mediumHardProblemSolved) {
      console.log('🔍 Executing medium-hard problem - waiting for solution path');
      // Mark medium-hard problem as solved and wait for solution
      state.mediumHardProblemSolved = true;
      
      fullPrompt = `${baseSystemPrompt}

The candidate has just been presented with the medium-hard DSA problem. Now, you must act as the interviewer waiting for their approach. The candidate's first response is: "${message}"

Your ONLY job right now is to ask them to explain their approach. Do NOT provide any hints, solutions, or code.

Focus on:
- Acknowledge their readiness
- Ask them to walk through their thought process
- Ask how they plan to approach this ${state.currentProblemCategory} problem
- Wait for them to explain their approach
- Do not provide hints or solutions

Generate a natural response that asks for their approach without giving away the solution.`;
      
    } else if (state.phase === 'dsa_progressive' && state.dsaPhase === 'medium_hard' && !state.mediumHardProblemSolved && state.currentProblem && message.toLowerCase().includes('yes')) {
      console.log('🔍 User said yes to medium-hard problem - asking for approach');
      // User said yes to the medium-hard problem, ask for their approach
      
      fullPrompt = `${baseSystemPrompt}

The candidate said "yes" to the medium-hard problem. Their response is: "${message}"

Ask them to explain their approach to the problem.

Focus on:
- Acknowledge their readiness
- Ask them to walk through their thought process
- Ask how they plan to approach this ${state.currentProblemCategory} problem
- Wait for them to explain their approach
- Do not provide hints or solutions

Generate a natural response that asks for their approach without giving away the solution.`;
      
    } else if (state.phase === 'dsa_progressive' && state.dsaPhase === 'medium_hard' && state.mediumHardProblemSolved) {
      console.log('🔍 Executing final feedback and wrap-up path');
      // After medium-hard problem, move to final feedback
      state.dsaPhase = 'feedback';
      
      fullPrompt = `${baseSystemPrompt}

The candidate just provided their solution to the medium-hard problem: "${message}"

This is the final part of the interview. Provide comprehensive feedback on their overall interview performance.

Focus on:
- Thank them for completing the interview
- Provide specific feedback on their strengths
- Mention areas for improvement constructively
- Give an overall assessment
- Provide specific recommendations
- Be warm, professional, and constructive

Generate a comprehensive feedback response that is helpful and encouraging.`;
      
    } else if (state.phase === 'dsa_progressive' && state.dsaPhase === 'feedback') {
      console.log('🔍 Executing final wrap-up path');
      // Final wrap-up - mark interview as complete
      state.phase = 'complete';
      state.dsaPhase = 'complete';
      
      fullPrompt = `${baseSystemPrompt}

The candidate has received comprehensive feedback. Their response is: "${message}"

This is the FINAL response of the interview. Provide a conclusive wrap-up and end the interview.

Focus on:
- Thank them for their response
- Conclude the interview professionally
- Encourage them to keep learning and practicing
- Wish them well in their career journey
- End on a positive and encouraging note
- Make it clear that the interview is now complete

Generate a natural wrap-up response that concludes the interview professionally and indicates the interview is over.`;
      
    } else if (state.phase === 'complete') {
      console.log('🔍 Interview already completed');
      // Interview is already complete
      fullPrompt = `${baseSystemPrompt}

The interview has already been completed. The candidate's response is: "${message}"

Provide a brief acknowledgment that the interview is complete.

Focus on:
- Acknowledge that the interview is complete
- Thank them for their time
- Wish them well
- Keep the response brief and professional

Generate a brief response acknowledging the interview completion.`;
    } else if (state.phase === 'dsa_progressive' && state.dsaPhase === 'medium_hard' && !state.mediumHardProblemSolved && state.currentProblem) {
      console.log('🔍 User is working on the medium-hard DSA problem');
      // User is working on the medium-hard problem - provide guidance and encouragement
      
      fullPrompt = `${baseSystemPrompt}

The candidate is working on the medium-hard DSA problem: "${message}"

Provide guidance and encouragement while they work on the problem. Ask them about their approach and help them think through the solution.

Focus on:
- Acknowledge their progress and approach
- Ask about their thought process and strategy for this ${state.currentProblemCategory} problem
- Provide gentle hints if they seem stuck (without giving away the solution)
- Encourage them to think about data structures, time complexity, edge cases, and breaking down the problem
- Be supportive and helpful

Generate a natural response that guides them without providing the solution.`;
    }

    // Fallback case for unhandled states
    if (!fullPrompt) {
      console.log('⚠️ No specific condition matched, using fallback response');
      console.log('⚠️ Current state details for debugging:');
      console.log('  - Phase:', state.phase);
      console.log('  - DSA Phase:', state.dsaPhase);
      console.log('  - Easy problem solved:', state.easyProblemSolved);
      console.log('  - Complexity analyzed:', state.complexityAnalyzed);
      console.log('  - Optimization discussed:', state.optimizationDiscussed);
      console.log('  - Medium-hard problem solved:', state.mediumHardProblemSolved);
      console.log('  - Current problem:', state.currentProblem?.title || 'None');
      
      fullPrompt = `${baseSystemPrompt}

The candidate's response is: "${message}"

You are in an interview state that wasn't specifically handled. 

IMPORTANT: Do NOT generate or present any new DSA problems. Only ask follow-up questions or provide guidance on the current problem.

Current interview state:
- Phase: ${state.phase}
- DSA Phase: ${state.dsaPhase || 'N/A'}
- Current Problem: ${state.currentProblem?.title || 'None'}

Provide a helpful response that moves the interview forward without presenting new problems.

Example response format:
"I appreciate your response. Let me ask you a follow-up question to better understand your thinking.

[Ask a relevant follow-up question based on the current interview phase]"

Be helpful and move the conversation forward. Do NOT present new problems.`;
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
          temperature: req.session.includeDSAProblem ? 0.1 : 0.3, // Lower temperature for JSON generation
          top_p: req.session.includeDSAProblem ? 0.9 : 0.7, // Higher top_p for JSON generation
          max_tokens: 1800, // Increased token limit for large JSON
          repeat_penalty: 1.1, // Prevent repetition
          stop: req.session.includeDSAProblem ? [] : ['\n\n\n', 'Human:', 'Assistant:'] // No stop tokens for JSON generation
        }
      }),
    });

    if (!response.ok) {
      console.error('❌ Ollama API error:', response.status, response.statusText);
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Ollama API response received');
    console.log('Response data keys:', Object.keys(data));
    console.log('Response length:', data.response?.length || 0);
    
    // Remove dynamic DSA problem generation logic - use only predefined problems
    // The system will use problems from questionsPool.js instead of generating them dynamically
    
    // Enhanced response cleaning
    const cleanResponse = (response) => {
      console.log('🧹 Starting response cleaning...');
      console.log('Original response length:', response.length);
      
      // Remove <think>...</think> blocks and variations
      let cleaned = response.replace(/<think>[\s\S]*?<\/think>/gi, '');
      cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
      
      // Remove any remaining thinking indicators
      cleaned = cleaned.replace(/AI Assistant\s*<think>/gi, '');
      cleaned = cleaned.replace(/<think>/gi, '');
      cleaned = cleaned.replace(/<\/think>/gi, '');
      cleaned = cleaned.replace(/\*thinking\*/gi, '');
      
      // Remove excessive whitespace and newlines (but be more conservative)
      cleaned = cleaned.replace(/\n\s*\n\s*\n\s*\n/g, '\n\n'); // Only remove 4+ consecutive newlines
      cleaned = cleaned.trim();
      
      console.log('Cleaned response length:', cleaned.length);
      console.log('Cleaned response (first 200 chars):', cleaned.substring(0, 200));
      
      // Only use fallback if response is completely empty or very short
      if (!cleaned || cleaned.length < 5) {
        console.log('⚠️ Response was too short after cleaning, using fallback');
        cleaned = "I appreciate your response. Could you please elaborate a bit more so I can provide better feedback?";
      }
      
      return cleaned;
    };
    
    const cleanedResponse = cleanResponse(data.response);
    
    // Add interviewer response to history
    history.push({ role: 'interviewer', content: cleanedResponse });
    req.session.conversationHistory = history;
    
    console.log('Received response from Ollama');
    console.log('Updated phase:', state.phase);

    // Create response object
    const responseData = { 
      response: cleanedResponse,
      phase: state.phase,
      dsaPhase: state.dsaPhase,
      progress: {
        step: state.step,
        coreQuestionsAsked: state.coreQuestionsAsked,
        dsaGenerated: state.dsaGenerated,
        usedTopics: state.usedTopics
      }
    };

    // Add completion status
    if (state.phase === 'complete') {
      responseData.interviewComplete = true;
      responseData.completionMessage = 'Interview completed successfully!';
      console.log('🎉 Interview marked as complete');
    }

    // Include DSA problem data if a problem is being presented
    if (state.currentProblem) {
      responseData.dsaProblem = state.currentProblem;
      console.log('📋 Sending DSA problem data:', state.currentProblem.title);
    }

    res.json(responseData);
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
      if (state.introQuestionsAsked === 1) progress = 10;
      else if (state.introQuestionsAsked === 2) progress = 20;
      else progress = 5;
      break;
    case 'core_topics':
      if (state.coreQuestionsAsked === 1) progress = 35;
      else if (state.coreQuestionsAsked === 2) progress = 50;
      else progress = 25;
      break;
    case 'dsa_progressive':
      // Progressive DSA interview has multiple phases
      switch (state.dsaPhase) {
        case 'easy':
          progress = state.easyProblemSolved ? 65 : 60;
          break;
        case 'complexity':
          progress = state.complexityAnalyzed ? 70 : 65;
          break;
        case 'optimization':
          progress = state.optimizationDiscussed ? 75 : 70;
          break;
        case 'medium_hard':
          progress = state.mediumHardProblemSolved ? 90 : 80;
          break;
        case 'feedback':
          progress = 95;
          break;
        default:
          progress = 55;
      }
      break;
    case 'dsa_problem':
      progress = state.dsaGenerated ? 90 : 80;
      break;
    default:
      progress = 100;
  }
  
  res.json({
    phase: state.phase,
    dsaPhase: state.dsaPhase,
    progress: Math.min(progress, 100),
    details: {
      introQuestionsAsked: state.introQuestionsAsked,
      coreQuestionsAsked: state.coreQuestionsAsked,
      usedTopics: state.usedTopics,
      dsaGenerated: state.dsaGenerated,
      easyProblemSolved: state.easyProblemSolved,
      complexityAnalyzed: state.complexityAnalyzed,
      optimizationDiscussed: state.optimizationDiscussed,
      mediumHardProblemSolved: state.mediumHardProblemSolved,
      currentProblemCategory: state.currentProblemCategory,
      currentProblemType: state.currentProblemType
    }
  });
});

// Reset interview endpoint
app.post('/api/reset', (req, res) => {
  req.session.interviewState = null;
  req.session.conversationHistory = null;
  req.session.selectedDSAProblem = null;
  req.session.includeDSAProblem = false;
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
    dsaPhase: req.session.interviewState?.dsaPhase || null,
    state: req.session.interviewState || null,
    historyLength: req.session.conversationHistory?.length || 0,
    selectedProblem: req.session.selectedDSAProblem?.title || null,
    currentProblemCategory: req.session.interviewState?.currentProblemCategory || null,
    currentProblemType: req.session.interviewState?.currentProblemType || null
  });
});

// Force transition endpoint for testing
app.post('/api/force-transition', (req, res) => {
  const { phase, dsaPhase } = req.body;
  if (req.session.interviewState) {
    req.session.interviewState.phase = phase || 'introduction';
    req.session.interviewState.step = 0;
    req.session.interviewState.introQuestionsAsked = 0;
    req.session.interviewState.coreQuestionsAsked = 0;
    req.session.interviewState.dsaGenerated = false;
    req.session.interviewState.usedTopics = [];
    
    // Reset progressive DSA fields
    req.session.interviewState.dsaPhase = dsaPhase || 'easy';
    req.session.interviewState.easyProblemSolved = false;
    req.session.interviewState.complexityAnalyzed = false;
    req.session.interviewState.optimizationDiscussed = false;
    req.session.interviewState.mediumHardProblemSolved = false;
    req.session.interviewState.currentProblem = null;
    req.session.interviewState.currentProblemCategory = null;
    req.session.interviewState.currentProblemType = null;
    
    console.log(`Forced transition to: ${phase || 'introduction'}${dsaPhase ? ` (dsaPhase: ${dsaPhase})` : ''}`);
  }
  res.json({ 
    message: `Code Mock forced transition to ${phase || 'introduction'}${dsaPhase ? ` (dsaPhase: ${dsaPhase})` : ''}`,
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
    dsaProblems: dsaProblemsPool.length,
    coreQuestions: Object.keys(coreTopicQuestions).reduce((acc, topic) => {
      acc[topic] = coreTopicQuestions[topic].length;
      return acc;
    }, {}),
    dsaCategories: {
      easy: Math.floor(dsaProblemsPool.length / 2), // Rough estimate for easy problems
      medium_hard: Math.floor(dsaProblemsPool.length / 2) // Rough estimate for medium-hard problems
    }
  });
});

// Helper function to determine next phase
function getNextPhase(state) {
  if (state.phase === 'introduction') {
    if (state.introQuestionsAsked < 2) return 'introduction';
    return 'core_topics';
  } else if (state.phase === 'core_topics') {
    if (state.coreQuestionsAsked < 2) return 'core_topics';
    return 'dsa_progressive';
  } else if (state.phase === 'dsa_progressive') {
    // Progressive DSA flow
    if (state.dsaPhase === 'easy') {
      if (!state.easyProblemSolved) return 'dsa_progressive';
      return 'dsa_progressive'; // Move to complexity analysis
    } else if (state.dsaPhase === 'complexity') {
      if (!state.complexityAnalyzed) return 'dsa_progressive';
      return 'dsa_progressive'; // Move to optimization
    } else if (state.dsaPhase === 'optimization') {
      if (!state.optimizationDiscussed) return 'dsa_progressive';
      return 'dsa_progressive'; // Move to medium-hard problem
    } else if (state.dsaPhase === 'medium_hard') {
      if (!state.mediumHardProblemSolved) return 'dsa_progressive';
      return 'dsa_progressive'; // Move to feedback
    } else if (state.dsaPhase === 'feedback') {
      return 'complete';
    }
    return 'dsa_progressive';
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

// Code execution endpoint
app.post('/api/code/execute', executeCode);

app.listen(port, () => {
  console.log(`🚀 Code Mock Interview Server running on http://localhost:${port}`);
  console.log('\n📋 Progressive Interview Flow:');
  console.log('1. 👋 Introduction (2 questions: background + project experience)');
  console.log('2. 🧠 Core CS Topics (2 questions from OS, OOPs, DBMS, CNS)');
  console.log('3. 💻 Progressive DSA Challenges:');
  console.log('   - Easy problems (arrays, strings, linked lists)');
  console.log('   - Time & Space complexity analysis');
  console.log('   - Optimization discussion');
  console.log('   - Medium-Hard problems (DP, trees, graphs, 2D arrays)');
  console.log('4. 🎯 Comprehensive feedback & wrap-up');
  console.log('\n🔗 Available Endpoints:');
  console.log('- POST /api/chat - Main interview conversation');
  console.log('- GET /api/progress - Get interview progress');
  console.log('- POST /api/reset - Reset interview session');
  console.log('- GET /api/status - Get current interview status');
  console.log('- POST /api/force-transition - Force phase transition (testing)');
  console.log('- GET /api/test-flow - Test interview flow');
  console.log('- POST /api/code/execute - Execute code');
  console.log('\n🤖 Make sure Ollama is running with qwen2.5-coder:7b model!');
  console.log('💡 Code Mock is ready to conduct progressive technical interviews!');
});