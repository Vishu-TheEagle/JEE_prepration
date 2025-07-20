import { useContext } from 'react';
import { MistakeContext } from '../contexts/MistakeContext';

export const useMistakes = () => {
  const context = useContext(MistakeContext);
  if (context === undefined) {
    throw new Error('useMistakes must be used within a MistakeProvider');
  }
  return context;
};
