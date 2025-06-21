const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const session = require('express-session');
const { executeCode } = require('./src/controllers/codeController');

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
        usedTopics: [] // Track which topics have been covered
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

IMPORTANT: You are the interviewer. Respond directly to the candidate. Do NOT create scripts, examples, or hypothetical conversations.`;

    // Log current phase for debugging
    console.log('🔍 Current interview state:');
    console.log('  - Phase:', state.phase);
    console.log('  - Intro questions asked:', state.introQuestionsAsked);
    console.log('  - Core questions asked:', state.coreQuestionsAsked);
    console.log('  - Used topics:', state.usedTopics);
    console.log('  - DSA generated:', state.dsaGenerated);
    console.log('  - User message:', message?.substring(0, 100) + '...');
    console.log('  - Message type:', type);

    // INTERVIEW FLOW LOGIC
    if (type === 'code_analysis') {
      console.log('🔍 Executing code analysis path');
      
      const allTestsPassed = results.testResults.every(r => r.passed);
      const passedTests = results.testResults.filter(r => r.passed).length;
      const totalTests = results.testResults.length;
      
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
      
    } else if (state.phase === 'introduction' && state.introQuestionsAsked === 0) {
      console.log('🔍 Executing introduction phase - first question path');
      // Introduction phase - first question
      state.introQuestionsAsked = 1;
      
      fullPrompt = `${baseSystemPrompt}

RESPOND AS THE INTERVIEWER NOW. The candidate said: "${message}"

You are Code Mock, the interviewer. Introduce yourself and ask them about their technical background. Do NOT generate scripts, examples, or hypothetical conversations. Respond directly as the interviewer speaking to this candidate.

Say something like: "Hello there! I'm Code Mock, and I'll be your technical interviewer today. I'm really excited to get to know you and explore your technical skills together! To get started, could you please introduce yourself and tell me about your technical background?"`;
      
    } else if (state.phase === 'introduction' && state.introQuestionsAsked === 1) {
      console.log('🔍 Executing introduction phase - second question path');
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
      console.log('🔍 Executing transition to core topics path');
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
      console.log('🔍 Executing core topics - second question path');
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
      console.log('🔍 Executing DSA problem generation path');
      // After second core question, move to DSA problem generation by AI
      state.phase = 'dsa_problem';
      state.dsaProblemsSolved = 0; // Initialize problem solved counter
      
      fullPrompt = `You are a senior software engineer creating a new coding problem for a technical interview.

CRITICAL: You MUST respond with ONLY a valid JSON object. No other text, no explanations, no markdown formatting.

Generate a complete, brand-new, easy-to-medium difficulty data structures and algorithms (DSA) problem.

REQUIRED JSON STRUCTURE (respond with ONLY this JSON, nothing else):
{
  "title": "A creative and short problem title",
  "story": "A short, engaging story to set the scene for the problem.",
  "problem": "A clear and concise statement of the task.",
  "requirements": [
    "A list of requirements, like input/output formats and constraints."
  ],
  "testCases": [
    { "input": "...", "output": "...", "explanation": "..." },
    { "input": "...", "output": "...", "explanation": "..." },
    { "input": "...", "output": "...", "explanation": "..." }
  ],
  "hiddenTestCases": [
    { "input": "...", "output": "..." },
    { "input": "...", "output": "..." },
    { "input": "...", "output": "..." },
    { "input": "...", "output": "..." },
    { "input": "...", "output": "..." }
  ],
  "skeletonCode": {
    "python": "def solution(input_data):\\n    # Your code here\\n    pass",
    "javascript": "function solution(input_data) {\\n    // Your code here\\n}",
    "java": "class Solution {\\n    public Object solution(Object input_data) {\\n        // Your code here\\n        return null;\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    auto solution(auto input_data) {\\n        // Your code here\\n        return {};\\n    }\\n};"
  }
}

