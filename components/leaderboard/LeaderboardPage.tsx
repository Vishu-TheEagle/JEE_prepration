import React from 'react';
import { useGamification } from '../../hooks/useGamification';
import { LeaderboardUser } from '../../types';
import Card from '../common/Card';
import { TrophyIcon, UserCircleIcon } from '../icons/HeroIcons';

const mockLeaderboard: LeaderboardUser[] = [
    { rank: 1, name: 'Aarav Sharma', level: 25, xp: 2580, isCurrentUser: false },
    { rank: 2, name: 'Vivaan Gupta', level: 24, xp: 2450, isCurrentUser: false },
    { rank: 3, name: 'Aditya Kumar', level: 23, xp: 2310, isCurrentUser: false },
    { rank: 4, name: 'Vihaan Singh', level: 22, xp: 2290, isCurrentUser: false },
    { rank: 5, name: 'Ananya Reddy', level: 22, xp: 2250, isCurrentUser: false },
    { rank: 6, name: 'Sai Patel', level: 21, xp: 2180, isCurrentUser: false },
    { rank: 7, name: 'Reyansh Mishra', level: 20, xp: 2050, isCurrentUser: false },
    { rank: 8, name: 'Diya Joshi', level: 19, xp: 1940, isCurrentUser: false },
    { rank: 9, name: 'Arjun Verma', level: 18, xp: 1820, isCurrentUser: false },
    { rank: 10, name: 'Ishan Jain', level: 17, xp: 1750, isCurrentUser: false },
];

const LeaderboardPage: React.FC = () => {
    const { level, xp, unlockedBadges } = useGamification();

    const currentUserData: LeaderboardUser = {
        rank: 11, // Mock rank
        name: 'You',
        level: level,
        xp: xp,
        isCurrentUser: true
    };

    const fullLeaderboard = [...mockLeaderboard, currentUserData].sort((a,b) => b.xp - a.xp).map((user, index) => ({...user, rank: index + 1}));


    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-page-enter">
            <div className="flex items-center mb-6">
                <TrophyIcon className="w-10 h-10 text-yellow-400 mr-4"/>
                <div>
                    <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
                    <p className="text-gray-400">See how you rank against other top students.</p>
                </div>
            </div>

            <Card>
                <div className="flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead>
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">Rank</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Level</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">XP</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {fullLeaderboard.map((user) => (
                                        <tr key={user.rank} className={user.isCurrentUser ? "bg-cyan-900/30" : ""}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">{user.rank}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300 flex items-center">
                                                <UserCircleIcon className={`w-6 h-6 mr-2 ${user.isCurrentUser ? 'text-cyan-400' : 'text-gray-500'}`} />
                                                {user.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{user.level}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{user.xp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default LeaderboardPage;
