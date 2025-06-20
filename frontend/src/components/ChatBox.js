import React, { useState, useEffect, useRef } from 'react';

function ChatBox({ messages, isLoading, onSendMessage, isDarkMode }) {
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
    if (!inputMessage.trim() || isLoading) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  // Group messages by sender
  const groupedMessages = messages.reduce((acc, message, index) => {
    if (index === 0 || messages[index - 1].type !== message.type) {
      acc.push([message]);
    } else {
      acc[acc.length - 1].push(message);
    }
    return acc;
  }, []);

  return (
    <div className={`h-full flex flex-col p-4 ${isDarkMode ? 'bg-[#1e1e1e] text-white' : 'bg-white text-black'}`}>
      <div className="flex-1 overflow-y-auto pr-2">
        {groupedMessages.map((group, index) => (
          <div key={index} className={`flex mb-4 ${group[0].type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl lg:max-w-2xl`}>
              {group.map((message, msgIndex) => (
                <div
                  key={msgIndex}
                  className={`px-4 py-2 rounded-lg mb-1 ${
                    group[0].type === 'user'
                      ? 'bg-orange-500 text-white'
                      : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  } ${
                    group.length > 1 ? 
                      (msgIndex === 0 ? 'rounded-b-none' : msgIndex === group.length - 1 ? 'rounded-t-none' : 'rounded-none') 
                      : ''
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className="flex items-center">
                <div className="dot-pulse"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className={`flex-1 p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'} focus:outline-none`}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`ml-2 p-2 rounded-full ${isLoading ? 'bg-gray-600' : 'bg-orange-500 hover:bg-orange-600'} text-white transition-colors`}
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
            />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ChatBox; 