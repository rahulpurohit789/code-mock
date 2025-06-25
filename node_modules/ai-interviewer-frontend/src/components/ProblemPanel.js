import React, { useRef, useEffect } from 'react';

// Helper function to parse markdown-like text and apply styles
const formatDescription = (text, isDarkMode) => {
  if (!text) return null;

  const lines = text.split('\n');

  return lines.map((line, index) => {
    // Handle empty lines to preserve paragraph breaks
    if (line.trim() === '') {
      return <div key={index} className="h-4" />;
    }

    // Handle ### Headings
    if (line.startsWith('### ')) {
      return null;
    }

    // Handle **Bold** text within a line
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={index} className="my-1">
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={i} className={`font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </p>
    );
  });
};

function ProblemPanel({ isDarkMode, problemDescription, testCases }) {
  const scrollContainerRef = useRef(null);

  // Add smooth scroll to section functionality
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white light-mode'}`}>
      {/* Quick Navigation */}
      <div 
        className="flex space-x-4 p-3 border-b"
        style={{
          backgroundColor: isDarkMode ? '#1f1f1f' : '#f8f9fa',
          borderColor: isDarkMode ? '#333' : '#e5e7eb'
        }}
      >
        <button
          onClick={() => scrollToSection('problem-description')}
          className={`text-sm px-3 py-1 rounded-md transition-colors duration-200 ${
            isDarkMode 
              ? 'hover:bg-[#333] text-[#cccccc]' 
              : 'hover:bg-gray-200 text-gray-700'
          }`}
        >
          Description
        </button>
        {testCases.length > 0 && (
          <button
            onClick={() => scrollToSection('test-cases')}
            className={`text-sm px-3 py-1 rounded-md transition-colors duration-200 ${
              isDarkMode 
                ? 'hover:bg-[#333] text-[#cccccc]' 
                : 'hover:bg-gray-200 text-gray-700'
            }`}
          >
            Test Cases
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div 
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto custom-scrollbar ${isDarkMode ? 'text-[#cccccc]' : 'text-gray-600'}`}
      >
        <div className="p-4 space-y-6">
          {problemDescription && (
            <>
              <div id="problem-description" className="space-y-4">
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  🎯 Coding Challenge Details
                </h2>
                <div className="prose max-w-none">
                  {formatDescription(problemDescription, isDarkMode)}
                </div>
              </div>
              
              {testCases.length > 0 && (
                <div id="test-cases" className="space-y-4">
                  <h2 className={`text-lg font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                    🧪 Sample Input & Expected Output
                  </h2>
                  <div className="space-y-4">
                    {testCases.map((testCase, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${
                          isDarkMode ? 'bg-[#282828]' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`font-mono text-sm ${isDarkMode ? 'text-[#cccccc]' : 'text-gray-600'}`}>
                          <div className="mb-2">
                            <span className={`font-medium ${isDarkMode ? 'text-orange-500' : 'text-orange-600'}`}>
                              Test Case {index + 1}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div>Input: {testCase.input}</div>
                            <div>Expected Output: {testCase.expectedOutput}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProblemPanel; 