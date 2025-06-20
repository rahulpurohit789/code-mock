import { useMemo } from 'react';

const useTheme = (isDarkMode) => {
  const colors = useMemo(() => ({
    background: {
      primary: isDarkMode ? '#121212' : '#ffffff',
      secondary: isDarkMode ? '#1e1e1e' : '#f5f5f5',
    },
    text: {
      primary: isDarkMode ? '#ffffff' : '#000000',
      secondary: isDarkMode ? '#a0a0a0' : '#666666',
      accent: isDarkMode ? '#ff8c00' : '#ff8c00',
    },
    border: {
      primary: isDarkMode ? '#333333' : '#e0e0e0',
      secondary: isDarkMode ? '#404040' : '#d0d0d0',
    },
    button: {
      primary: isDarkMode ? '#ff8c00' : '#ff8c00',
      primaryHover: isDarkMode ? '#ff7000' : '#ff7000',
    },
  }), [isDarkMode]);

  return { colors };
};

export default useTheme; 