import React, { useState } from 'react';
import AddTestCaseModal from './AddTestCaseModal';

const TestCasePanel = ({ 
  testCases, 
  hiddenTestCases = [],
  activeTestCase, 
  onTestCaseChange, 
  isDarkMode, 
  onAddTestCase,
  onTestInput,
  themeColors 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Only show visible test cases in the UI
  const visibleTestCases = testCases.map((tc, index) => ({ ...tc, index, type: 'visible' }));

  if (!visibleTestCases || visibleTestCases.length === 0) {
    return (
      <div 
        className="h-full flex flex-col items-center justify-center"
        style={{ backgroundColor: themeColors.background.secondary }}
      >
        <p className="text-sm mb-4" style={{ color: themeColors.text.secondary }}>
          No test cases available
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-md text-sm font-medium"
          style={{ 
            backgroundColor: themeColors.text.accent,
            color: '#ffffff'
          }}
        >
          Add Test Case
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: themeColors.background.secondary }}>
      {/* Header with test case counts */}
      <div className="p-3 border-b" style={{ borderColor: themeColors.border.primary }}>
        <div className="flex justify-between items-center text-sm" style={{ color: themeColors.text.secondary }}>
          <span>Test Cases: {visibleTestCases.length}</span>
          <span>Hidden: {hiddenTestCases.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {visibleTestCases.map((testCase, index) => (
          <button
            key={index}
            onClick={() => onTestCaseChange(testCase.index)}
            className="w-full text-left p-4 border-b"
            style={{
              backgroundColor: activeTestCase === testCase.index ? themeColors.background.primary : 'transparent',
              borderColor: themeColors.border.primary,
              color: themeColors.text.primary
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  👁️ Test Case {testCase.index + 1}
                </span>
              </div>
            </div>
            <div 
              className="mt-2 font-mono text-sm space-y-1"
              style={{ color: themeColors.text.secondary }}
            >
              <div>Input: {testCase.input}</div>
              <div>Expected: {testCase.expectedOutput}</div>
              {testCase.explanation && (
                <div className="mt-2 p-2 rounded text-xs" style={{ 
                  backgroundColor: themeColors.background.primary,
                  color: themeColors.text.primary
                }}>
                  💡 {testCase.explanation}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div 
        className="p-4 border-t"
        style={{ borderColor: themeColors.border.primary }}
      >
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full px-4 py-2 rounded-md text-sm font-medium"
          style={{ 
            backgroundColor: themeColors.text.accent,
            color: '#ffffff'
          }}
        >
          Add Test Case
        </button>
      </div>

      <AddTestCaseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAddTestCase}
        isDarkMode={isDarkMode}
        onTestInput={onTestInput}
        themeColors={themeColors}
      />
    </div>
  );
};

export default TestCasePanel; 