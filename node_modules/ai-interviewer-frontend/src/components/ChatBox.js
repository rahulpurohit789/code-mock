import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function ChatBox({ onSendMessage, isDarkMode }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Handle scroll position
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    // Add user message
    const newMessages = [...messages, { type: 'user', content: inputMessage }];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call backend API
      const response = await axios.post('http://localhost:3001/api/chat', {
        message: inputMessage
      }, {
        withCredentials: true
      });

      // Add bot response
      setMessages(prev => [...prev, {
        type: 'bot',
        content: response.data.response
      }]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
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
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-[#1f1f1f]' : 'bg-white'}`}>
      {/* Chat Header */}
      <div 
        className="p-3 border-b flex items-center justify-between"
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
          borderColor: isDarkMode ? '#333' : '#e5e7eb'
        }}
      >
        <div className="flex items-center space-x-2">
          <span className={`text-lg font-semibold ${isDarkMode ? 'text-[#FF8C00]' : 'text-gray-800'}`}>
            AI Assistant
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-[#333] text-[#FF8C00]' : 'bg-orange-100 text-orange-800'}`}>
            Qwen
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {groupedMessages.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className={`flex ${group[0].type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] space-y-2`}>
              {group.map((message, messageIndex) => (
                <div
                  key={messageIndex}
                  className={`rounded-lg px-4 py-2 shadow-sm animate-fade-in ${
                    message.type === 'user'
                      ? isDarkMode
                        ? 'bg-[#FF8C00] text-white'
                        : 'bg-[#FF8C00] text-white'
                      : isDarkMode
                      ? 'bg-[#282828] text-[#cccccc]'
                      : 'bg-white text-gray-800 border border-gray-200'
                  } ${
                    messageIndex === 0 
                      ? message.type === 'user' 
                        ? 'rounded-br-sm' 
                        : 'rounded-bl-sm'
                      : messageIndex === group.length - 1
                      ? message.type === 'user'
                        ? 'rounded-tr-sm'
                        : 'rounded-tl-sm'
                      : message.type === 'user'
                      ? 'rounded-r-sm'
                      : 'rounded-l-sm'
                  }`}
                >
                  {messageIndex === 0 && message.type === 'bot' && (
                    <div className="flex items-center mb-1">
                      <span className="text-xs font-medium text-[#FF8C00]">AI Assistant</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className={`absolute bottom-20 right-4 p-2 rounded-full shadow-lg transition-all duration-200 ${
            isDarkMode 
              ? 'bg-[#333] text-[#FF8C00] hover:bg-[#444]' 
              : 'bg-white text-[#FF8C00] hover:bg-gray-100'
          }`}
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </button>
      )}

      {/* Input Area */}
      <form 
        onSubmit={handleSubmit} 
        className="p-3 border-t"
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
          borderColor: isDarkMode ? '#333' : '#e5e7eb'
        }}
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className={`flex-1 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition-all duration-200 ${
              isDarkMode
                ? 'bg-[#282828] text-[#cccccc] placeholder-[#666666] border border-[#404040]'
                : 'bg-gray-100 text-gray-800 placeholder-gray-500'
            }`}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg text-sm font-medium bg-[#FF8C00] text-white hover:bg-[#FF7000] focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition-all duration-200 ${
              !inputMessage.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!inputMessage.trim() || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center space-x-1">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatBox; 