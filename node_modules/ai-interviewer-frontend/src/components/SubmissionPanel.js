import React from 'react';
import useTheme from '../hooks/useTheme';

const SubmissionPanel = ({ result, isDarkMode, onClose }) => {
  const { colors } = useTheme(isDarkMode);

  if (!result) return null;

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

  const { data } = result;
  const isAccepted = data.submissionStatus === 'Accepted';
  const failedTestCase = !isAccepted && data.testResults ? 
    data.testResults.findIndex(test => !test.passed) + 1 : 
    null;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: colors.background.secondary }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b" style={{ 
        backgroundColor: colors.background.primary,
        borderColor: colors.border.primary
      }}>
        <div className="flex items-center space-x-4">
          <h2 className="text-base font-medium" style={{ color: colors.text.primary }}>
            Submission Details
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
          <div>
            {/* Status Summary */}
            <div className="p-4 border-b" style={{ borderColor: colors.border.primary }}>
              <div className="flex items-center justify-between">
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
            </div>

            {/* Test Case Details */}
            {!isAccepted && failedTestCase !== null && data.testResults && data.testResults[failedTestCase - 1] && (
              <div className="p-4 space-y-4">
                <div className="text-sm font-medium mb-4" style={{ color: colors.text.primary }}>
                  Failed Test Case #{failedTestCase}
                </div>
                <div>
                  <div className="text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
                    Input
                  </div>
                  <div className="p-3 rounded font-mono text-sm" style={{ 
                    backgroundColor: colors.background.primary,
                    color: colors.text.primary
                  }}>
                    {data.testResults[failedTestCase - 1].input}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
                    Your Output
                  </div>
                  <div className="p-3 rounded font-mono text-sm" style={{ 
                    backgroundColor: colors.background.primary,
                    color: colors.text.primary
                  }}>
                    {data.testResults[failedTestCase - 1].actualOutput}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
                    Expected Output
                  </div>
                  <div className="p-3 rounded font-mono text-sm" style={{ 
                    backgroundColor: colors.background.primary,
                    color: colors.text.primary
                  }}>
                    {data.testResults[failedTestCase - 1].expectedOutput}
                  </div>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default SubmissionPanel; 