import React from 'react';

function Footer({ isDarkMode }) {
  return (
    <footer className={`${isDarkMode ? 'bg-[#1F1F1F]' : 'bg-white'} shadow mt-8`}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className={`text-lg font-semibold text-[#FF8C00]`}>
            Code Mock
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-[#E0E0E0]' : 'text-[#212121]'}`}>
            © {new Date().getFullYear()} Code Mock. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 