import React from 'react';

function Header({ isDarkMode, toggleTheme }) {
  return (
    <div>
      {/* Main Header */}
      <header className={`${isDarkMode ? 'bg-[#1F1F1F]' : 'bg-white'} shadow`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Nav */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-[#FF8C00] text-2xl font-bold">
                  Code Mock
                </span>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-center space-x-4">
                  <a
                    href="#"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isDarkMode 
                        ? 'text-[#E0E0E0] hover:bg-[#2A2A2A]' 
                        : 'text-[#212121] hover:bg-[#F0F0F0]'
                    }`}
                  >
                    Problems
                  </a>
                  <a
                    href="#"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isDarkMode 
                        ? 'text-[#E0E0E0] hover:bg-[#2A2A2A]' 
                        : 'text-[#212121] hover:bg-[#F0F0F0]'
                    }`}
                  >
                    Interview
                  </a>
                  <a
                    href="#"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isDarkMode 
                        ? 'text-[#E0E0E0] hover:bg-[#2A2A2A]' 
                        : 'text-[#212121] hover:bg-[#F0F0F0]'
                    }`}
                  >
                    Contests
                  </a>
                </div>
              </div>
            </div>

            {/* Right side - Theme Toggle and User */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF8C00] ${
                  isDarkMode
                    ? 'bg-[#121212] text-[#E0E0E0] hover:bg-[#2A2A2A]'
                    : 'bg-[#FAFAFA] text-[#212121] hover:bg-[#F0F0F0]'
                }`}
              >
                {isDarkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium bg-[#FF8C00] text-white hover:bg-[#FF7000] focus:outline-none focus:ring-2 focus:ring-[#FF8C00]`}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub Header - Problem Navigation */}
      <div className={`${isDarkMode ? 'bg-[#121212]' : 'bg-[#FAFAFA]'} border-b ${isDarkMode ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12 space-x-8">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-[#E0E0E0]' : 'text-[#212121]'}`}>
              Problem List
            </span>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-[#E0E0E0]' : 'text-[#212121]'}`}>
              AI Interview
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header; 