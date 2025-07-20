import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ExamMode } from '../types';

type Theme = 'light' | 'dark';

interface SettingsState {
  theme: Theme;
  animationsEnabled: boolean;
  examMode: ExamMode;
  notificationsEnabled: boolean;
}

interface SettingsContextType extends SettingsState {
  setTheme: (theme: Theme) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setExamMode: (mode: ExamMode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'jee-genius-settings';

const defaultSettings: SettingsState = {
    theme: 'dark',
    animationsEnabled: true,
    examMode: 'JEE',
    notificationsEnabled: false,
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } else {
        // Check for system preference if no setting is stored
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            setSettings(s => ({...s, theme: 'light'}));
        }
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }
  }, []);

  const saveSettings = useCallback((newSettings: Partial<SettingsState>) => {
    setSettings(prev => {
        const updatedSettings = { ...prev, ...newSettings };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
        return updatedSettings;
    });
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(settings.theme);
    
    if (settings.animationsEnabled) {
      root.classList.remove('animations-disabled');
    } else {
      root.classList.add('animations-disabled');
    }
  }, [settings.theme, settings.animationsEnabled]);

  const setTheme = (theme: Theme) => saveSettings({ theme });
  const setAnimationsEnabled = (enabled: boolean) => saveSettings({ animationsEnabled: enabled });
  const setExamMode = (mode: ExamMode) => saveSettings({ examMode: mode });
  const setNotificationsEnabled = (enabled: boolean) => saveSettings({ notificationsEnabled: enabled });


  return (
    <SettingsContext.Provider value={{ ...settings, setTheme, setAnimationsEnabled, setExamMode, setNotificationsEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
};