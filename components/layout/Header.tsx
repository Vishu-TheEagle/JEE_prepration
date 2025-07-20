import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NAV_ITEMS } from '../../constants';
import { ChevronDownIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon } from '../icons/HeroIcons';
import Avatar from '../common/Avatar';

const Header: React.FC<{ sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void; }> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPage = NAV_ITEMS.find((item) => {
    if (item.path === '/dashboard') return location.pathname === '/' || location.pathname === '/dashboard';
    if (item.path === '/collaboration') return location.pathname.startsWith('/collaboration');
    if (item.path === '/community') return location.pathname.startsWith('/community');
    return location.pathname.startsWith(item.path);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-gray-900/70 backdrop-blur-sm shadow-md">
       <button
          type="button"
          className="border-r border-gray-700 px-4 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
            <h1 className="text-xl font-semibold text-white">{currentPage?.name || 'JEE Genius'}</h1>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <div className="relative ml-3" ref={dropdownRef}>
            <div>
              <button
                type="button"
                className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 p-1"
                id="user-menu-button"
                aria-expanded="false"
                aria-haspopup="true"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <Avatar name={user?.name || ''} />
                <span className="hidden md:block ml-2 text-white font-medium">{user?.name}</span>
                 <ChevronDownIcon className="hidden md:block w-5 h-5 ml-1 text-gray-400"/>
              </button>
            </div>
            {dropdownOpen && (
              <div
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  role="menuitem"
                >
                  <Cog6ToothIcon className="w-5 h-5 mr-2" />
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  role="menuitem"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;