CRITICAL RULES FOR TEST CASES:
- Input and output must be valid JSON strings that can be parsed by JSON.parse()
- For array inputs, use format: "[1,2,3]" (with quotes)
- For string inputs, use format: "hello" (with quotes)
- For number inputs, use format: 42 (without quotes)
- For boolean inputs, use format: true or false (without quotes)
- For object inputs, use format: "{\\"key\\":\\"value\\"}" (with escaped quotes)
- NEVER use single quotes, only double quotes
- Ensure input format matches what the solution function expects
- Test cases should cover edge cases and normal cases
- All test cases must be consistent in their input/output format

EXAMPLE CORRECT TEST CASES:
- Array problem: {"input": "[1,2,3]", "output": "6", "explanation": "Sum of array elements"}
- String problem: {"input": "\\"hello\\"", "output": "5", "explanation": "Length of string"}
- Number problem: {"input": 42, "output": 84, "explanation": "Double the number"}

RULES:
- Respond with ONLY the JSON object above, starting with { and ending with }
- Do NOT include any markdown formatting, code blocks, or explanatory text
- The main function in skeleton code for ALL languages MUST be named 'solution'
- All input/output values in test cases must be valid JSON strings
- The problem should be solvable with fundamental DSA concepts
- NO CONVERSATION, NO EXPLANATIONS - ONLY THE JSON OBJECT`;
      
      // We are now generating a problem, not presenting a pre-made one.
      // The flag will be used by the frontend to know to parse the DSA problem.
      req.session.includeDSAProblem = true;
      
    } else if (state.phase === 'dsa_problem' && !state.dsaGenerated) {
      console.log('🔍 Executing DSA problem - waiting for approach path');
      // Mark DSA as generated and wait for solution
      state.dsaGenerated = true;
      
      fullPrompt = `${baseSystemPrompt}

The candidate has just been presented with the DSA problem. Now, you must act as the interviewer waiting for their approach. The candidate's first response is: "${message}"

Your ONLY job right now is to ask them to explain their approach. Do NOT provide any hints, solutions, or code.

Acknowledge their readiness and ask them something like:
"Great. Before you start writing code, could you please walk me through your thought process? How are you planning to tackle this problem?"

