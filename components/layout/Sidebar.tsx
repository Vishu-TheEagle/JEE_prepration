
import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants';
import { AtomIcon } from '../icons/HeroIcons';
import { useLocale } from '../../hooks/useLocale';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const SidebarContent: React.FC = () => {
    const { t } = useLocale();

    return (
        <>
            <div className="flex h-16 flex-shrink-0 items-center px-4 bg-gray-900">
                <AtomIcon className="h-8 w-auto text-cyan-400" />
                <span className="ml-3 text-2xl font-bold text-white">Genius AI</span>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
                {NAV_ITEMS.map((item) => (
                <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                        ? 'bg-cyan-500/10 text-cyan-300'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }`
                    }
                >
                    {item.icon({ className: "mr-3 flex-shrink-0 h-6 w-6" })}
                    {t(item.i18nKey)}
                </NavLink>
                ))}
            </nav>
        </>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      {/* Mobile sidebar */}
      <div className={`relative z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-800 pb-4">
              <SidebarContent />
            </div>
          </div>
        </div>
      </div>
      
      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-700 bg-gray-800 pb-4">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;