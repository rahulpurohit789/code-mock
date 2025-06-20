import React, { useState } from 'react';

const TestResultPanel = ({ output, isDarkMode, themeColors }) => {
  const [selectedCase, setSelectedCase] = useState(0);

  if (!output) {
    return (
      <div 
        className="h-full flex items-center justify-center"
        style={{ backgroundColor: themeColors.background.secondary, color: themeColors.text.secondary }}
      >
        No test results yet
      </div>
    );
  }

  if (output.error) {
    return (
      <div 
        className="p-4 overflow-auto h-full"
        style={{ backgroundColor: themeColors.background.secondary }}
      >
        <div className="text-red-500 whitespace-pre-wrap font-mono text-sm">
          {output.error}
          {output.details && (
            <div className="mt-2 text-xs opacity-80">
              {output.details}
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentTestResult = output.testResults?.[selectedCase];

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: themeColors.background.secondary }}>
      {/* Test Case Navigation */}
      <div className="flex border-b" style={{ borderColor: themeColors.border.primary }}>
        {output.testResults && output.testResults.map((testResult, index) => (
          <button
            key={index}
            onClick={() => setSelectedCase(index)}
            className="px-4 py-2 text-sm font-medium transition-colors duration-150 relative"
            style={{
              color: selectedCase === index ? themeColors.text.primary : themeColors.text.secondary,
              borderBottom: selectedCase === index ? `2px solid ${themeColors.text.accent}` : 'none'
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

      {/* Test Result Details */}
      {currentTestResult && (
        <div className="flex-1 p-4 overflow-auto">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Input:</h3>
              <pre 
                className="p-3 rounded-lg font-mono text-sm whitespace-pre-wrap"
                style={{ 
                  backgroundColor: themeColors.background.primary,
                  color: themeColors.text.secondary,
                  border: `1px solid ${themeColors.border.primary}`
                }}
              >
                {currentTestResult.input}
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Your Output:</h3>
              <pre 
                className="p-3 rounded-lg font-mono text-sm whitespace-pre-wrap"
                style={{ 
                  backgroundColor: themeColors.background.primary,
                  color: currentTestResult.passed ? '#4ade80' : '#ef4444',
                  border: `1px solid ${themeColors.border.primary}`
                }}
              >
                {currentTestResult.actualOutput}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>Expected Output:</h3>
              <pre 
                className="p-3 rounded-lg font-mono text-sm whitespace-pre-wrap"
                style={{ 
                  backgroundColor: themeColors.background.primary,
                  color: themeColors.text.secondary,
                  border: `1px solid ${themeColors.border.primary}`
                }}
              >
                {currentTestResult.expectedOutput}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultPanel; 