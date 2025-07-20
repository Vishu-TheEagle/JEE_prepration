import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { LearningPlan } from '../../types';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import { PencilIcon } from '../icons/HeroIcons';

const ParentLearningPlanPage: React.FC = () => {
    const [plan, setPlan] = useState<LearningPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                setIsLoading(true);
                const data = await apiService.getStudentLearningPlanForParent();
                setPlan(data);
            } catch (error) {
                console.error("Could not fetch student's learning plan");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlan();
    }, []);

    if (isLoading) {
        return <Spinner message="Loading student's learning plan..." />;
    }

    if (!plan) {
        return (
            <Card className="text-center py-16">
                <PencilIcon className="mx-auto h-16 w-16 text-gray-500" />
                <h2 className="mt-4 text-xl font-semibold text-white">No Learning Plan Found</h2>
                <p className="mt-2 text-gray-400">The student has not generated a learning plan yet.</p>
            </Card>
        );
    }

    return (
        <div className="animate-page-enter">
            <h1 className="text-3xl font-bold text-white mb-6">Student's Learning Plan</h1>
            <div>
                <Card className="mb-6 bg-cyan-900/30 border border-cyan-700/50">
                    <h2 className="text-xl font-bold text-cyan-400">This Week's Goal</h2>
                    <p className="text-gray-300 mt-2">{plan.week_goal}</p>
                </Card>
                <div className="space-y-4">
                    {plan.daily_plans.map(dayPlan => (
                        <Card key={dayPlan.day}>
                            <h3 className="text-lg font-semibold text-white">Day {dayPlan.day}: <span className="text-cyan-400">{dayPlan.topic}</span></h3>
                            <p className="text-md font-medium text-gray-300 mt-2"><strong>Task:</strong> {dayPlan.task}</p>
                            <p className="text-sm text-gray-400 mt-1">{dayPlan.details}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ParentLearningPlanPage;