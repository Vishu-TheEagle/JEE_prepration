
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Card from '../common/Card';
import { useGamification } from '../../hooks/useGamification';
import { BADGES } from '../../constants';
import { FireIcon } from '../icons/HeroIcons';

const GamificationWidget = () => {
    const { level, xp, unlockedBadges } = useGamification();
    const xpForNextLevel = (level + 1) * 100;
    const progress = (xp / xpForNextLevel) * 100;

    return (
        <Card className="bg-cyan-900/30 border border-cyan-700/50">
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="font-bold text-white">Level {level}</span>
                        <span className="text-sm text-gray-400">{xp} / {xpForNextLevel} XP</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-white mb-2">Badges Unlocked</h3>
                    <div className="flex flex-wrap gap-2">
                        {unlockedBadges.length > 0 ? (
                            unlockedBadges.map(badgeId => {
                                const badge = BADGES[badgeId];
                                return (
                                    <div key={badge.id} className="p-2 bg-gray-700/50 rounded-full" title={`${badge.name}: ${badge.description}`}>
                                        {badge.icon({ className: "w-6 h-6 text-yellow-400" })}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-500">No badges yet. Keep going!</p>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

const StreakWidget = () => {
    const { streak } = useGamification();
    if (streak === 0) return null;

    return (
        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/50 text-orange-400 font-bold rounded-full px-3 py-1 text-sm">
            <FireIcon className="w-5 h-5 text-orange-400" />
            <span>{streak} Day Streak!</span>
        </div>
    );
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { checkAndApplyStreak } = useGamification();
  
  useEffect(() => {
    checkAndApplyStreak();
  }, [checkAndApplyStreak]);

  useEffect(() => {
    const encouragementMessage = localStorage.getItem(`encouragement-for-${user?.email}`);
    if (encouragementMessage) {
        toast.success(
            <div className="text-center">
                <p className="font-bold">A message from your Mentor!</p>
                <p>"{encouragementMessage}"</p>
            </div>, {
            duration: 6000,
            icon: '💖',
            style: {
                background: '#155e75', // cyan-800
                color: '#fff',
            }
        });
        localStorage.removeItem(`encouragement-for-${user?.email}`);
    }
  }, [user]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-page-enter">
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-white">
            Welcome, {user?.name || 'Aspirant'}!
            </h1>
            <StreakWidget />
        </div>
        <p className="mt-2 text-lg text-gray-400">
          Here is a summary of your progress. Keep up the great work!
        </p>
      </div>
      
      <div className="mb-8">
        <GamificationWidget />
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-cyan-400 mb-4">Quick Start</h2>
        <p className="text-gray-300">
            Use the sidebar on the left to navigate to all the features, such as the AI Doubt Solver, Test Generator, and your Learning Plan.
            Your journey to mastering JEE starts now!
        </p>
      </Card>
    </div>
  );
};

export default DashboardPage;
