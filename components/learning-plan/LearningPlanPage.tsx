import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useMistakes } from '../../hooks/useMistakes';
import { apiService } from '../../services/apiService';
import { generateLearningPlan } from '../../services/geminiService';
import { LearningPlan } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { PencilIcon, SparklesIcon, CalendarDaysIcon } from '../icons/HeroIcons';
import { useGamification } from '../../hooks/useGamification';
import { generateICSFileContent } from '../../utils/calendar';
import { useSettings } from '../../hooks/useSettings';

const LearningPlanPage: React.FC = () => {
  const { mistakes } = useMistakes();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addXp } = useGamification();
  const { notificationsEnabled } = useSettings();

  const fetchPlan = useCallback(async () => {
    setIsLoading(true);
    try {
      const existingPlan = await apiService.getLearningPlan();
      if(existingPlan){
        setPlan(existingPlan);
      }
    } catch (error) {
      console.error("Failed to fetch learning plan", error);
      // It's okay if it fails, means no plan exists.
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const getWeakTopics = useCallback(() => {
    const topicCounts: { [key: string]: number } = {};
    mistakes.forEach(mistake => {
      topicCounts[mistake.question.topic] = (topicCounts[mistake.question.topic] || 0) + 1;
    });

    return Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5) // Take top 5 weak topics
      .map(([topic]) => topic);
  }, [mistakes]);

  const handleGeneratePlan = useCallback(async () => {
    const weakTopics = getWeakTopics();
    if (weakTopics.length === 0) {
      toast.error("You need to have some mistakes in your journal before we can generate a plan.");
      return;
    }
    
    setIsLoading(true);
    setPlan(null);
    const toastId = toast.loading('Your AI tutor is analyzing your performance and creating a custom plan...');
    
    try {
      const newPlan = await generateLearningPlan(weakTopics);
      await apiService.saveLearningPlan(newPlan);
      setPlan(newPlan);
      addXp(15, ['scholar']);
      toast.success('Your personalized learning plan is ready! +15 XP', { id: toastId });
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }, [getWeakTopics, addXp]);
  
  const handleClearPlan = async () => {
      try {
        await apiService.clearLearningPlan();
        setPlan(null);
        toast.success("Plan cleared. Generate a new one anytime!");
      } catch (error) {
        toast.error("Failed to clear plan.");
      }
  }

  const handleDownloadCalendar = () => {
    if (!plan) return;
    const icsContent = generateICSFileContent(plan);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jee-genius-study-plan.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Calendar file downloaded!");
  };

  const handleSetReminders = () => {
    if (!plan || !notificationsEnabled) {
      toast.error("Please enable notifications in settings first.");
      return;
    }

    toast.success("Study reminders have been scheduled for this week!");

    plan.daily_plans.forEach(dayPlan => {
      const notificationTime = new Date();
      notificationTime.setDate(notificationTime.getDate() + dayPlan.day - 1);
      notificationTime.setHours(9, 0, 0, 0);

      const delay = notificationTime.getTime() - Date.now();
      
      if (delay > 0) {
        setTimeout(() => {
          new Notification(`Study Reminder: ${dayPlan.topic}`, {
            body: `Today's task: ${dayPlan.task}`,
            icon: '/favicon.svg'
          });
        }, delay);
      }
    });
  };

  if (isLoading && !plan) {
    return <Spinner message="Building your personalized study schedule..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-page-enter">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Personalized Learning Plan</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Let AI analyze your mistakes and generate a focused 7-day plan to turn your weaknesses into strengths.</p>

      {!plan ? (
        <Card className="text-center py-16">
          <PencilIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">No Learning Plan Found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {mistakes.length > 0 
                ? "Click the button below to generate a new plan based on your recent performance."
                : "Your Mistake Journal is empty. Take a test in the 'Test Generator' so we can identify your weak areas and create a plan for you."
            }
          </p>
           <div className="mt-6">
             <Button onClick={handleGeneratePlan} isLoading={isLoading} disabled={mistakes.length === 0} leftIcon={<SparklesIcon className="w-5 h-5 mr-2"/>}>
               Generate My Plan
             </Button>
           </div>
        </Card>
      ) : (
        <div>
          <Card className="mb-6 bg-cyan-100 dark:bg-cyan-900/30 border border-cyan-300 dark:border-cyan-700/50">
            <h2 className="text-xl font-bold text-cyan-800 dark:text-cyan-400">This Week's Goal</h2>
            <p className="text-gray-700 dark:text-gray-300 mt-2">{plan.week_goal}</p>
          </Card>
          <div className="space-y-4">
            {plan.daily_plans.map(dayPlan => (
              <Card key={dayPlan.day}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Day {dayPlan.day}: <span className="text-cyan-600 dark:text-cyan-400">{dayPlan.topic}</span></h3>
                <p className="text-md font-medium text-gray-700 dark:text-gray-300 mt-2"><strong>Task:</strong> {dayPlan.task}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{dayPlan.details}</p>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button onClick={handleDownloadCalendar} variant="primary" leftIcon={<CalendarDaysIcon className="w-5 h-5 mr-2" />}>
                Download Calendar (.ics)
            </Button>
            {notificationsEnabled && (
                <Button onClick={handleSetReminders} variant="secondary">Set Reminders for this Plan</Button>
            )}
            <Button onClick={handleClearPlan} variant="secondary">
              Clear Plan & Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPlanPage;
