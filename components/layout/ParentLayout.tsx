import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ArrowRightOnRectangleIcon, HomeIcon, BookOpenIcon, PencilIcon } from '../icons/HeroIcons';

const PARENT_NAV_ITEMS = [
    { name: 'Dashboard', path: '/parent/dashboard', icon: (props) => <HomeIcon {...props} /> },
    { name: 'Mistake Journal', path: '/parent/mistake-journal', icon: (props) => <BookOpenIcon {...props} /> },
    { name: 'Learning Plan', path: '/parent/learning-plan', icon: (props) => <PencilIcon {...props} /> },
];

const ParentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800/80 backdrop-blur-sm shadow-lg sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <span className="font-bold text-lg text-cyan-400">Mentor Dashboard</span>
                            <span className="ml-4 pl-4 border-l border-gray-600 text-gray-300">Viewing: {user?.studentEmail}</span>
                        </div>
                        <div className="flex items-center">
                             <img className="h-8 w-8 rounded-full" src={user?.avatar} alt="" />
                             <span className="ml-2 font-medium">{user?.name}</span>
                            <button onClick={logout} className="ml-6 flex items-center text-gray-400 hover:text-white transition-colors" title="Sign out">
                                <ArrowRightOnRectangleIcon className="w-6 h-6"/>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-3">
                        <nav className="space-y-1">
                             {PARENT_NAV_ITEMS.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) =>
                                    `group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                                        isActive
                                        ? 'bg-cyan-500/10 text-cyan-300'
                                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                    }`
                                    }
                                >
                                    {item.icon({ className: "mr-3 flex-shrink-0 h-6 w-6" })}
                                    {item.name}
                                </NavLink>
                                ))}
                        </nav>
                    </div>
                    <main className="lg:col-span-9 mt-6 lg:mt-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ParentLayout;
