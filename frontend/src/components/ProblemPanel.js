import React, { useState, useRef, useEffect } from 'react';

function ProblemPanel({ onSendMessage, isDarkMode, problemDescription, testCases }) {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Hello! I\'m your AI interviewer. Please describe the type of coding problem you\'d like to practice, and I\'ll provide you with a problem statement and test cases.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const newMessages = [...messages, { type: 'user', content: inputMessage }];
    setMessages(newMessages);
    
    // Call the parent handler
    onSendMessage(inputMessage);
    
    setInputMessage('');
  };

  return (
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
      {/* Problem Description - Independently Scrollable */}
      <div className="flex flex-col h-[60%] overflow-hidden">
        {problemDescription && (
          <div className={`flex-1 overflow-y-auto p-4 ${isDarkMode ? 'text-[#cccccc]' : 'text-gray-600'} custom-scrollbar-dark`}>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{problemDescription}</div>
            </div>
            
            {testCases.length > 0 && (
              <div className="mt-6">
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-[#cccccc]' : 'text-gray-900'}`}>
                  Example Test Cases:
                </h3>
                <div className="space-y-4">
                  {testCases.map((testCase, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        isDarkMode ? 'bg-[#282828]' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`font-mono text-sm ${isDarkMode ? 'text-[#cccccc]' : 'text-gray-600'}`}>
                        <div>Input: {testCase.input}</div>
                        <div>Expected Output: {testCase.expectedOutput}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Interface - Independently Scrollable */}
      <div className="flex flex-col h-[40%] border-t" style={{ borderColor: isDarkMode ? '#2d2d2d' : '#e5e7eb' }}>
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar-dark`}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.type === 'user'
                    ? isDarkMode
                      ? 'bg-[#404040] text-[#cccccc]'
                      : 'bg-[#ff8c00] text-white'
                    : isDarkMode
                    ? 'bg-[#282828] text-[#cccccc]'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t" style={{ borderColor: isDarkMode ? '#2d2d2d' : '#e5e7eb' }}>
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask for a coding problem or clarification..."
              className={`flex-1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff8c00] ${
                isDarkMode
                  ? 'bg-[#282828] text-[#cccccc] placeholder-[#666666] border border-[#404040]'
                  : 'bg-gray-100 text-gray-800 placeholder-gray-500'
              }`}
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg bg-[#ff8c00] text-white hover:bg-[#ff7000] focus:outline-none focus:ring-2 focus:ring-[#ff8c00] ${
                !inputMessage.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!inputMessage.trim()}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProblemPanel; 