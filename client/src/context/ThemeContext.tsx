import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  primaryColor: string;
  secondaryColor: string;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = React.memo(({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });
  
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('primaryColor') || '#3b82f6';
  });
  
  const [secondaryColor, setSecondaryColor] = useState(() => {
    return localStorage.getItem('secondaryColor') || '#64748b';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem('secondaryColor', secondaryColor);
  }, [secondaryColor]);

  const toggleTheme = React.useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const handleSetPrimaryColor = React.useCallback((color: string) => {
    setPrimaryColor(color);
  }, []);

  const handleSetSecondaryColor = React.useCallback((color: string) => {
    setSecondaryColor(color);
  }, []);

  const contextValue = useMemo(() => ({
    isDark,
    toggleTheme,
    primaryColor,
    secondaryColor,
    setPrimaryColor: handleSetPrimaryColor,
    setSecondaryColor: handleSetSecondaryColor,
  }), [isDark, toggleTheme, primaryColor, secondaryColor, handleSetPrimaryColor, handleSetSecondaryColor]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
});