import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/apiService';
import Card from '../common/Card';
import Button from '../common/Button';
import { HeartIcon } from '../icons/HeroIcons';
import Spinner from '../common/Spinner';

const ParentDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [studentData, setStudentData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [encouragement, setEncouragement] = useState('');

    useEffect(() => {
        const fetchStudentData = async () => {
            if (user?.studentEmail) {
                try {
                    setIsLoading(true);
                    const data = await apiService.getStudentDataForParent();
                    setStudentData(data);
                } catch (error) {
                    toast.error("Could not fetch student data.");
                } finally {
                    setIsLoading(false);
                }
            }
        }
        fetchStudentData();
    }, [user]);

    const handleSendEncouragement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!encouragement.trim() || !user?.studentEmail) return;

        try {
            await apiService.sendEncouragement(encouragement);
            toast.success("Encouragement sent!");
            setEncouragement('');
        } catch(error) {
            toast.error("Failed to send message.");
        }
    };

    if (isLoading) {
        return <Spinner message="Loading student data..." />;
    }

    return (
        <div className="animate-page-enter">
            <h1 className="text-3xl font-bold text-white mb-6">Student Progress Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-cyan-400">Level</h3>
                    <p className="text-4xl font-bold">{studentData?.gamification?.level || 1}</p>
                </Card>
                 <Card>
                    <h3 className="text-lg font-semibold text-cyan-400">Experience (XP)</h3>
                    <p className="text-4xl font-bold">{studentData?.gamification?.xp || 0}</p>
                </Card>
                 <Card>
                    <h3 className="text-lg font-semibold text-cyan-400">Mistakes Logged</h3>
                    <p className="text-4xl font-bold">{studentData?.mistakeCount || 0}</p>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                 <Card>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3">Topics to Focus On</h3>
                    {studentData?.weakTopics?.length > 0 ? (
                        <ul className="space-y-2">
                           {studentData.weakTopics.map((topic: string) => (
                               <li key={topic} className="p-2 bg-gray-900/50 rounded-md text-gray-300">{topic}</li>
                           ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">No specific weak areas detected yet. Great work!</p>
                    )}
                </Card>

                 <Card>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center"><HeartIcon className="w-6 h-6 mr-2"/>Send Encouragement</h3>
                    <p className="text-sm text-gray-400 mb-4">Your message will appear as a pop-up for the student.</p>
                    <form onSubmit={handleSendEncouragement} className="flex gap-2">
                        <input
                            type="text"
                            value={encouragement}
                            onChange={(e) => setEncouragement(e.target.value)}
                            placeholder="e.g., 'Keep up the great work!'"
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 transition"
                        />
                        <Button type="submit">Send</Button>
                    </form>
                 </Card>
            </div>
        </div>
    );
};

export default ParentDashboardPage;