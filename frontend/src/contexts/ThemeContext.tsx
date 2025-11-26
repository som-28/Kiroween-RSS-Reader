import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeType = 'graveyard' | 'haunted-mansion' | 'witch-cottage' | 'high-contrast';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  enableAnimations: boolean;
  setEnableAnimations: (enabled: boolean) => void;
  enableSoundEffects: boolean;
  setEnableSoundEffects: (enabled: boolean) => void;
  highContrastMode: boolean;
  setHighContrastMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('haunted-theme');
    return (saved as ThemeType) || 'graveyard';
  });

  const [enableAnimations, setEnableAnimations] = useState(() => {
    const saved = localStorage.getItem('haunted-animations');
    return saved !== 'false';
  });

  const [enableSoundEffects, setEnableSoundEffects] = useState(() => {
    const saved = localStorage.getItem('haunted-sounds');
    return saved === 'true';
  });

  const [highContrastMode, setHighContrastMode] = useState(() => {
    const saved = localStorage.getItem('haunted-high-contrast');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('haunted-theme', theme);
    // If high contrast mode is enabled, override theme
    const activeTheme = highContrastMode ? 'high-contrast' : theme;
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [theme, highContrastMode]);

  useEffect(() => {
    localStorage.setItem('haunted-animations', String(enableAnimations));
  }, [enableAnimations]);

  useEffect(() => {
    localStorage.setItem('haunted-sounds', String(enableSoundEffects));
  }, [enableSoundEffects]);

  useEffect(() => {
    localStorage.setItem('haunted-high-contrast', String(highContrastMode));
  }, [highContrastMode]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        enableAnimations,
        setEnableAnimations,
        enableSoundEffects,
        setEnableSoundEffects,
        highContrastMode,
        setHighContrastMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
