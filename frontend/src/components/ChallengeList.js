import React from 'react';

function ChallengeList({ challenges, selectedChallenge, onSelectChallenge, isDarkMode }) {
  return (
    <div className="h-full flex flex-col">
      {/* Challenge List */}
      <div className="flex-none p-4 border-b border-gray-200">
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Coding Challenges
        </h2>
      </div>

      {/* Challenge Selection */}
      <div className="flex-none overflow-y-auto border-b border-gray-200">
        <div className="divide-y divide-gray-200">
          {challenges.map((challenge) => (
            <button
              key={challenge.id}
              onClick={() => onSelectChallenge(challenge)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              } ${
                selectedChallenge?.id === challenge.id
                  ? isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-100'
                  : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {challenge.title}
                </span>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    challenge.difficulty === 'Easy'
                      ? 'bg-green-100 text-green-800'
                      : challenge.difficulty === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {challenge.difficulty}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Challenge Description */}
      {selectedChallenge && (
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {selectedChallenge.title}
          </h3>
          <div className={`prose ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <pre className="whitespace-pre-wrap font-sans">
              {selectedChallenge.description}
            </pre>
          </div>
          <div className="mt-6">
            <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Test Cases:
            </h4>
            <div className="space-y-2">
              {selectedChallenge.testCases.map((testCase, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className={`font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div>Input: {testCase.input}</div>
                    <div>Expected Output: {testCase.expectedOutput}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChallengeList; 