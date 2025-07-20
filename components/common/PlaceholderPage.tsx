
import React from 'react';
import { WrenchScrewdriverIcon } from '../icons/HeroIcons';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="p-4 bg-gray-700/50 rounded-full">
        <WrenchScrewdriverIcon className="w-16 h-16 text-cyan-400" />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-white">{title}</h1>
      <p className="mt-2 text-lg text-gray-400">This feature is under construction.</p>
      <p className="text-gray-500">Check back soon for updates!</p>
    </div>
  );
};

export default PlaceholderPage;
