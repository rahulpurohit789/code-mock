import { useCallback } from 'react';
import { themeColors } from '../theme/colors';

export const useTheme = (isDarkMode) => {
  const getThemeColor = useCallback((path) => {
    const theme = isDarkMode ? themeColors.dark : themeColors.light;
    return path.split('.').reduce((obj, key) => obj[key], theme);
  }, [isDarkMode]);

  return {
    colors: themeColors[isDarkMode ? 'dark' : 'light'],
    getThemeColor,
  };
}; 