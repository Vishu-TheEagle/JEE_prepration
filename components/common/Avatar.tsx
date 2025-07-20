import React from 'react';

interface AvatarProps {
  name: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, className = '' }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  // Simple hash function to get a color from the name
  const getColorFromName = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
      'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 
      'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 
      'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 
      'bg-pink-500', 'bg-rose-500'
    ];
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  const bgColor = getColorFromName(name);

  return (
    <div
      className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white ${bgColor} ${className}`}
    >
      {initial}
    </div>
  );
};

export default Avatar;