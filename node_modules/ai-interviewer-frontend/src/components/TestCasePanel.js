import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import AddTestCaseModal from './AddTestCaseModal';

const TestCasePanel = ({ testCases, activeTestCase, onTestCaseChange, isDarkMode, onAddTestCase, onTestInput }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { colors } = useTheme(isDarkMode);

  const handleTabClick = (index) => {
    setSelectedTab(index);
    onTestCaseChange(index);
  };

  const handleAddTestCase = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAddNewTestCase = (testCase) => {
    if (onAddTestCase) {
      onAddTestCase(testCase);
    }
  };

  const renderTestCaseInputs = (testCase) => {
    if (!testCase) return null;

    // Safely parse input parameters
    let inputParams;
    try {
      if (typeof testCase.input === 'string') {
        inputParams = JSON.parse(testCase.input);
      } else if (typeof testCase.input === 'object') {
        inputParams = testCase.input;
      } else {
        // If input is a primitive value, wrap it in an object
        inputParams = { value: testCase.input };
      }
    } catch (error) {
      // If parsing fails, treat the input as a single value
      inputParams = { value: testCase.input };
    }

    // Format the value for display
    const formatValue = (value) => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') {
        try {
          return JSON.stringify(value, null, 2);
        } catch (error) {
          return String(value);
        }
      }
      return String(value);
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: colors.text.primary }}>
            Input Parameters
          </label>
          {Object.entries(inputParams).map(([param, value]) => (
            <div key={param} className="space-y-1">
              <label className="block text-sm" style={{ color: colors.text.secondary }}>
                {param}:
              </label>
              <input
                type="text"
                value={formatValue(value)}
                readOnly
                className="w-full px-3 py-2 rounded-md"
                style={{
                  backgroundColor: colors.background.primary,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.secondary}`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: colors.text.primary }}>
            Expected Output
          </label>
          <input
            type="text"
            value={formatValue(testCase.expectedOutput)}
            readOnly
            className="w-full px-3 py-2 rounded-md"
            style={{
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
              border: `1px solid ${colors.border.secondary}`,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col h-full" style={{ backgroundColor: colors.background.secondary }}>
        {/* Test Case Tabs */}
        <div className="flex items-center p-2" style={{ 
          backgroundColor: colors.background.primary,
          borderBottom: `1px solid ${colors.border.primary}`
        }}>
          <div className="flex space-x-1 overflow-x-auto">
            {testCases.map((_, index) => (
              <button
                key={index}
                onClick={() => handleTabClick(index)}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-150 rounded-t-lg ${
                  selectedTab === index ? 'border-b-2' : ''
                }`}
                style={{
                  backgroundColor: selectedTab === index ? colors.background.tertiary : colors.background.secondary,
                  color: selectedTab === index ? colors.text.primary : colors.text.secondary,
                  borderColor: selectedTab === index ? colors.text.accent : 'transparent'
                }}
              >
                Case {index + 1}
              </button>
            ))}
            <button
              onClick={handleAddTestCase}
              className="px-4 py-2 text-sm font-medium transition-colors duration-150 rounded-t-lg flex items-center justify-center hover:bg-opacity-80"
              style={{
                backgroundColor: colors.background.secondary,
                color: colors.text.secondary,
                minWidth: '40px'
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                className="w-5 h-5"
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Test Case Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {renderTestCaseInputs(testCases[selectedTab])}
        </div>
      </div>

      {/* Add Test Case Modal */}
      <AddTestCaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={onAddTestCase}
        isDarkMode={isDarkMode}
        onTestInput={onTestInput}
      />
    </>
  );
};

export default TestCasePanel; 