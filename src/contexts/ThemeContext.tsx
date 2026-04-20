import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ theme: 'light', setTheme: (t: string) => {} });

export const ThemeProvider = ({ children, defaultTheme = 'light' }: any) => {
  const [theme, setTheme] = useState(defaultTheme);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
