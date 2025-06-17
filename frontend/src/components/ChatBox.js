import React, { useState, useRef, useEffect } from 'react';

function ChatBox({ onSendMessage, isDarkMode }) {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Hello! I\'m your AI coding assistant. How can I help you today?'
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
    setInputMessage('');

    // Call the parent handler
    onSendMessage(inputMessage);

    // Add a temporary bot response (this will be replaced with actual AI response later)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'I understand your question. This is a placeholder response. The AI integration will be implemented soon!'
      }]);
    }, 1000);
  };

  return (
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
      {/* Chat Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          AI Assistant
        </h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.type === 'user'
                  ? isDarkMode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-200'
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
      <form onSubmit={handleSubmit} className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className={`flex-1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDarkMode
                ? 'bg-gray-700 text-white placeholder-gray-400'
                : 'bg-gray-100 text-gray-800 placeholder-gray-500'
            }`}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              !inputMessage.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!inputMessage.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatBox; 