Wait for them to explain their approach. Do not say anything else.`;
      
    } else {
      console.log('🔍 Executing fallback/wrap-up path');
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
    
    // If we were expecting a DSA problem, parse it from the response
    if (req.session.includeDSAProblem) {
      const rawResponse = data.response;
      console.log('🔍 Raw AI response for DSA problem generation:');
      console.log('Raw response length:', rawResponse.length);
      console.log('Raw response (first 500 chars):', rawResponse.substring(0, 500));
      console.log('Raw response (last 500 chars):', rawResponse.substring(Math.max(0, rawResponse.length - 500)));
      
      // Try multiple parsing strategies
      let jsonContent = null;
      
      // Strategy 1: Look for JSON in markdown code blocks
      const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonContent = jsonMatch[1].trim();
        console.log('✅ Found JSON in markdown code block');
      } else {
        // Strategy 2: Look for any code block
        const altMatch = rawResponse.match(/```\s*([\s\S]*?)\s*```/);
        if (altMatch && altMatch[1]) {
          console.log('🔍 Trying alternative JSON pattern (without "json" identifier)');
          jsonContent = altMatch[1].trim();
        } else {
          // Strategy 3: Look for JSON-like content without markdown blocks
          const jsonLikeMatch = rawResponse.match(/\{\s*"title"\s*:/);
          if (jsonLikeMatch) {
            console.log('🔍 Found JSON-like content without markdown blocks');
            const startIndex = rawResponse.indexOf('{');
            const endIndex = rawResponse.lastIndexOf('}');
            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
              jsonContent = rawResponse.substring(startIndex, endIndex + 1);
            }
          } else {
            // Strategy 4: Try to find any JSON object in the response
            const anyJsonMatch = rawResponse.match(/\{[\s\S]*\}/);
            if (anyJsonMatch) {
              console.log('🔍 Found potential JSON object in response');
              jsonContent = anyJsonMatch[0];
            }
          }
        }
      }
      
      if (jsonContent) {
        console.log('🔍 Extracted JSON content:');
        console.log('JSON content length:', jsonContent.length);
        console.log('JSON content (first 500 chars):', jsonContent.substring(0, 500));
        console.log('JSON content (last 500 chars):', jsonContent.substring(Math.max(0, jsonContent.length - 500)));
        
        // --- JSON Repair Step ---
        function repairJsonString(str) {
          let fixed = str;
          // Replace single quotes with double quotes
          fixed = fixed.replace(/'/g, '"');
          // Remove trailing commas before } or ]
          fixed = fixed.replace(/,\s*([}\]])/g, '$1');
          
          // Enhanced test case validation and repair
          // Fix input format issues
          fixed = fixed.replace(/"input"\s*:\s*([^\[\"{][^,}]*)/g, function(match, p1) {
            const trimmed = p1.trim();
            // If it's a number, keep it as is
            if (!isNaN(trimmed) && trimmed !== '') {
              return `"input": ${trimmed}`;
            }
            // If it's a boolean, keep it as is
            if (trimmed === 'true' || trimmed === 'false') {
              return `"input": ${trimmed}`;
            }
            // If it's not starting with [ or " or {, wrap in quotes
            if (!trimmed.startsWith('[') && !trimmed.startsWith('"') && !trimmed.startsWith('{')) {
              return `"input": "${trimmed.replace(/"/g, '')}"`;
            }
            return match;
          });
          
          // Fix output format issues
          fixed = fixed.replace(/"output"\s*:\s*([^\[\"{][^,}]*)/g, function(match, p1) {
            const trimmed = p1.trim();
            // If it's a number, keep it as is
            if (!isNaN(trimmed) && trimmed !== '') {
              return `"output": ${trimmed}`;
            }
            // If it's a boolean, keep it as is
            if (trimmed === 'true' || trimmed === 'false') {
              return `"output": ${trimmed}`;
            }
            // If it's not starting with [ or " or {, wrap in quotes
            if (!trimmed.startsWith('[') && !trimmed.startsWith('"') && !trimmed.startsWith('{')) {
              return `"output": "${trimmed.replace(/"/g, '')}"`;
            }
            return match;
          });
          
          // Validate and fix array inputs that might be missing quotes
          fixed = fixed.replace(/"input"\s*:\s*\[([^\]]+)\]/g, function(match, content) {
            // If the array content doesn't look like it's properly quoted, fix it
            if (!content.includes('"') && content.includes(',')) {
              const items = content.split(',').map(item => {
                const trimmed = item.trim();
                if (!isNaN(trimmed)) {
                  return trimmed; // Keep numbers as is
                }
                return `"${trimmed}"`; // Quote strings
              });
              return `"input": [${items.join(',')}]`;
            }
            return match;
          });
          
          return fixed;
        }
        // --- End JSON Repair Step ---
        
        let dsaProblem = null;
        let parseError = null;
        try {
          dsaProblem = JSON.parse(jsonContent);
        } catch (e) {
          // Try to repair and parse again
          try {
            const repaired = repairJsonString(jsonContent);
            dsaProblem = JSON.parse(repaired);
            console.warn('⚠️ JSON was repaired before parsing.');
          } catch (e2) {
            parseError = e2;
          }
        }
        if (dsaProblem) {
          console.log('✅ Successfully parsed DSA problem JSON:');
          console.log('Problem title:', dsaProblem.title);
          console.log('Test cases count:', dsaProblem.testCases?.length || 0);
          console.log('Hidden test cases count:', dsaProblem.hiddenTestCases?.length || 0);
          console.log('Skeleton code languages:', Object.keys(dsaProblem.skeletonCode || {}));
          
          // Validate and fix test cases
          const validateAndFixTestCases = (testCases) => {
            if (!testCases || !Array.isArray(testCases)) return [];
            
            return testCases.map((testCase, index) => {
              const fixed = { ...testCase };
              
              // Ensure input is properly formatted
              if (typeof fixed.input === 'string') {
                try {
                  // Try to parse as JSON to validate
                  JSON.parse(fixed.input);
                } catch (e) {
                  // If it's a number, convert to number format
                  if (!isNaN(fixed.input) && fixed.input !== '') {
                    fixed.input = parseFloat(fixed.input);
                  } else if (fixed.input === 'true' || fixed.input === 'false') {
                    fixed.input = fixed.input === 'true';
                  } else {
                    // If it's not a valid JSON string, wrap it in quotes
                    fixed.input = `"${fixed.input.replace(/"/g, '')}"`;
                  }
                }
              }
              
              // Ensure output is properly formatted
              if (typeof fixed.output === 'string') {
                try {
                  // Try to parse as JSON to validate
                  JSON.parse(fixed.output);
                } catch (e) {
                  // If it's a number, convert to number format
                  if (!isNaN(fixed.output) && fixed.output !== '') {
                    fixed.output = parseFloat(fixed.output);
                  } else if (fixed.output === 'true' || fixed.output === 'false') {
                    fixed.output = fixed.output === 'true';
                  } else {
                    // If it's not a valid JSON string, wrap it in quotes
                    fixed.output = `"${fixed.output.replace(/"/g, '')}"`;
                  }
                }
              }
              
              console.log(`Test case ${index + 1}: input=${JSON.stringify(fixed.input)}, output=${JSON.stringify(fixed.output)}`);
              return fixed;
            });
          };
          
          // Fix test cases
          dsaProblem.testCases = validateAndFixTestCases(dsaProblem.testCases);
          dsaProblem.hiddenTestCases = validateAndFixTestCases(dsaProblem.hiddenTestCases);
          
          // Validate the parsed problem has required fields
          if (!dsaProblem.title || !dsaProblem.problem || !dsaProblem.testCases || !dsaProblem.skeletonCode) {
            throw new Error('Generated problem is missing required fields');
          }
          req.session.selectedDSAProblem = dsaProblem;
          state.dsaGenerated = true;
          req.session.interviewState = state;
          req.session.includeDSAProblem = false; // Reset flag
          const interviewerMessage = "Excellent! You've shown a good grasp of the core concepts. Now, let's move on to a coding challenge. The problem details should be visible on your screen. Please take a moment to read it, and then walk me through your approach before you start coding.";
          history.push({ role: 'interviewer', content: interviewerMessage });
          req.session.conversationHistory = history;
          return res.json({ dsaProblem, response: interviewerMessage, phase: state.phase });
        } else {
          // Fallback DSA problem if repair also fails
          console.error('❌ JSON parsing failed after repair:', parseError);
          const fallbackDSA = {
            title: "Sum of Array Elements",
            story: "You are given an array of integers. Your task is to find the sum of all the elements in the array.",
            problem: "Given an array of integers, return the sum of its elements.",
            requirements: [
              "Input: An array of integers (length 1-1000, values -10^6 to 10^6)",
              "Output: An integer representing the sum of the array elements."
            ],
            testCases: [
              { input: "[1,2,3,4,5]", output: "15", explanation: "1+2+3+4+5=15" },
              { input: "[0,0,0]", output: "0", explanation: "All elements are zero." },
              { input: "[-1,1,-1,1]", output: "0", explanation: "Sum of positives and negatives is zero." }
            ],
            hiddenTestCases: [
              { input: "[100,200,300]", output: "600" },
              { input: "[42]", output: "42" },
              { input: "[-1000,1000]", output: "0" },
              { input: "[1,2,3,4,5,6,7,8,9,10]", output: "55" },
              { input: "[999999,-999999]", output: "0" }
            ],
            skeletonCode: {
              python: "def solution(input_data):\n    # Your code here\n    pass",
              javascript: "function solution(input_data) {\n    // Your code here\n}",
              java: "class Solution {\n    public Object solution(Object input_data) {\n        // Your code here\n        return null;\n    }\n}",
              cpp: "class Solution {\npublic:\n    auto solution(auto input_data) {\n        // Your code here\n        return {};\n    }\n};"
            }
          };
          req.session.selectedDSAProblem = fallbackDSA;
          state.dsaGenerated = true;
          req.session.interviewState = state;
          req.session.includeDSAProblem = false;
          const interviewerMessage = "The AI failed to generate a new problem, so here is a fallback problem. Please solve it as you would in a real interview.";
          history.push({ role: 'interviewer', content: interviewerMessage });
          req.session.conversationHistory = history;
          return res.json({ dsaProblem: fallbackDSA, response: interviewerMessage, phase: state.phase });
        }
      } else {
        console.error("❌ AI did not return a valid JSON block for the DSA problem.");
        console.error("❌ Full raw response:", rawResponse);
        console.error("❌ JSON regex patterns tried: /```json\\s*([\\s\\S]*?)\\s*```/, /```\\s*([\\s\\S]*?)\\s*```/, and JSON-like content search");
        // Fallback DSA problem
        const fallbackDSA = {
          title: "Sum of Array Elements",
          story: "You are given an array of integers. Your task is to find the sum of all the elements in the array.",
          problem: "Given an array of integers, return the sum of its elements.",
          requirements: [
            "Input: An array of integers (length 1-1000, values -10^6 to 10^6)",
            "Output: An integer representing the sum of the array elements."
          ],
          testCases: [
            { input: "[1,2,3,4,5]", output: "15", explanation: "1+2+3+4+5=15" },
            { input: "[0,0,0]", output: "0", explanation: "All elements are zero." },
            { input: "[-1,1,-1,1]", output: "0", explanation: "Sum of positives and negatives is zero." }
          ],
          hiddenTestCases: [
            { input: "[100,200,300]", output: "600" },
            { input: "[42]", output: "42" },
            { input: "[-1000,1000]", output: "0" },
            { input: "[1,2,3,4,5,6,7,8,9,10]", output: "55" },
            { input: "[999999,-999999]", output: "0" }
          ],
          skeletonCode: {
            python: "def solution(input_data):\n    # Your code here\n    pass",
            javascript: "function solution(input_data) {\n    // Your code here\n}",
            java: "class Solution {\n    public Object solution(Object input_data) {\n        // Your code here\n        return null;\n    }\n}",
            cpp: "class Solution {\npublic:\n    auto solution(auto input_data) {\n        // Your code here\n        return {};\n    }\n};"
          }
        };
        req.session.selectedDSAProblem = fallbackDSA;
        state.dsaGenerated = true;
        req.session.interviewState = state;
        req.session.includeDSAProblem = false;
        const interviewerMessage = "The AI failed to generate a new problem, so here is a fallback problem. Please solve it as you would in a real interview.";
        history.push({ role: 'interviewer', content: interviewerMessage });
        req.session.conversationHistory = history;
        return res.json({ dsaProblem: fallbackDSA, response: interviewerMessage, phase: state.phase });
      }
    }
    
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
      
      // Remove excessive whitespace and newlines
      cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
      cleaned = cleaned.trim();
      
      console.log('Cleaned response length:', cleaned.length);
      console.log('Cleaned response (first 200 chars):', cleaned.substring(0, 200));
      
      // If the response is empty after cleaning, provide a fallback
      if (!cleaned || cleaned.length < 10) {
        console.log('⚠️ Response was too short after cleaning, using fallback');
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

    // Create response object
    const responseData = { 
      response: cleanedResponse,
      phase: state.phase,
      progress: {
        step: state.step,
        coreQuestionsAsked: state.coreQuestionsAsked,
        dsaGenerated: state.dsaGenerated,
        usedTopics: state.usedTopics
      }
    };

    // Include DSA problem data if flag is set
    if (req.session.includeDSAProblem && req.session.selectedDSAProblem) {
      responseData.dsaProblem = req.session.selectedDSAProblem;
      console.log('📋 Sending DSA problem data:', req.session.selectedDSAProblem.title);
      req.session.includeDSAProblem = false; // Reset flag
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

// Code execution endpoint
app.post('/api/code/execute', executeCode);

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
  console.log('- POST /api/code/execute - Execute code');
  console.log('\n🤖 Make sure Ollama is running with qwen2.5-coder:7b model!');
  console.log('💡 Code Mock is ready to conduct technical interviews!');
});