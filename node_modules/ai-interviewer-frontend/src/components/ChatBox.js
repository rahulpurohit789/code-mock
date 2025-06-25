import React, { useState, useEffect, useRef } from 'react';

// Utility function to format message content with markdown-like syntax
const formatMessageContent = (content, messageType) => {
  if (!content) return content;

  // Split content into lines for processing
  const lines = content.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Handle bullet points (lines starting with * or -)
    if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
      const bulletContent = line.trim().substring(1).trim();
      return (
        <div key={lineIndex} className="flex items-start mb-1 bullet-point">
          <span className="text-gray-600 mr-2 mt-1 text-lg">•</span>
          <span className="flex-1">{formatInlineText(bulletContent, messageType)}</span>
        </div>
      );
    }
    
    // Handle numbered lists (lines starting with numbers followed by dot or emoji)
    if (/^\d+[\.\s]/.test(line.trim()) || /^[1-9]️⃣/.test(line.trim())) {
      const match = line.trim().match(/^(\d+[\.\s]|[1-9]️⃣)\s*(.*)/);
      if (match) {
        const number = match[1];
        const listContent = match[2];
        return (
          <div key={lineIndex} className="flex items-start mb-1 bullet-point">
            <span className="text-gray-600 mr-2 mt-1 font-semibold text-lg">{number}</span>
            <span className="flex-1">{formatInlineText(listContent, messageType)}</span>
          </div>
        );
      }
    }
    
    // Handle emoji numbered lists (lines starting with emoji numbers)
    if (/^[1-9]️⃣/.test(line.trim())) {
      const emojiMatch = line.trim().match(/^([1-9]️⃣)\s*(.*)/);
      if (emojiMatch) {
        const emoji = emojiMatch[1];
        const listContent = emojiMatch[2];
        return (
          <div key={lineIndex} className="flex items-start mb-1 bullet-point">
            <span className="mr-2 mt-1 text-lg">{emoji}</span>
            <span className="flex-1">{formatInlineText(listContent, messageType)}</span>
          </div>
        );
      }
    }
    
    // Handle separators (lines with dashes)
    if (line.trim().startsWith('---')) {
      return <hr key={lineIndex} className="my-3 border-gray-400 opacity-50" />;
    }
    
    // Handle code blocks (lines with multiple backticks)
    if (line.trim().startsWith('```')) {
      return (
        <div key={lineIndex} className="code-block my-2">
          <pre className="m-0">{line.trim().substring(3)}</pre>
        </div>
      );
    }
    
    // Regular lines
    return (
      <div key={lineIndex} className="mb-1">
        {formatInlineText(line, messageType)}
      </div>
    );
  });
};

// Utility function to format inline text (bold, italic, etc.)
const formatInlineText = (text, messageType) => {
  if (!text) return text;
  
  // Split by ** for bold text
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    // Bold text
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldClass = messageType === 'user'
        ? 'font-bold text-white' // Use white for user messages for better contrast
        : 'font-bold text-orange-400';
      return (
        <strong key={index} className={boldClass}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    
    // Italic text (single asterisks)
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    
    // Code blocks (backticks)
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    
    return part;
  });
};

function ChatBox({ messages, isLoading, onSendMessage, isDarkMode, interviewComplete }) {
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const micStreamRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  const stopVisualizer = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    setAudioLevel(0);
  };

  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      analyserRef.current = audioContext.createAnalyser();
      sourceRef.current = audioContext.createMediaStreamSource(stream);

      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const visualize = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        
        const normalized = Math.min(avg / 128, 1) * 1.5;
        
        setAudioLevel(normalized);

        animationFrameIdRef.current = requestAnimationFrame(visualize);
      };

      visualize();
    } catch (err) {
      console.error("Error accessing microphone for visualizer:", err);
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        finalTranscriptRef.current = inputMessage;
        startVisualizer();
      };

      recognition.onend = () => {
        setIsListening(false);
        stopVisualizer();
      };

      recognition.onresult = (event) => {
        let interim_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += ' ' + transcript;
          } else {
            interim_transcript += transcript;
          }
        }
        setInputMessage(finalTranscriptRef.current.trim() + ' ' + interim_transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        stopVisualizer();
      };

      recognitionRef.current = recognition;

      return () => {
        stopVisualizer();
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      };
    } else {
      // Web Speech API not supported
      console.warn("Web Speech API is not supported in this browser.");
      setIsSpeechRecognitionSupported(false);
    }
  }, []);

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
    finalTranscriptRef.current = '';
  };

  const handleVoiceClick = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        alert("Voice recognition is not supported in your browser. Please try Chrome or Edge.");
      }
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
    <div className={`h-full flex flex-col p-4 ${isDarkMode ? 'bg-[#1e1e1e] text-white' : 'bg-white text-black'}`}>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {groupedMessages.map((group, index) => (
          <div key={index} className={`flex mb-4 ${
            group[0].type === 'user' ? 'justify-end' : 
            group[0].type === 'system' ? 'justify-center' : 'justify-start'
          }`}>
            <div className={`max-w-xl lg:max-w-2xl`}>
              {group.map((message, msgIndex) => (
                <div
                  key={msgIndex}
                  className={`px-4 py-3 rounded-lg mb-1 shadow-sm chat-message ${
                    group[0].type === 'user'
                      ? 'bg-orange-500 text-white chat-message-user'
                      : group[0].type === 'system'
                      ? 'bg-green-500 text-white chat-message-system text-center font-semibold'
                      : isDarkMode ? 'bg-gray-700 chat-message-assistant' : 'bg-gray-200 chat-message-assistant'
                  } ${
                    group.length > 1 ? 
                      (msgIndex === 0 ? 'rounded-b-none' : msgIndex === group.length - 1 ? 'rounded-t-none' : 'rounded-none') 
                      : ''
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {formatMessageContent(message.content, group[0].type)}
                  </div>
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

      <form onSubmit={handleSubmit} className="mt-4">
        <div 
          className={`flex items-start p-1 rounded-lg border transition-all duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-300'} focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500`}
          style={{
            boxShadow: isListening ? `0 0 0 ${audioLevel * 3}px rgba(249, 115, 22, 0.5)` : 'none'
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={interviewComplete ? "Interview completed. Use 'Reset Interview' to start a new session." : "Type your message..."}
            className="flex-1 px-3 py-2 bg-transparent focus:outline-none resize-none overflow-y-auto max-h-40 custom-scrollbar"
            disabled={isLoading || interviewComplete}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex items-center self-end space-x-1 p-1">
            {isSpeechRecognitionSupported && (
              <div className="relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleVoiceClick}
                  className={`relative z-10 p-2 rounded-full text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white ${isListening ? 'bg-red-500' : 'bg-blue-500 hover:bg-blue-600'}`}
                  aria-label={isListening ? 'Stop listening' : 'Start listening'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim() || interviewComplete}
              className={`p-2 rounded-full text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white ${isLoading || !inputMessage.trim() || interviewComplete ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 0010 16.57l5.318-1.518a1 1 0 001.17-1.41L10.894 2.553z" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ChatBox; 