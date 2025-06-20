import React, { useState, useEffect, useCallback, useRef } from 'react';
import Split from 'react-split';
import CodeEditor from './components/CodeEditor';
import ProblemPanel from './components/ProblemPanel';
import TestCasePanel from './components/TestCasePanel';
import TestResultPanel from './components/TestResultPanel';
import SubmissionPanel from './components/SubmissionPanel';
import Header from './components/Header';
import Footer from './components/Footer';
import ResizeWrapper from './components/ResizeWrapper';
import ChatBox from './components/ChatBox';
import './styles/split.css';
import './styles/scrollbar.css';
import axios from 'axios';
import MonacoEditor from '@monaco-editor/react';
import TabButton from './components/TabButton';
import InterviewProgressBar from './components/InterviewProgressBar';

// Debounce helper function with RAF
const rafDebounce = (fn) => {
  let frame;
  return (...args) => {
    if (frame) {
      cancelAnimationFrame(frame);
    }
    frame = requestAnimationFrame(() => {
      fn(...args);
    });
  };
};

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [testCases, setTestCases] = useState([]);
  const [hiddenTestCases, setHiddenTestCases] = useState([]);
  const [problemDescription, setProblemDescription] = useState('');
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [activeTab, setActiveTab] = useState('testcase'); // 'testcase' or 'result'
  const [showSubmission, setShowSubmission] = useState(false);
  const editorRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(50); // percentage
  const resizeRef = useRef(null);
  const [interviewPhase, setInterviewPhase] = useState('introduction');
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hello! I'm Code Mock, your AI interviewer. When you're ready to begin, please introduce yourself."
    }
  ]);

  // Refs for split instances
  const horizontalSplitRef = useRef(null);
  const verticalSplitRef = useRef(null);

  // Handle split updates
  const handleSplitDrag = useCallback(() => {
    // Trigger a resize event that will be caught by ResizeObserver
    window.dispatchEvent(new Event('resize'));
  }, []);

  // Suppress ResizeObserver errors
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('ResizeObserver loop') ||
        args[0]?.message?.includes('ResizeObserver loop')
      ) {
        return;
      }
      originalError.call(console, ...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const themeColors = {
    background: {
      primary: isDarkMode ? '#121212' : '#ffffff',
      secondary: isDarkMode ? '#1e1e1e' : '#f5f5f5',
    },
    text: {
      primary: isDarkMode ? '#ffffff' : '#000000',
      secondary: isDarkMode ? '#a0a0a0' : '#666666',
      accent: '#ff8c00',
    },
    border: {
      primary: isDarkMode ? '#333333' : '#e0e0e0',
      secondary: isDarkMode ? '#404040' : '#d0d0d0',
    },
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const handleSendMessage = async (message, payload = null) => {
    // Add user message to state
    if (!payload) {
      setMessages(prev => [...prev, { type: 'user', content: message }]);
    }
    setIsLoading(true);

    try {
      const postData = payload ? payload : { message };
      
      const response = await axios.post('http://localhost:3001/api/chat', postData, {
        withCredentials: true
      });

      setMessages(prev => [...prev, {
        type: 'bot',
        content: response.data.response
      }]);

      if (response.data.dsaProblem) {
        handleDSAProblemReceived(response.data.dsaProblem);
      }
      
      if(response.data.phase) {
        setInterviewPhase(response.data.phase);
      }

    } catch (error) {
      console.error('Error during chat:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please check the console or try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeCode = async (isSubmission = false) => {
    try {
      setIsLoading(true);
      setOutput(null);

      // Validate code
      if (!code || !code.trim()) {
        const errorOutput = { error: 'Please enter some code to execute' };
        if (isSubmission) {
          setSubmissionResult({ success: false, error: errorOutput.error });
          setShowSubmission(true);
        } else {
          setOutput(errorOutput);
        }
        return;
      }

      // Determine which test cases to use
      const testCasesToUse = isSubmission 
        ? [...testCases, ...hiddenTestCases]  // Include hidden test cases for submission
        : testCases;  // Only visible test cases for regular test runs

      console.log(`🚀 Executing code (${isSubmission ? 'submission' : 'test run'})`);
      console.log(`📊 Test cases to run: ${testCasesToUse.length} (${testCases.length} visible + ${hiddenTestCases.length} hidden)`);

      const response = await axios.post('http://localhost:3001/api/code/execute', {
        code: code.trim(),
        language,
        testCases: testCasesToUse,
        isSubmission
      });

      console.log('✅ Code execution response received:', response.data.success);

      if (response.data.success) {
        if (isSubmission) {
          // Set submission result first
          setSubmissionResult(response.data);
          setShowSubmission(true);
          
          // Then send to AI for analysis
          console.log("🤖 Sending submission to AI for analysis...");
          const analysisPayload = {
            type: 'dsa_solution',
            language: language,
            code: code.trim(),
            results: response.data.data
          };
          
          try {
            await handleSendMessage("Here is my solution.", analysisPayload);
            console.log("✅ AI analysis request sent successfully");
          } catch (aiError) {
            console.error("❌ Error sending to AI for analysis:", aiError);
            // Don't fail the submission if AI analysis fails
          }
        } else {
          // For regular test runs, only show results for visible test cases
          response.data.data.testResults = response.data.data.testResults.slice(0, testCases.length);
          setOutput(response.data.data);
          setActiveTab('result');
        }
      } else {
        const errorOutput = {
          success: false,
          error: response.data.error,
          details: response.data.details
        };
        console.log("❌ Code execution failed:", errorOutput);
        
        if (isSubmission) {
          setSubmissionResult(errorOutput);
          setShowSubmission(true);
        } else {
          setOutput(errorOutput);
        }
      }
    } catch (error) {
      console.error('❌ Error executing code:', error);
      const errorOutput = {
        success: false,
        error: 'Failed to execute code',
        details: error.response?.data?.message || error.message
      };
      
      if (isSubmission) {
        setSubmissionResult(errorOutput);
        setShowSubmission(true);
      } else {
        setOutput(errorOutput);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunTestCase = async () => {
    // Run single test case
    const testCase = testCases[activeTestCase];
    if (!testCase) return;

    // Format the test case input
    const formattedTestCase = {
      input: testCase.input,
      expectedOutput: testCase.expectedOutput
    };

    await executeCode([formattedTestCase]);
  };

  const handleRunAllTestCases = async () => {
    // Run all visible test cases
    await executeCode(testCases);
  };

  const handleSubmit = async () => {
    // Run all test cases including hidden ones
    await executeCode([...testCases, ...hiddenTestCases], true);
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleAddTestCase = (testCase) => {
    setTestCases([...testCases, testCase]);
  };

  const handleTestInput = async (input) => {
    try {
      // Parse the input string as JSON
      const parsedInput = JSON.parse(input);
      
      // Get the current code from the editor
      const code = editorRef.current?.getValue() || '';
      
      // Create a function from the code
      const fn = new Function('input', `
        ${code}
        return solution(input);
      `);
      
      // Execute the function with the input
      const result = fn(parsedInput);
      
      // Convert the result to a string
      return JSON.stringify(result);
    } catch (error) {
      console.error('Error testing input:', error);
      throw error;
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const container = resizeRef.current.parentElement;
    const containerHeight = container.clientHeight;
    const mouseY = e.clientY;
    const containerTop = container.getBoundingClientRect().top;
    
    let newHeight = ((mouseY - containerTop) / containerHeight) * 100;
    newHeight = Math.min(Math.max(newHeight, 20), 80); // Limit between 20% and 80%
    
    setDescriptionHeight(newHeight);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Fetch interview phase on mount and after reset
  useEffect(() => {
    // Auto-reset interview session on page load
    const resetAndInitialize = async () => {
      try {
        await axios.post('http://localhost:3001/api/reset', {}, { withCredentials: true });
        console.log('🔄 Interview session reset on page load');
        setInterviewPhase('introduction');
      } catch (error) {
        console.error('Error resetting interview session:', error);
        setInterviewPhase('introduction');
      }
    };
    
    resetAndInitialize();
  }, []);

  // Add a reset handler
  const handleResetInterview = async () => {
    try {
      await axios.post('http://localhost:3001/api/reset', {}, { withCredentials: true });
      // Reset all relevant state
      setMessages([
        {
          type: 'bot',
          content: 'Interview reset. Hello again! Please introduce yourself to begin.'
        }
      ]);
      setProblemDescription('');
      setTestCases([]);
      setHiddenTestCases([]);
      setCode('');
      setOutput(null);
      setSubmissionResult(null);
      setShowSubmission(false);
      setInterviewPhase('introduction');
      console.log('Frontend state has been reset.');

    } catch (error) {
      console.error('Error resetting interview:', error);
    }
  };

  // Add a handler for DSA problem data
  const handleDSAProblemReceived = (dsaProblem) => {
    console.log('📋 Received AI-generated DSA problem:', dsaProblem.title);
    
    // Combine story, problem, and requirements for the description panel
    const description = `### ${dsaProblem.title}\n\n**Story:**\n${dsaProblem.story}\n\n**Problem Statement:**\n${dsaProblem.problem}\n\n**Requirements:**\n${dsaProblem.requirements.map(req => `- ${req}`).join('\n')}`;
    setProblemDescription(description);
    
    // Format and set visible test cases
    const formattedVisibleTestCases = dsaProblem.testCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.output,
      explanation: tc.explanation,
    }));
    setTestCases(formattedVisibleTestCases);
    
    // Format and set hidden test cases
    const formattedHiddenTestCases = dsaProblem.hiddenTestCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.output,
    }));
    setHiddenTestCases(formattedHiddenTestCases);
    
    console.log('🗃️ Visible Test Cases:', formattedVisibleTestCases);
    console.log('🤫 Hidden Test Cases:', formattedHiddenTestCases);
    
    // Set editor content to the skeleton code for the current language
    if (dsaProblem.skeletonCode && dsaProblem.skeletonCode[language]) {
      setCode(dsaProblem.skeletonCode[language]);
      console.log(`✏️ Set skeleton code for ${language}.`);
    } else {
      // Fallback if skeleton code for the language is missing
      const fallbackTemplates = {
          python: `def solution(input_data):\n    # Your code here\n    pass`,
          javascript: `function solution(input_data) {\n    // Your code here\n}`,
          java: `class Solution {\n    public Object solution(Object input_data) {\n        // Your code here\n        return null;\n    }\n}`,
          cpp: `class Solution {\npublic:\n    auto solution(auto input_data) {\n        // Your code here\n        return {};\n    }\n};`
      };
      setCode(fallbackTemplates[language]);
      console.warn(`⚠️ Skeleton code for ${language} not found in AI response. Using fallback.`);
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: themeColors.background.primary }}>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      {/* Progress Bar and Reset Button */}
      <div className="flex items-center justify-between bg-white dark:bg-[#1e1e1e] border-b px-4 py-2" style={{ borderColor: themeColors.border.primary }}>
        <InterviewProgressBar phase={interviewPhase} />
        <button
          onClick={handleResetInterview}
          className="px-3 py-1 rounded bg-orange-500 text-white hover:bg-orange-600 text-sm"
        >
          Reset Interview
        </button>
      </div>

      <main className="flex-1 px-4 py-2 sm:px-6 lg:px-8">
        <ResizeWrapper>
          <Split 
            className={`flex h-full ${isDarkMode ? 'dark' : ''}`}
            sizes={[40, 60]}
            minSize={[300, 400]}
            expandToMin={false}
            gutterSize={8}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
            onDrag={handleSplitDrag}
            ref={horizontalSplitRef}
          >
            {/* Left side */}
            <div className="h-full overflow-hidden flex flex-col" style={{ backgroundColor: themeColors.background.secondary }}>
              <div className="flex border-b" style={{ borderColor: themeColors.border.primary }}>
                <button
                  onClick={() => setShowSubmission(false)}
                  className="px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2"
                  style={{
                    color: !showSubmission ? themeColors.text.primary : themeColors.text.secondary,
                    borderColor: !showSubmission ? themeColors.text.accent : 'transparent'
                  }}
                >
                  Description
                </button>
                {submissionResult && (
                  <button
                    onClick={() => setShowSubmission(true)}
                    className="px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2"
                    style={{
                      color: showSubmission ? themeColors.text.primary : themeColors.text.secondary,
                      borderColor: showSubmission ? themeColors.text.accent : 'transparent'
                    }}
                  >
                    Submission
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                {showSubmission ? (
                  <SubmissionPanel
                    result={submissionResult}
                    isDarkMode={isDarkMode}
                    onClose={() => setShowSubmission(false)}
                    themeColors={themeColors}
                  />
                ) : (
                  <Split
                    direction="vertical"
                    sizes={[60, 40]}
                    minSize={[200, 150]}
                    gutterSize={8}
                    className="split-wrapper h-full"
                    style={{ display: 'flex', flexDirection: 'column' }}
                    onDrag={handleSplitDrag}
                  >
                    {/* Problem Description */}
                    <div className="overflow-hidden">
                      <ProblemPanel
                        isDarkMode={isDarkMode}
                        problemDescription={problemDescription}
                        testCases={testCases}
                      />
                    </div>

                    {/* Chat Interface */}
                    <div className="flex-1 overflow-auto">
                      <ChatBox
                        isDarkMode={isDarkMode}
                        messages={messages}
                        isLoading={isLoading}
                        onSendMessage={handleSendMessage}
                      />
                    </div>
                  </Split>
                )}
              </div>
            </div>

            {/* Right side - Code Editor and Test Cases/Results */}
            <div className="h-full overflow-hidden">
              <Split
                className="flex flex-col h-full"
                sizes={[65, 35]}
                minSize={[200, 100]}
                expandToMin={false}
                gutterSize={8}
                gutterAlign="center"
                snapOffset={30}
                dragInterval={1}
                direction="vertical"
                cursor="row-resize"
                onDrag={handleSplitDrag}
                ref={verticalSplitRef}
              >
                {/* Code Editor Section */}
                <div className="w-full h-full overflow-hidden">
                  <div className="flex justify-between items-center mb-2 p-2" style={{ backgroundColor: themeColors.background.secondary }}>
                    <div className="flex items-center space-x-4">
                      <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="px-3 py-1 rounded-md"
                        style={{
                          backgroundColor: themeColors.background.primary,
                          color: themeColors.text.primary,
                          borderColor: themeColors.border.secondary,
                        }}
                      >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => executeCode(false)}
                        disabled={isLoading}
                        className="px-4 py-1 rounded-md transition-colors duration-150"
                        style={{
                          backgroundColor: themeColors.border.primary,
                          color: themeColors.text.primary,
                          opacity: isLoading ? 0.7 : 1,
                        }}
                      >
                        Run
                      </button>
                      <button
                        onClick={() => executeCode(true)}
                        disabled={isLoading}
                        className="px-4 py-1 rounded-md transition-colors duration-150"
                        style={{
                          backgroundColor: themeColors.text.accent,
                          color: themeColors.text.primary,
                          opacity: isLoading ? 0.7 : 1,
                        }}
                      >
                        Submit
                      </button>
                    </div>
                  </div>

                  <div className="h-[calc(100%-48px)] overflow-hidden">
                    <CodeEditor
                      code={code}
                      language={language}
                      onCodeChange={handleCodeChange}
                      onLanguageChange={handleLanguageChange}
                      isDarkMode={isDarkMode}
                      themeColors={themeColors}
                    />
                  </div>
                </div>

                {/* Test Cases and Results Section */}
                <div className="w-full h-full overflow-hidden">
                  <div className="flex h-full">
                    {/* Test Cases Panel */}
                    <div className="w-1/2 border-r" style={{ borderColor: themeColors.border.primary }}>
                      <TestCasePanel
                        testCases={testCases}
                        hiddenTestCases={hiddenTestCases}
                        activeTestCase={activeTestCase}
                        onTestCaseChange={setActiveTestCase}
                        isDarkMode={isDarkMode}
                        onAddTestCase={handleAddTestCase}
                        onTestInput={handleTestInput}
                        themeColors={themeColors}
                      />
                    </div>

                    {/* Test Results Panel */}
                    <div className="w-1/2">
                      <TestResultPanel
                        output={output}
                        isDarkMode={isDarkMode}
                        themeColors={themeColors}
                      />
                    </div>
                  </div>
                </div>
              </Split>
            </div>
          </Split>
        </ResizeWrapper>
      </main>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default App; 