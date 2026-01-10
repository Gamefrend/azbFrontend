// src/hooks/useDarkMode.js
import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  // Initialisiere den State basierend auf Local Storage oder Systempräferenz
  const [theme, setTheme] = useState(() => {
    const localTheme = window.localStorage.getItem('theme');
    if (localTheme) {
      return localTheme;
    }
    // Prüfe, ob das System den Dark Mode bevorzugt
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    // Füge die Klasse zum body-Element hinzu
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
    // Speichere die Präferenz
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  return [theme, toggleTheme];
};