import React, { createContext, useContext, useEffect, useState } from 'react';

export interface WorkoutStyleTheme {
  primary: string;
  secondary: string;
  dark: string;
  highlight: string;
  text: string;
  textMuted: string;
  label: string;
}

export const workoutStyleColors: Record<string, WorkoutStyleTheme> = {
  highEnergy: {
    primary: '#E1000F',
    secondary: '#FF3800',
    dark: '#0D0D0D',
    highlight: '#FFD600',
    text: '#FFFFFF',
    textMuted: '#B3B3B3',
    label: 'High Energy',
  },
};

interface WorkoutThemeContextType {
  currentStyle: string;
  setWorkoutStyle: (styleKey: string) => void;
  theme: WorkoutStyleTheme;
}

const WorkoutThemeContext = createContext<WorkoutThemeContextType | undefined>(undefined);

const applyThemeToDOM = (style: WorkoutStyleTheme) => {
  const root = document.documentElement.style;
  root.setProperty('--ion-color-primary', style.primary);
  root.setProperty('--ion-color-secondary', style.secondary);
  root.setProperty('--ion-background-color', style.dark);
  root.setProperty('--workout-highlight', style.highlight);
  root.setProperty('--ion-text-color', style.text);
  root.setProperty('--workout-text-muted', style.textMuted);
};

export const WorkoutThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStyle, setCurrentStyle] = useState('highEnergy');

  useEffect(() => {
    applyThemeToDOM(workoutStyleColors[currentStyle]);
  }, [currentStyle]);

  const setWorkoutStyle = (styleKey: string) => {
    if (!workoutStyleColors[styleKey]) return;
    setCurrentStyle(styleKey);
  };

  return (
    <WorkoutThemeContext.Provider
      value={{ currentStyle, setWorkoutStyle, theme: workoutStyleColors[currentStyle] }}
    >
      {children}
    </WorkoutThemeContext.Provider>
  );
};

export const useWorkoutTheme = () => {
  const context = useContext(WorkoutThemeContext);
  if (!context) throw new Error('useWorkoutTheme must be used within WorkoutThemeProvider');
  return context;
};