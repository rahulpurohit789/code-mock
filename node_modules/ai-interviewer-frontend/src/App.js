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
import './styles/split.css';
import './styles/scrollbar.css';
import { useTheme } from './hooks/useTheme';
import axios from 'axios';
import MonacoEditor from '@monaco-editor/react';
import TabButton from './components/TabButton';

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
  const [functionTemplate, setFunctionTemplate] = useState('');
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [activeTab, setActiveTab] = useState('testcase'); // 'testcase' or 'result'
  const [showSubmission, setShowSubmission] = useState(false);
  const editorRef = useRef(null);

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

  const { colors } = useTheme(isDarkMode);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // Update function template based on language
    if (functionTemplate) {
      // This will be handled by the AI to provide language-specific templates
      console.log('Language changed, updating template...');
    }
  };

  const handleChatMessage = async (message) => {
    // Mock problem setup
    setProblemDescription(`Given an array of integers nums and an integer target, return indices of the two numbers in nums such that they add up to target.
You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`);

    setTestCases([
      { 
        input_params: {
          n: '3',
          m: '2',
          k: '1'
        },
        input: '[2,7,11,15], 9',
        expectedOutput: '[0,1]'
      },
      {
        input_params: {
          n: '4',
          m: '3',
          k: '2'
        },
        input: '[3,2,4], 6',
        expectedOutput: '[1,2]'
      },
      {
        input_params: {
          n: '5',
          m: '4',
          k: '3'
        },
        input: '[3,3], 6',
        expectedOutput: '[0,1]'
      }
    ]);

    // Set language-specific function templates
    const templates = {
      python: `def solution(nums, target):
    # Write your code here
    pass`,
      javascript: `function solution(nums, target) {
    // Write your code here
}`,
      java: `class Solution {
    public int[] solution(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}`,
      cpp: `class Solution {
public:
    vector<int> solution(vector<int>& nums, int target) {
        // Write your code here
        return {};
    }
};`
    };

    setFunctionTemplate(templates[language]);
  };

  const executeCode = async (isSubmission = false) => {
    try {
      setIsLoading(true);
      setOutput(null);

      // Validate code
      if (!code || !code.trim()) {
        setOutput({ error: 'Please enter some code to execute' });
        return;
      }

      // Determine which test cases to use
      const testCasesToUse = isSubmission 
        ? [...testCases, ...hiddenTestCases]  // Include hidden test cases for submission
        : testCases;  // Only visible test cases for regular test runs

      const response = await axios.post('http://localhost:5000/api/code/execute', {
        code: code.trim(),
        language,
        testCases: testCasesToUse,
        isSubmission
      });

      if (response.data.success) {
        if (isSubmission) {
          setSubmissionResult(response.data.data);
          setShowSubmission(true);
        } else {
          // For regular test runs, only show results for visible test cases
          response.data.data.testResults = response.data.data.testResults.slice(0, testCases.length);
          setOutput(response.data.data);
          setActiveTab('result');
        }
      } else {
        const errorOutput = {
          error: response.data.error,
          details: response.data.details
        };
        if (isSubmission) {
          setSubmissionResult(errorOutput);
          setShowSubmission(true);
        } else {
          setOutput(errorOutput);
        }
      }
    } catch (error) {
      console.error('Error executing code:', error);
      const errorOutput = {
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
    setIsDarkMode(!isDarkMode);
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

  return (
    <div className={`h-screen flex flex-col`} style={{ backgroundColor: colors.background.primary }}>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

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
            {/* Left side - Problem Description & Submission Results */}
            <div className="h-full overflow-hidden flex flex-col" style={{ backgroundColor: colors.background.secondary }}>
              {/* Tabs */}
              <div className="flex border-b" style={{ borderColor: colors.border.primary }}>
                <button
                  onClick={() => setShowSubmission(false)}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2`}
                  style={{
                    color: !showSubmission ? colors.text.primary : colors.text.secondary,
                    borderColor: !showSubmission ? colors.text.accent : 'transparent'
                  }}
                >
                  Description
                </button>
                {submissionResult && (
                  <button
                    onClick={() => setShowSubmission(true)}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2`}
                    style={{
                      color: showSubmission ? colors.text.primary : colors.text.secondary,
                      borderColor: showSubmission ? colors.text.accent : 'transparent'
                    }}
                  >
                    Submission
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {showSubmission ? (
                  <SubmissionPanel
                    result={submissionResult}
                    isDarkMode={isDarkMode}
                    onClose={() => setShowSubmission(false)}
                  />
                ) : (
                  <ProblemPanel
                    onSendMessage={handleChatMessage}
                    isDarkMode={isDarkMode}
                    problemDescription={problemDescription}
                    testCases={testCases}
                  />
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
                  <div className="flex justify-between items-center mb-2 p-2" style={{ backgroundColor: colors.background.secondary }}>
                    <div className="flex items-center space-x-4">
                      <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="px-3 py-1 rounded-md"
                        style={{
                          backgroundColor: colors.background.primary,
                          color: colors.text.primary,
                          borderColor: colors.border.secondary,
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
                          backgroundColor: colors.button.secondary.background,
                          color: colors.button.secondary.text,
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
                          backgroundColor: colors.button.primary.background,
                          color: colors.button.primary.text,
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
                      isDarkMode={isDarkMode}
                      functionTemplate={functionTemplate}
                    />
                  </div>
                </div>

                {/* Test Cases and Results Section */}
                <div className="w-full h-full overflow-hidden">
                  {/* Tabs */}
                  <div className="flex px-2" style={{ backgroundColor: colors.background.primary, borderBottom: `1px solid ${colors.border.primary}` }}>
                    <button
                      onClick={() => setActiveTab('testcase')}
                      className={`px-4 py-2 text-sm font-medium transition-colors duration-150`}
                      style={{
                        color: activeTab === 'testcase' ? colors.text.primary : colors.text.secondary,
                        borderBottom: activeTab === 'testcase' ? `2px solid ${colors.text.accent}` : 'none',
                      }}
                    >
                      Testcase
                    </button>
                    <button
                      onClick={() => setActiveTab('result')}
                      className={`px-4 py-2 text-sm font-medium transition-colors duration-150`}
                      style={{
                        color: activeTab === 'result' ? colors.text.primary : colors.text.secondary,
                        borderBottom: activeTab === 'result' ? `2px solid ${colors.text.accent}` : 'none',
                      }}
                    >
                      Result
                    </button>
                  </div>

                  {/* Panel Content */}
                  <div className="h-[calc(100%-40px)] overflow-hidden">
                    {activeTab === 'testcase' ? (
                      <TestCasePanel
                        testCases={testCases}
                        activeTestCase={activeTestCase}
                        onTestCaseChange={setActiveTestCase}
                        isDarkMode={isDarkMode}
                        onAddTestCase={handleAddTestCase}
                        onTestInput={handleTestInput}
                      />
                    ) : (
                      <TestResultPanel
                        output={output}
                        isDarkMode={isDarkMode}
                      />
                    )}
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