import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { generateTestQuestions } from '../../services/geminiService';
import { useMistakes } from '../../hooks/useMistakes';
import { useGamification } from '../../hooks/useGamification';
import { useSettings } from '../../hooks/useSettings';
import { ExamQuestion } from '../../types';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Card from '../common/Card';
import QuestionPalette from './QuestionPalette';
import { ChevronLeftIcon, ChevronRightIcon, FlagIcon, ClockIcon, AcademicCapIcon } from '../icons/HeroIcons';
import { EXAM_CONFIGS } from '../../constants';


const ExamSimulationPage: React.FC = () => {
  const { examMode } = useSettings();
  const examConfig = EXAM_CONFIGS[examMode];
  const { subjects, totalQuestions, duration } = examConfig;

  const [examState, setExamState] = useState<'idle' | 'loading' | 'running' | 'finished'>('idle');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQues, setCurrentQues] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const { addMistake } = useMistakes();
  const { addXp } = useGamification();

  const startExam = useCallback(async () => {
    setExamState('loading');
    const toastId = toast.loading('Setting up your exam environment...');
    try {
      const generatedQuestions = await generateTestQuestions({
        count: totalQuestions,
        topics: Object.keys(subjects),
        difficulty: 'Hard',
        examMode: examMode,
      });

      setQuestions(generatedQuestions.map(q => ({ ...q, status: 'unvisited', userAnswer: undefined })));
      setCurrentQues(0);
      setTimeLeft(duration);
      setExamState('running');
      toast.success('Good luck!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to start the exam. Please try again.', { id: toastId });
      setExamState('idle');
    }
  }, [examMode, totalQuestions, duration, subjects]);

  const finishExam = useCallback(() => {
    let correct = 0;
    questions.forEach(q => {
      if (q.userAnswer === q.answer) {
        correct++;
      } else if (q.userAnswer) { // Only log answered questions as mistakes
        addMistake({
          question: q,
          userAnswer: q.userAnswer,
          timestamp: Date.now()
        });
      }
    });
    setQuestions(prev => prev.map(q => ({ ...q, score: correct })));
    setExamState('finished');
    addXp(50, ['marathoner']);
    toast.success("Exam Finished! +50XP & Marathoner Badge!", { duration: 5000 });
  }, [questions, addMistake, addXp]);
  
  useEffect(() => {
    if (examState !== 'running') return;
    
    if (timeLeft <= 0) {
      finishExam();
      toast.error("Time's up! Your exam has been submitted automatically.");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, timeLeft, finishExam]);

  const updateQuestionState = (index: number, updates: Partial<ExamQuestion>) => {
    setQuestions(prev => {
        const newQuestions = [...prev];
        newQuestions[index] = { ...newQuestions[index], ...updates };
        return newQuestions;
    });
  };

  const handleAnswer = (answer: string) => {
    updateQuestionState(currentQues, { userAnswer: answer, status: 'answered' });
  };
  
  const handleMarkForReview = () => {
    const currentStatus = questions[currentQues].status;
    const newStatus = currentStatus === 'review' ? (questions[currentQues].userAnswer ? 'answered' : 'unanswered') : 'review';
    updateQuestionState(currentQues, { status: newStatus });
  };
  
  const navigateQuestion = (index: number) => {
    if(index >= 0 && index < questions.length) {
       // Mark current question as 'unanswered' if it was 'unvisited'
        if (questions[currentQues].status === 'unvisited') {
            updateQuestionState(currentQues, { status: 'unanswered' });
        }
        setCurrentQues(index);
    }
  }
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const score = useMemo(() => {
    if (examState !== 'finished') return 0;
    return questions.reduce((acc, q) => acc + (q.userAnswer === q.answer ? 1 : 0), 0);
  }, [examState, questions]);

  if (examState === 'idle') {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-full animate-page-enter">
        <ClockIcon className="w-24 h-24 text-cyan-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">{examMode} Full Exam Simulation</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-lg">Experience the real exam pressure. A full-length test with a timer. Once you start, you cannot pause.</p>
        <Button size="lg" onClick={startExam} className="mt-8">Start Exam Simulation</Button>
      </div>
    );
  }

  if (examState === 'loading') {
    return <Spinner message="Preparing your exam questions..." />;
  }
  
  if (examState === 'finished') {
    return (
        <div className="p-8 text-center flex flex-col items-center justify-center h-full animate-page-enter">
            <AcademicCapIcon className="w-24 h-24 text-cyan-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Exam Finished!</h1>
            <p className="text-gray-600 dark:text-gray-300 text-xl mt-2">Your Score:</p>
            <p className="text-6xl font-bold text-cyan-500 dark:text-cyan-400 my-4">{score} / {totalQuestions}</p>
            <p className="text-gray-600 dark:text-gray-400">Incorrect answers have been saved to your Mistake Journal for review.</p>
            <Button size="lg" onClick={() => setExamState('idle')} className="mt-8">Back to Main Menu</Button>
        </div>
    )
  }

  const currentQuestionData = questions[currentQues];

  return (
    <div className="flex flex-col lg:flex-row h-full max-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 p-4 sm:p-6 flex flex-col overflow-y-auto">
             <div className="flex-shrink-0 mb-4">
                <Card className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Question {currentQues + 1} of {totalQuestions}</h2>
                    <div className="flex items-center text-red-500 font-bold text-lg">
                        <ClockIcon className="w-6 h-6 mr-2"/>
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                </Card>
             </div>

             <Card className="flex-1">
                <p className="text-lg text-gray-800 dark:text-gray-200 mb-6">{currentQuestionData.question}</p>
                <div className="space-y-3">
                    {currentQuestionData.options.map((option, i) => (
                        <label key={i} className={`flex items-center p-3 rounded-md transition-colors cursor-pointer border-2 ${currentQuestionData.userAnswer === option ? 'bg-cyan-100 dark:bg-cyan-900/50 border-cyan-600' : 'bg-gray-100 dark:bg-gray-800 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <input
                                type="radio"
                                name={`question-${currentQuestionData.id}`}
                                value={option}
                                className="h-4 w-4 shrink-0 text-cyan-600 bg-gray-200 dark:bg-gray-900 border-gray-400 dark:border-gray-700 focus:ring-cyan-500 cursor-pointer"
                                onChange={() => handleAnswer(option)}
                                checked={currentQuestionData.userAnswer === option}
                            />
                            <span className="ml-3 text-gray-800 dark:text-gray-300">{option}</span>
                        </label>
                    ))}
                </div>
             </Card>
             <div className="flex-shrink-0 mt-4 flex justify-between items-center">
                <Button onClick={() => navigateQuestion(currentQues - 1)} disabled={currentQues === 0} leftIcon={<ChevronLeftIcon className="w-5 h-5 mr-2"/>}>Previous</Button>
                <Button onClick={handleMarkForReview} variant="secondary" leftIcon={<FlagIcon className="w-5 h-5 mr-2"/>}>
                   {currentQuestionData.status === 'review' ? 'Unmark' : 'Mark for Review'}
                </Button>
                <Button onClick={() => navigateQuestion(currentQues + 1)} disabled={currentQues === questions.length - 1} rightIcon={<ChevronRightIcon className="w-5 h-5 ml-2"/>}>Next</Button>
             </div>
        </div>

        <div className="w-full lg:w-72 flex-shrink-0 bg-gray-100 dark:bg-gray-800/50 p-4 overflow-y-auto border-l border-gray-200 dark:border-gray-700">
           <QuestionPalette
                questions={questions}
                currentQuestionIndex={currentQues}
                onSelectQuestion={navigateQuestion}
           />
           <Button onClick={() => { if(window.confirm('Are you sure you want to submit the exam?')) finishExam() }} size="lg" className="w-full mt-6">Submit Exam</Button>
        </div>
    </div>
  );
};

export default ExamSimulationPage;