import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const TestResultPanel = ({ output, isDarkMode }) => {
  const { colors } = useTheme(isDarkMode);
  const [selectedCase, setSelectedCase] = useState(0);

  // Helper function to get status colors
  const getStatusColors = (status) => {
    if (!status) {
      return {
        bg: colors.background.primary,
        text: colors.text.primary
      };
    }

    switch (status) {
      case 'Accepted':
        return {
          bg: colors.status.success.background,
          text: colors.status.success.text
        };
      case 'Wrong Answer':
        return {
          bg: colors.status.error.background,
          text: colors.status.error.text
        };
      default:
        return {
          bg: colors.status.warning.background,
          text: colors.status.warning.text
        };
    }
  };

  if (!output) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: colors.background.secondary }}>
        <p style={{ color: colors.text.secondary }}>Run your code to see the results</p>
      </div>
    );
  }

  // Get status colors only if we have a submission status
  const statusColors = output?.submissionStatus ? getStatusColors(output.submissionStatus) : null;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: colors.background.secondary }}>
      {/* Fixed Header */}
      <div style={{ 
        backgroundColor: colors.background.primary,
        borderBottom: `1px solid ${colors.border.primary}`
      }}>
        {/* Results Header */}
        <div className="flex items-center p-2">
          <h2 className="text-sm font-medium" style={{ color: colors.text.primary }}>
            {output?.isSubmission ? 'Submission Results' : 'Test Results'}
          </h2>
        </div>

        {/* Submission Status */}
        {output.submissionStatus && statusColors && (
          <div className="px-4 py-3" style={{
            backgroundColor: statusColors.bg,
            color: statusColors.text
          }}>
            <div className="text-xl font-medium">
              {output.submissionStatus}
            </div>
            <div className="flex space-x-8 mt-2 text-sm">
              {output.runtime && (
                <div>
                  Runtime: {output.runtime} ms
                </div>
              )}
              {output.memory && (
                <div>
                  Memory: {output.memory} MB
                </div>
              )}
            </div>
          </div>
        )}

        {/* Test Case Tabs - Fixed */}
        {output.testResults && output.testResults.length > 0 && (
          <div className="flex border-b border-gray-700 px-2">
            {output.testResults.map((testResult, index) => (
              <button
                key={index}
                onClick={() => setSelectedCase(index)}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-150 relative ${
                  selectedCase === index ? 'border-b-2' : ''
                }`}
                style={{
                  color: selectedCase === index ? colors.text.primary : colors.text.secondary,
                  borderColor: selectedCase === index ? colors.text.accent : 'transparent'
                }}
              >
                <div className="flex items-center space-x-2">
                  <span>Case {index + 1}</span>
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: testResult.passed ? '#4ade80' : '#ef4444',
                      boxShadow: testResult.passed ? '0 0 6px rgba(74, 222, 128, 0.5)' : '0 0 6px rgba(239, 68, 68, 0.5)'
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {output.error ? (
          <div className="p-4">
            <div className="p-3 rounded" style={{ 
              backgroundColor: colors.status.error.background,
              color: colors.status.error.text 
            }}>
              <div className="font-semibold">Error:</div>
              <div className="whitespace-pre-wrap">{output.error}</div>
              {output.details && (
                <div className="mt-2 text-sm opacity-75 whitespace-pre-wrap">
                  {output.details}
                </div>
              )}
            </div>
          </div>
        ) : (
          output.testResults && 
          output.testResults.length > 0 && 
          output.testResults[selectedCase] && (
            <div className="p-4 space-y-4">
              <div>
                <div className="text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
                  Input
                </div>
                <div className="p-3 rounded font-mono text-sm" style={{ 
                  backgroundColor: colors.background.primary,
                  color: colors.text.primary
                }}>
                  {output.testResults[selectedCase].input}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
                  Output
                </div>
                <div className="p-3 rounded font-mono text-sm" style={{ 
                  backgroundColor: colors.background.primary,
                  color: colors.text.primary
                }}>
                  {output.testResults[selectedCase].actualOutput}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
                  Expected
                </div>
                <div className="p-3 rounded font-mono text-sm" style={{ 
                  backgroundColor: colors.background.primary,
                  color: colors.text.primary
                }}>
                  {output.testResults[selectedCase].expectedOutput}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TestResultPanel; 