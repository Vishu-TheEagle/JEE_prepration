import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';
import { GamificationState } from '../types';
import { BADGES } from '../constants';
import { useAuth } from '../hooks/useAuth';

interface GamificationContextType {
  xp: number;
  level: number;
  unlockedBadges: string[];
  streak: number;
  addXp: (amount: number, newBadges?: string[]) => void;
  checkAndApplyStreak: () => void;
}

export const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const initialState: GamificationState = {
  xp: 0,
  level: 1,
  unlockedBadges: [],
  streak: 0,
  lastLoginTimestamp: 0,
};

const isSameDay = (ts1: number, ts2: number) => {
    if (!ts1 || !ts2) return false;
    const d1 = new Date(ts1);
    const d2 = new Date(ts2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

const isYesterday = (ts1: number, ts2: number) => {
    if (!ts1 || !ts2) return false;
    const yesterday = new Date(ts1);
    yesterday.setDate(yesterday.getDate() - 1);
    const d2 = new Date(ts2);
     return yesterday.getFullYear() === d2.getFullYear() &&
           yesterday.getMonth() === d2.getMonth() &&
           yesterday.getDate() === d2.getDate();
}


export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GamificationState>(initialState);
  const { user } = useAuth();
  const GAMIFICATION_STORAGE_KEY = user ? `jee-genius-gamification-${user.email}` : null;


  useEffect(() => {
    if (!GAMIFICATION_STORAGE_KEY) {
        setState(initialState);
        return;
    }
    try {
      const storedState = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
      if (storedState) {
        setState(JSON.parse(storedState));
      } else {
        setState(initialState);
      }
    } catch (error) {
      console.error("Failed to parse gamification state from localStorage", error);
      localStorage.removeItem(GAMIFICATION_STORAGE_KEY);
    }
  }, [GAMIFICATION_STORAGE_KEY]);

  const persistState = (newState: GamificationState) => {
    if (!GAMIFICATION_STORAGE_KEY) return;
    localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(newState));
  };
  
  const checkAndApplyStreak = useCallback(() => {
     setState(prevState => {
        const now = Date.now();
        if (isSameDay(now, prevState.lastLoginTimestamp)) {
            // Already logged in today, do nothing.
            return prevState;
        }

        let newStreak = prevState.streak;
        if (isYesterday(now, prevState.lastLoginTimestamp)) {
            newStreak++;
            toast.success(`Welcome back! Your streak is now ${newStreak} days!`, { icon: '🔥' });
        } else {
            newStreak = 1; // Streak broken, reset to 1
        }
        
        const newState = { ...prevState, streak: newStreak, lastLoginTimestamp: now };
        
        if (newStreak >= 3 && !newState.unlockedBadges.includes('streaker')) {
            newState.unlockedBadges.push('streaker');
            toast.success(`You earned the 'Streaker' badge!`, { icon: '🏆'});
        }

        persistState(newState);
        return newState;
     });
  }, [GAMIFICATION_STORAGE_KEY]);

  const addXp = useCallback((amount: number, newBadgeIds: string[] = []) => {
    setState(prevState => {
      const newXp = prevState.xp + amount;
      const xpForNextLevel = (prevState.level + 1) * 100;
      let newLevel = prevState.level;
      let finalXp = newXp;

      if (newXp >= xpForNextLevel) {
        newLevel++;
        finalXp = newXp - xpForNextLevel;
        toast.success(`Level Up! You've reached Level ${newLevel}!`, { icon: '🎉' });
      }
      
      const newlyUnlockedBadges = newBadgeIds.filter(id => !prevState.unlockedBadges.includes(id));
      if (newlyUnlockedBadges.length > 0) {
        newlyUnlockedBadges.forEach(id => {
            const badge = BADGES[id];
            if (badge) {
                toast.success(`Badge Unlocked: ${badge.name}!`, { icon: '🏆'});
            }
        });
      }

      const newState = {
        ...prevState,
        xp: finalXp,
        level: newLevel,
        unlockedBadges: [...prevState.unlockedBadges, ...newlyUnlockedBadges],
      };
      
      persistState(newState);
      return newState;
    });
  }, [GAMIFICATION_STORAGE_KEY]);

  return (
    <GamificationContext.Provider value={{ ...state, addXp, checkAndApplyStreak }}>
      {children}
    </GamificationContext.Provider>
  );
};
