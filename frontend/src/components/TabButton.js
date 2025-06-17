import React from 'react';

const TabButton = ({ children, isActive, onClick, style }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ${
        isActive ? 'border-b-2' : 'text-gray-500 hover:text-gray-700'
      }`}
      style={{
        ...style,
        borderColor: isActive ? '#1a90ff' : 'transparent',
        backgroundColor: 'transparent',
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
};

export default TabButton; 