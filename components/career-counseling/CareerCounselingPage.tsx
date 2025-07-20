
import React, { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useMistakes } from '../../hooks/useMistakes';
import { generateCareerCounseling } from '../../services/geminiService';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { AcademicCapIcon, SparklesIcon } from '../icons/HeroIcons';

const CareerCounselingPage: React.FC = () => {
    const { mistakes } = useMistakes();
    const [report, setReport] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const performanceSummary = useMemo(() => {
        if (mistakes.length < 10) { // Require a minimum number of mistakes for a meaningful report
            return null;
        }

        const topicCounts: { [key: string]: { correct: number, incorrect: number } } = {};
        
        // This is a simplification. A real app would need data on correct answers too.
        // We'll simulate by assuming a 50% accuracy on topics not in the journal.
        const allTopics = ['Physics', 'Chemistry', 'Mathematics'];
        
        mistakes.forEach(mistake => {
            const topicRoot = mistake.question.topic.split(' - ')[0]; // Group by subject
            if (!topicCounts[topicRoot]) {
                topicCounts[topicRoot] = { correct: 0, incorrect: 0 };
            }
            topicCounts[topicRoot].incorrect++;
        });

        allTopics.forEach(topic => {
            if (!topicCounts[topic]) {
                topicCounts[topic] = { correct: 10, incorrect: 0 }; // Assume good performance if no mistakes
            }
        });

        const sortedTopics = Object.entries(topicCounts).sort(([, a], [, b]) => (b.correct / (b.correct + b.incorrect)) - (a.correct / (a.correct + a.incorrect)));
        
        return {
            strongest: sortedTopics.slice(0, 1).map(([topic]) => topic),
            weakest: sortedTopics.slice(-1).map(([topic]) => topic)
        };
    }, [mistakes]);

    const handleGenerateReport = useCallback(async () => {
        if (!performanceSummary) {
            toast.error("You need to complete more tests to generate an accurate counseling report.");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Your AI counselor is analyzing your performance...');

        try {
            const newReport = await generateCareerCounseling(performanceSummary);
            setReport(newReport);
            toast.success('Your career report is ready!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : 'Failed to generate report.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    }, [performanceSummary]);
    
    if (isLoading) {
        return <Spinner message="Generating your personalized career guidance..." />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-page-enter">
            <h1 className="text-3xl font-bold text-white mb-2">AI-Powered Career Counseling</h1>
            <p className="text-gray-400 mb-6">Get dynamic suggestions for IIT/NIT branches based on your test performance and interests.</p>

            {!report ? (
                 <Card className="text-center py-16">
                    <AcademicCapIcon className="mx-auto h-16 w-16 text-gray-500" />
                    <h2 className="mt-4 text-xl font-semibold text-white">Unlock Your Career Path</h2>
                    <p className="mt-2 text-gray-400 max-w-md mx-auto">
                        {(!performanceSummary)
                            ? "Complete a few more tests in the Test Generator. Once we have enough data on your performance, our AI can provide personalized career guidance."
                            : "Ready for your report? Our AI will analyze your strengths and weaknesses to suggest the best engineering paths for you."
                        }
                    </p>
                    <div className="mt-6">
                        <Button onClick={handleGenerateReport} disabled={!performanceSummary} leftIcon={<SparklesIcon className="w-5 h-5 mr-2"/>}>
                            Generate My Report
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-xl font-bold text-cyan-400 mb-2">Performance Analysis</h2>
                        <p className="text-gray-300">{report.analysis}</p>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-bold text-cyan-400 mb-3">Recommended Engineering Branches</h2>
                        <div className="space-y-3">
                            {report.recommended_branches.map((branch: any, index: number) => (
                                <div key={index} className="p-3 bg-gray-900/50 rounded-lg">
                                    <h3 className="font-semibold text-white">{branch.branch_name}</h3>
                                    <p className="text-sm text-gray-400">{branch.reason}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                    
                    <Card>
                        <h2 className="text-xl font-bold text-cyan-400 mb-3">Top College Suggestions</h2>
                         <div className="space-y-3">
                            {report.top_colleges.map((college: any, index: number) => (
                                <div key={index} className="p-3 bg-gray-900/50 rounded-lg">
                                    <h3 className="font-semibold text-white">{college.college_name}</h3>
                                    <p className="text-sm text-gray-400">{college.notes}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                     <Card>
                        <h2 className="text-xl font-bold text-cyan-400 mb-2">Strategic Improvement Plan</h2>
                        <p className="text-gray-300">{report.improvement_plan}</p>
                    </Card>
                    
                    <div className="text-center pt-4">
                         <Button onClick={() => setReport(null)} variant="secondary">Generate a New Report</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareerCounselingPage;
