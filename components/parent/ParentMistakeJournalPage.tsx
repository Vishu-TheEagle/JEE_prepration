import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import { Mistake } from '../../types';
import { CheckCircleIcon, XCircleIcon } from '../icons/HeroIcons';
import { apiService } from '../../services/apiService';
import Spinner from '../common/Spinner';

const ParentMistakeJournalPage: React.FC = () => {
    const [mistakes, setMistakes] = useState<Mistake[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchMistakes = async () => {
            try {
                setIsLoading(true);
                const data = await apiService.getStudentMistakesForParent();
                setMistakes(data);
            } catch (error) {
                console.error("Could not fetch student mistakes");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMistakes();
    }, []);

    if (isLoading) {
        return <Spinner message="Loading mistake journal..." />;
    }

    if (mistakes.length === 0) {
        return (
            <Card className="text-center py-16">
                 <h2 className="mt-4 text-xl font-semibold text-white">Student's Journal is Empty</h2>
                 <p className="mt-2 text-gray-400">No mistakes have been logged yet.</p>
            </Card>
        );
    }

    return (
        <div className="animate-page-enter">
             <h1 className="text-3xl font-bold text-white mb-6">Student's Mistake Journal</h1>
             <div className="space-y-6">
                {mistakes.map((mistake, index) => (
                    <Card key={`${mistake.timestamp}-${index}`}>
                        <div className="p-4">
                            <p className="text-sm text-cyan-400 font-medium bg-cyan-900/50 px-2 py-1 rounded-full inline-block mb-2">{mistake.question.topic}</p>
                            <p className="font-semibold text-gray-200">{mistake.question.question}</p>
                             <div className="mt-4 space-y-2">
                                {mistake.question.options.map((option, idx) => {
                                    const isUserAnswer = option === mistake.userAnswer;
                                    const isCorrectAnswer = option === mistake.question.answer;
                                    let classes = "flex items-center p-3 rounded-md text-gray-300 ";
                                    if (isUserAnswer && !isCorrectAnswer) classes += "bg-red-500/20";
                                    else if (isCorrectAnswer) classes += "bg-green-500/20";
                                    else classes += "bg-gray-700/50";

                                    return (
                                    <div key={idx} className={classes}>
                                        {isUserAnswer && !isCorrectAnswer && <XCircleIcon className="w-5 h-5 mr-3 text-red-400 shrink-0" />}
                                        {isCorrectAnswer && <CheckCircleIcon className="w-5 h-5 mr-3 text-green-400 shrink-0" />}
                                        {!isUserAnswer && !isCorrectAnswer && <div className="w-5 h-5 mr-3 shrink-0" />}
                                        <span>{option}</span>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ParentMistakeJournalPage;