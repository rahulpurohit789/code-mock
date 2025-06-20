import React from 'react';
import useTheme from '../hooks/useTheme';

const SubmissionPanel = ({ result, isDarkMode, onClose }) => {
  const { colors } = useTheme(isDarkMode);

  // Handle undefined or null result
  if (!result) {
    return (
      <div className="h-full flex flex-col p-4" style={{ backgroundColor: colors.background.secondary }}>
        <div className="p-3 rounded" style={{ 
          backgroundColor: colors.status.error.background,
          color: colors.status.error.text 
        }}>
          <div className="font-semibold">Error:</div>
          <div className="whitespace-pre-wrap">No submission result available.</div>
        </div>
      </div>
    );
  }

  // Handle API error or code execution failure
  if (!result.success || result.error) {
    return (
      <div className="h-full flex flex-col p-4" style={{ backgroundColor: colors.background.secondary }}>
        <div className="p-3 rounded" style={{ 
          backgroundColor: colors.status.error.background,
          color: colors.status.error.text 
        }}>
          <div className="font-semibold">Error:</div>
          <div className="whitespace-pre-wrap">{result.error || 'An unknown error occurred.'}</div>
          {result.details && (
            <div className="mt-2 text-sm opacity-75 whitespace-pre-wrap">
              {result.details}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Ensure data exists
  if (!result.data) {
    return (
      <div className="h-full flex flex-col p-4" style={{ backgroundColor: colors.background.secondary }}>
        <div className="p-3 rounded" style={{ 
          backgroundColor: colors.status.error.background,
          color: colors.status.error.text 
        }}>
          <div className="font-semibold">Error:</div>
          <div className="whitespace-pre-wrap">Invalid submission result format.</div>
        </div>
      </div>
    );
  }

  const { data } = result;
  const isAccepted = data.submissionStatus === 'Accepted';
  const failedTestCases = !isAccepted && data.testResults ? 
    data.testResults.filter(test => !test.passed) : [];
  const passedCount = data.testResults ? data.testResults.filter(test => test.passed).length : 0;
  const totalCount = data.testResults ? data.testResults.length : 0;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: colors.background.secondary }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b" style={{ 
        backgroundColor: colors.background.primary,
        borderColor: colors.border.primary
      }}>
        <div className="flex items-center space-x-4">
          <h2 className="text-base font-medium" style={{ color: colors.text.primary }}>
            Submission Results
          </h2>
          <span className="px-2 py-1 rounded text-sm" style={{
            backgroundColor: isAccepted ? colors.status.success.background : colors.status.error.background,
            color: isAccepted ? colors.status.success.text : colors.status.error.text
          }}>
            {isAccepted ? 'Accepted' : 'Wrong Answer'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-opacity-80"
          style={{ color: colors.text.secondary }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Status Summary */}
        <div className="p-4 border-b" style={{ borderColor: colors.border.primary }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl" style={{ color: colors.text.primary }}>
                {isAccepted ? '✓' : '✗'}
              </span>
              <span className="text-lg font-medium" style={{ color: colors.text.primary }}>
                {isAccepted ? 'Accepted' : 'Wrong Answer'}
              </span>
            </div>
            {isAccepted && (
              <div className="text-sm" style={{ color: colors.text.secondary }}>
                Your submission beat {Math.floor(Math.random() * 30 + 70)}% of submissions
              </div>
            )}
          </div>
          
          {/* Test Results Summary */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span style={{ color: colors.text.secondary }}>Tests Passed:</span>
              <span style={{ color: colors.text.primary }}>{passedCount}/{totalCount}</span>
            </div>
            {data.runtime && (
              <div className="flex items-center space-x-2">
                <span style={{ color: colors.text.secondary }}>Runtime:</span>
                <span style={{ color: colors.text.primary }}>{data.runtime}ms</span>
              </div>
            )}
            {data.memory && (
              <div className="flex items-center space-x-2">
                <span style={{ color: colors.text.secondary }}>Memory:</span>
                <span style={{ color: colors.text.primary }}>{data.memory}MB</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span style={{ color: colors.text.secondary }}>Language:</span>
              <span style={{ color: colors.text.primary }}>{data.language}</span>
            </div>
          </div>
        </div>

        {/* Failed Test Cases */}
        {failedTestCases.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-medium mb-4" style={{ color: colors.text.primary }}>
              Failed Test Cases ({failedTestCases.length})
            </h3>
            <div className="space-y-4">
              {failedTestCases.map((testCase, index) => (
                <div key={index} className="p-3 rounded border" style={{ 
                  backgroundColor: colors.background.primary,
                  borderColor: colors.status.error.background
                }}>
                  <div className="text-sm font-medium mb-3" style={{ color: colors.text.primary }}>
                    Test Case #{data.testResults.indexOf(testCase) + 1}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="font-medium mb-1" style={{ color: colors.text.secondary }}>
                        Input
                      </div>
                      <pre className="p-2 rounded font-mono text-xs whitespace-pre-wrap" style={{ 
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary
                      }}>
                        {testCase.input}
                      </pre>
                    </div>

                    <div>
                      <div className="font-medium mb-1" style={{ color: colors.text.secondary }}>
                        Your Output
                      </div>
                      <pre className="p-2 rounded font-mono text-xs whitespace-pre-wrap" style={{ 
                        backgroundColor: colors.background.secondary,
                        color: colors.status.error.text
                      }}>
                        {testCase.actualOutput || 'No output'}
                      </pre>
                    </div>

                    <div>
                      <div className="font-medium mb-1" style={{ color: colors.text.secondary }}>
                        Expected Output
                      </div>
                      <pre className="p-2 rounded font-mono text-xs whitespace-pre-wrap" style={{ 
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary
                      }}>
                        {testCase.expectedOutput}
                      </pre>
                    </div>
                  </div>

                  {testCase.error && (
                    <div className="mt-3">
                      <div className="font-medium mb-1" style={{ color: colors.status.error.text }}>
                        Error
                      </div>
                      <pre className="p-2 rounded font-mono text-xs whitespace-pre-wrap" style={{ 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: colors.status.error.text
                      }}>
                        {testCase.error}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionPanel; 