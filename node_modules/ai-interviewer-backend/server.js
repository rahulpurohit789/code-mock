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

// Code execution endpoint
app.post('/api/code/execute', async (req, res) => {
  try {
    const { code, language, testCases, isSubmission } = req.body;
    
    // Validate input
    if (!code || !language) {
      return res.status(400).json({ 
        success: false,
        error: 'Code and language are required' 
      });
    }

    // Language versions for code execution
    const languageVersions = {
      python: "3.10",
      javascript: "18.15.0",
      java: "15.0.2",
      cpp: "10.2.0"
    };

    // Get language version
    const version = languageVersions[language.toLowerCase()] || "latest";
    
    // Process each test case
    const testResults = [];
    if (testCases && testCases.length > 0) {
      for (const testCase of testCases) {
        try {
          // Modify code for current test case
          let modifiedCode = code;
          
          // For Python, wrap the input
          if (language.toLowerCase() === 'python') {
            modifiedCode = `${code}\n\n# Test case execution\ninput_data = ${testCase.input}\nresult = solution(input_data)\nprint(result)`;
          }
          // For JavaScript, wrap the input
          else if (language.toLowerCase() === 'javascript') {
            modifiedCode = `${code}\n\n// Test case execution\nconst input_data = ${testCase.input};\nconst result = solution(input_data);\nconsole.log(JSON.stringify(result));`;
          }
          // For Java, wrap the input
          else if (language.toLowerCase() === 'java') {
            modifiedCode = `${code}\n\n// Test case execution\npublic class Main {\n    public static void main(String[] args) {\n        Object input_data = ${testCase.input};\n        Object result = solution(input_data);\n        System.out.println(result);\n    }\n}`;
          }
          // For C++, wrap the input
          else if (language.toLowerCase() === 'cpp') {
            modifiedCode = `${code}\n\n// Test case execution\nint main() {\n    auto input_data = ${testCase.input};\n    auto result = solution(input_data);\n    std::cout << result << std::endl;\n    return 0;\n}`;
          }

          // Call Piston API for code execution
          const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              language: language.toLowerCase(),
              version: version,
              files: [{
                name: `main.${language.toLowerCase() === 'python' ? 'py' : language.toLowerCase() === 'javascript' ? 'js' : language.toLowerCase() === 'java' ? 'java' : 'cpp'}`,
                content: modifiedCode
              }]
            }),
          });

          if (!response.ok) {
            throw new Error(`Piston API error: ${response.statusText}`);
          }

          const data = await response.json();
          
          // Extract output
          const actualOutput = data.run?.stdout?.trim() || '';
          const errorOutput = data.run?.stderr?.trim() || '';
          
          if (errorOutput) {
            testResults.push({
              input: testCase.input,
              expectedOutput: testCase.expectedOutput,
              actualOutput: errorOutput,
              passed: false,
              error: errorOutput
            });
            continue;
          }
          
          // Normalize outputs for comparison
          const normalizeOutput = (str) => {
            if (!str) return '';
            
            let normalized = str.toString()
              .replace(/[\s\n\r\t]+/g, '') // Remove all whitespace, newlines, tabs
              .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
              .trim();
            
            // Convert Python dictionary format to JSON format
            normalized = normalized
              .replace(/'/g, '"') // Convert single quotes to double quotes
              .replace(/True/g, 'true') // Convert Python boolean to JSON
              .replace(/False/g, 'false') // Convert Python boolean to JSON
              .replace(/None/g, 'null'); // Convert Python None to JSON null
            
            // Handle array/object formatting
            normalized = normalized
              .replace(/\[/g, '[')
              .replace(/\]/g, ']')
              .replace(/,/g, ', ')
              .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
              .replace(/,\s*}/g, '}'); // Remove trailing commas in objects
            
            return normalized;
          };
          
          const normalizedActual = normalizeOutput(actualOutput);
          const normalizedExpected = normalizeOutput(testCase.expectedOutput);
          
          console.log('🔍 Output comparison:');
          console.log('  Original actual:', actualOutput);
          console.log('  Original expected:', testCase.expectedOutput);
          console.log('  Normalized actual:', normalizedActual);
          console.log('  Normalized expected:', normalizedExpected);
          console.log('  Match:', normalizedActual === normalizedExpected);
          
          testResults.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: actualOutput,
            passed: normalizedActual === normalizedExpected,
            error: null
          });
        } catch (error) {
          console.error('Error executing test case:', error);
          testResults.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: 'Execution failed',
            passed: false,
            error: error.message
          });
        }
      }
    }

    // Format the final response
    const result = {
      success: true,
      data: {
        language: language,
        version: version,
        testResults: testResults
      }
    };

    // Add submission status for submission requests
    if (isSubmission && testResults.length > 0) {
      const allPassed = testResults.every(test => test.passed);
      result.data.submissionStatus = allPassed ? 'Accepted' : 'Wrong Answer';
      result.data.runtime = Math.floor(Math.random() * 100) + 1; // Mock runtime
      result.data.memory = Math.floor(Math.random() * 50) + 10; // Mock memory usage
    }

    res.json(result);

  } catch (error) {
    console.error('Code execution error:', error);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to execute code',
      details: error.message || 'Unknown error occurred'
    });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, type, code, results, language } = req.body;
    
    if (!message && type !== 'dsa_solution') {
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
    if (type !== 'dsa_solution') {
      history.push({ role: 'candidate', content: message });
    }

    let fullPrompt = '';
    const baseSystemPrompt = `You are "Code Mock", a technical interviewer conducting a real interview. You must follow the interview flow and respond as the interviewer, not generate scripts or examples. You are having a conversation with a real candidate right now.

IMPORTANT: You are the interviewer. Respond directly to the candidate. Do NOT create scripts, examples, or hypothetical conversations.`;

    // Log current phase for debugging
    console.log('Current phase:', state.phase);
    console.log('Intro questions asked:', state.introQuestionsAsked);
    console.log('Core questions asked:', state.coreQuestionsAsked);
    console.log('Used topics:', state.usedTopics);
    console.log('DSA generated:', state.dsaGenerated);
    console.log('User message:', message?.substring(0, 100) + '...');

    // INTERVIEW FLOW LOGIC
    if (type === 'dsa_solution') {
      const problem = req.session.selectedDSAProblem;
      if (!problem) {
        return res.status(400).json({ error: "Cannot find problem in session. Please restart the interview." });
      }

      const allTestsPassed = results.testResults.every(r => r.passed);
      
      // Increment solved count if all tests passed
      if (allTestsPassed) {
        state.dsaProblemsSolved = (state.dsaProblemsSolved || 0) + 1;
      }

      history.push({ 
        role: 'system', 
        content: `The candidate has submitted a solution. All tests passed: ${allTestsPassed}. Submission details: ${JSON.stringify(results)}`
      });

      fullPrompt = `${baseSystemPrompt}

You are currently in the DSA problem phase. The candidate has just submitted the following code for the problem titled "${problem.title}".

PROBLEM DESCRIPTION:
- Story: ${problem.story}
- Problem: ${problem.problem}
- Requirements: ${problem.requirements.join(', ')}

CANDIDATE'S SUBMITTED CODE (${language}):
\`\`\`${language}
${code}
\`\`\`

TEST RESULTS:
- Submission Status: ${results.submissionStatus}
- ${results.testResults.filter(r => !r.passed).length} out of ${results.testResults.length} test cases failed.

YOUR TASK:
Based on the code and the test results, analyze their solution and respond as an interviewer.

1.  **If the code failed any tests (${results.submissionStatus} is 'Wrong Answer'):**
    - DO NOT reveal the bug directly.
    - Provide a constructive hint. Point them to the general area of the mistake (e.g., "Have you considered edge cases like an empty input?" or "Take another look at how you're handling duplicates.").
    - Encourage them to rethink their approach and try again.

2.  **If all tests passed BUT the solution is a brute-force or non-optimal approach:**
    - Acknowledge that the solution is correct and passes the tests.
    - Ask them about the time and space complexity of their solution.
    - Gently challenge them to find a more optimal approach. Say something like, "This is a great start and it works correctly. Can you think of a way to optimize this? Perhaps we can solve it without nested loops?"

3.  **If all tests passed AND the solution is optimal (and this is the FIRST problem, dsaProblemsSolved: ${state.dsaProblemsSolved}):**
    - Congratulate them on an excellent solution.
    - Briefly explain why their solution is optimal (e.g., "Excellent work! Using a hash map here is a great way to achieve O(n) time complexity.").
    - Then, you MUST SEAMLESSLY transition to a new problem by generating a new JSON object.
    - Say: "That was very well done. Let's try one more. I'm generating the next problem for you now."
    - Then, on a new line, provide a NEW, MEDIUM-DIFFICULTY DSA problem in the required JSON format, inside a \`\`\`json ... \`\`\` block. It must be a different problem from the first one.

4.  **If all tests passed AND the solution is optimal (and this is the SECOND problem, dsaProblemsSolved: ${state.dsaProblemsSolved}):**
    - Congratulate them enthusiastically on solving the second problem.
    - Transition to the final wrap-up and feedback phase. DO NOT generate another problem.
    - Say something like: "Fantastic work on both problems! You've shown strong problem-solving skills. Let's wrap up the interview."
    - Then provide the final comprehensive feedback as described in the 'wrap_up' phase logic.
    - Set the interview phase to 'wrap_up'.

You are now responding to the candidate. Choose one of the above paths.
`;
      if (allTestsPassed && state.dsaProblemsSolved >= 2) {
          state.phase = 'wrap_up';
      }
      // If we are generating a new problem
      if (allTestsPassed && state.dsaProblemsSolved === 1) {
          req.session.includeDSAProblem = true;
      }

    } else if (state.phase === 'introduction' && state.introQuestionsAsked === 0) {
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
      // After second core question, move to DSA problem generation by AI
      state.phase = 'dsa_problem';
      state.dsaProblemsSolved = 0; // Initialize problem solved counter
      
      fullPrompt = `You are a senior software engineer creating a new coding problem for a technical interview.
Generate a complete, brand-new, easy-to-medium difficulty data structures and algorithms (DSA) problem.

CRITICAL: You MUST provide your response in a single JSON object, enclosed in a \`\`\`json ... \`\`\` markdown block. Do not write any text outside of the JSON block.

The JSON object must have the following exact structure:
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

Important Rules for generation:
- Ensure all "input" and "output" values in test cases are valid JSON-formatted strings. For example, if the input is an array of strings, it should be formatted like '["a", "b"]'.
- The problem should be solvable by a candidate with a solid understanding of fundamental DSA concepts like arrays, strings, hashmaps, sorting, or basic recursion.
- DO NOT include any text before or after the JSON block.
- The JSON must be valid and parseable.`;
      
      // We are now generating a problem, not presenting a pre-made one.
      // The flag will be used by the frontend to know to parse the DSA problem.
      req.session.includeDSAProblem = true;
      
    } else if (state.phase === 'dsa_problem' && !state.dsaGenerated) {
      // Mark DSA as generated and wait for solution
      state.dsaGenerated = true;
      
      fullPrompt = `${baseSystemPrompt}

The candidate has just been presented with the DSA problem. Now, you must act as the interviewer waiting for their approach. The candidate's first response is: "${message}"

Your ONLY job right now is to ask them to explain their approach. Do NOT provide any hints, solutions, or code.

Acknowledge their readiness and ask them something like:
"Great. Before you start writing code, could you please walk me through your thought process? How are you planning to tackle this problem?"

Wait for them to explain their approach. Do not say anything else.`;
      
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
      
      const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
      console.log('🔍 JSON extraction attempt:');
      console.log('JSON match found:', !!jsonMatch);
      
      // Try alternative patterns if the first one fails
      let jsonContent = null;
      if (jsonMatch && jsonMatch[1]) {
        jsonContent = jsonMatch[1];
      } else {
        // Try without the "json" language identifier
        const altMatch = rawResponse.match(/```\s*([\s\S]*?)\s*```/);
        if (altMatch && altMatch[1]) {
          console.log('🔍 Trying alternative JSON pattern (without "json" identifier)');
          jsonContent = altMatch[1];
        } else {
          // Try to find JSON-like content without markdown blocks
          const jsonLikeMatch = rawResponse.match(/\{\s*"title"\s*:/);
          if (jsonLikeMatch) {
            console.log('🔍 Found JSON-like content without markdown blocks');
            const startIndex = rawResponse.indexOf('{');
            const endIndex = rawResponse.lastIndexOf('}');
            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
              jsonContent = rawResponse.substring(startIndex, endIndex + 1);
            }
          }
        }
      }
      
      if (jsonContent) {
        console.log('🔍 Extracted JSON content:');
        console.log('JSON content length:', jsonContent.length);
        console.log('JSON content (first 500 chars):', jsonContent.substring(0, 500));
        console.log('JSON content (last 500 chars):', jsonContent.substring(Math.max(0, jsonContent.length - 500)));
        
        try {
          const dsaProblem = JSON.parse(jsonContent);
          console.log('✅ Successfully parsed DSA problem JSON:');
          console.log('Problem title:', dsaProblem.title);
          console.log('Test cases count:', dsaProblem.testCases?.length || 0);
          console.log('Hidden test cases count:', dsaProblem.hiddenTestCases?.length || 0);
          console.log('Skeleton code languages:', Object.keys(dsaProblem.skeletonCode || {}));
          
          req.session.selectedDSAProblem = dsaProblem;
          state.dsaGenerated = true;
          req.session.interviewState = state;
          req.session.includeDSAProblem = false; // Reset flag

          const interviewerMessage = "Excellent! You've shown a good grasp of the core concepts. Now, let's move on to a coding challenge. The problem details should be visible on your screen. Please take a moment to read it, and then walk me through your approach before you start coding.";

          history.push({ role: 'interviewer', content: interviewerMessage });
          req.session.conversationHistory = history;

          console.log('📋 Parsed and sending AI-generated DSA problem:', dsaProblem.title);
          
          return res.json({ 
            response: interviewerMessage,
            phase: state.phase,
            dsaProblem: dsaProblem,
            progress: {
              step: state.step,
              coreQuestionsAsked: state.coreQuestionsAsked,
              dsaGenerated: state.dsaGenerated,
              usedTopics: state.usedTopics
            }
          });
        } catch (e) {
          console.error("❌ Failed to parse DSA problem JSON from AI:", e);
          console.error("❌ JSON parsing error details:", e.message);
          console.error("❌ Attempted to parse:", jsonContent);
          return res.status(500).json({ error: 'The AI failed to generate a valid coding problem. Please try advancing the interview again.' });
        }
      } else {
        console.error("❌ AI did not return a valid JSON block for the DSA problem.");
        console.error("❌ Full raw response:", rawResponse);
        console.error("❌ JSON regex patterns tried: /```json\\s*([\\s\\S]*?)\\s*```/, /```\\s*([\\s\\S]*?)\\s*```/, and JSON-like content search");
        return res.status(500).json({ error: 'The AI failed to provide the coding problem in the correct format. Please try again.' });
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