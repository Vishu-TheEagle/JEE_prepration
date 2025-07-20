import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Mistake } from '../types';
import { useAuth } from '../hooks/useAuth';

interface MistakeContextType {
  mistakes: Mistake[];
  addMistake: (mistake: Mistake) => void;
  clearMistakes: () => void;
}

export const MistakeContext = createContext<MistakeContextType | undefined>(undefined);

export const MistakeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const { user } = useAuth();
  const MISTAKES_STORAGE_KEY = user ? `jee-genius-mistakes-${user.email}` : null;

  useEffect(() => {
    if (!MISTAKES_STORAGE_KEY) {
        setMistakes([]);
        return;
    }
    try {
      const storedMistakes = localStorage.getItem(MISTAKES_STORAGE_KEY);
      if (storedMistakes) {
        setMistakes(JSON.parse(storedMistakes));
      } else {
        setMistakes([]);
      }
    } catch (error) {
      console.error("Failed to parse mistakes from localStorage", error);
      localStorage.removeItem(MISTAKES_STORAGE_KEY);
    }
  }, [MISTAKES_STORAGE_KEY]);

  const persistMistakes = (newMistakes: Mistake[]) => {
    if (!MISTAKES_STORAGE_KEY) return;
    localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(newMistakes));
  };

  const addMistake = useCallback((mistake: Mistake) => {
    setMistakes(prevMistakes => {
      const newMistakes = [mistake, ...prevMistakes];
      persistMistakes(newMistakes);
      return newMistakes;
    });
  }, [MISTAKES_STORAGE_KEY]);

  const clearMistakes = useCallback(() => {
    setMistakes([]);
    if (!MISTAKES_STORAGE_KEY) return;
    localStorage.removeItem(MISTAKES_STORAGE_KEY);
  }, [MISTAKES_STORAGE_KEY]);

  return (
    <MistakeContext.Provider value={{ mistakes, addMistake, clearMistakes }}>
      {children}
    </MistakeContext.Provider>
  );
};
