
import React from 'react';
import { AtomIcon } from '../icons/HeroIcons';

const Spinner: React.FC<{ message?: string }> = ({ message = 'Thinking...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AtomIcon className="w-12 h-12 text-cyan-400 animate-spin" />
      <p className="mt-4 text-lg font-medium text-gray-300">{message}</p>
    </div>
  );
};

export default Spinner;
