import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_MODE_STORAGE_KEY = 'pokesphere_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(THEME_MODE_STORAGE_KEY) as ThemeMode | null;
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored;
    }
  } catch (e) {
    console.error('Failed to read theme mode from storage', e);
  }
  return 'system';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getStoredMode);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemPreference);

  // Compute the current active resolved theme (light or dark)
  const resolvedTheme: ResolvedTheme = mode === 'system' ? systemTheme : mode;

  // Listen for operating system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Modern and backward compatible listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else {
      (mediaQuery as any).addListener(handleSystemChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemChange);
      } else {
        (mediaQuery as any).removeListener(handleSystemChange);
      }
    };
  }, []);

  // Apply resolved theme attribute and class to root html element
  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute('data-theme', resolvedTheme);

    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, newMode);
    } catch (e) {
      console.error('Failed to persist theme mode', e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    // Cycle: system -> light -> dark -> system
    if (mode === 'system') {
      setMode(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else if (mode === 'light') {
      setMode('dark');
    } else {
      setMode('system');
    }
  }, [mode, resolvedTheme, setMode]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        resolvedTheme,
        isDark: resolvedTheme === 'dark',
        setMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
