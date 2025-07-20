import React, { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

import { generateTestQuestions } from '../../services/geminiService';
import { TestQuestion, ExamMode } from '../../types';
import { useMistakes } from '../../hooks/useMistakes';
import { useGamification } from '../../hooks/useGamification';
import { useSettings } from '../../hooks/useSettings';
import Button from '../common/Button';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import { CheckCircleIcon, XCircleIcon } from '../icons/HeroIcons';
import { EXAM_CONFIGS } from '../../constants';


type Difficulty = 'Easy' | 'Medium' | 'Hard';

const TestGeneratorPage: React.FC = () => {
  const { examMode } = useSettings();
  const examConfig = EXAM_CONFIGS[examMode];

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [generatedTest, setGeneratedTest] = useState<TestQuestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [userAnswers, setUserAnswers] = useState<{[questionId: string]: string}>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { addMistake } = useMistakes();
  const { addXp } = useGamification();

  const handleTopicChange = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };
  
  const resetTestState = () => {
    setGeneratedTest(null);
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
    setSelectedTopics([]);
  };

  const handleGenerateTest = useCallback(async () => {
    if (selectedTopics.length === 0) {
      toast.error('Please select at least one topic.');
      return;
    }
    setIsLoading(true);
    resetTestState(); 
    setGeneratedTest(null);
    const toastId = toast.loading('Generating your custom test...');

    try {
      const questions = await generateTestQuestions({
        count: questionCount,
        topics: selectedTopics,
        difficulty,
        examMode,
      });
      setGeneratedTest(questions);
      addXp(5); // Award XP for generating a test
      toast.success('Your test is ready!', { id: toastId });
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }, [questionCount, selectedTopics, difficulty, addXp, examMode]);
  
  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({...prev, [questionId]: answer}));
  };

  const handleSubmitTest = () => {
    if (Object.keys(userAnswers).length !== generatedTest?.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    
    let correctAnswers = 0;
    generatedTest?.forEach(q => {
      if (userAnswers[q.id] === q.answer) {
        correctAnswers++;
      } else {
        addMistake({
          question: q,
          userAnswer: userAnswers[q.id],
          timestamp: Date.now()
        });
      }
    });

    const calculatedScore = (correctAnswers / (generatedTest?.length || 1)) * 100;
    setScore(calculatedScore);
    setSubmitted(true);
    
    addXp(25); // Base XP for completing a test
    if (calculatedScore >= 90) {
        addXp(25, ['test_ace']); // Bonus for high score + badge
        toast.success(`Amazing! You scored ${correctAnswers}/${generatedTest?.length}. +50 XP!`, { duration: 4000 });
    } else {
        toast.success(`Test submitted! You scored ${correctAnswers}/${generatedTest?.length}. +25 XP!`);
    }
  };
  
  const renderQuizQuestion = (q: TestQuestion, index: number) => {
    const isCorrect = userAnswers[q.id] === q.answer;
    const selectedAnswer = userAnswers[q.id];

    return (
        <Card key={q.id} className={`mb-4 bg-gray-800/80 transition-all ${submitted ? (isCorrect ? 'border-green-500/50' : 'border-red-500/50') : 'border-transparent'} border`}>
            <p className="font-semibold text-gray-900 dark:text-gray-200 mb-4">{index + 1}. {q.question}</p>
            <div className="space-y-2">
                {q.options.map((option, i) => {
                    const isUserChoice = selectedAnswer === option;
                    const isCorrectAnswer = q.answer === option;
                    let optionClass = "bg-gray-200 dark:bg-gray-700/50";
                    if (submitted) {
                        if (isCorrectAnswer) optionClass = "bg-green-500/30 text-green-300";
                        if (isUserChoice && !isCorrectAnswer) optionClass = "bg-red-500/30 text-red-300";
                    }
                    
                    return (
                        <label key={i} className={`flex items-center p-3 rounded-md transition-colors cursor-pointer ${optionClass} ${!submitted && 'hover:bg-gray-300 dark:hover:bg-gray-700'}`}>
                            <input 
                                type="radio" 
                                id={`q${index}-o${i}`} 
                                name={`question-${q.id}`} 
                                value={option} 
                                className="h-4 w-4 shrink-0 text-cyan-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-cyan-500 cursor-pointer" 
                                onChange={() => handleAnswerChange(q.id, option)}
                                checked={userAnswers[q.id] === option}
                                disabled={submitted}
                            />
                            <span className="ml-3 text-gray-800 dark:text-gray-300">{option}</span>
                             {submitted && isCorrectAnswer && <CheckCircleIcon className="w-5 h-5 ml-auto text-green-400" />}
                             {submitted && isUserChoice && !isCorrectAnswer && <XCircleIcon className="w-5 h-5 ml-auto text-red-400" />}
                        </label>
                    )
                })}
            </div>
            {submitted && !isCorrect && (
                <div className="mt-4 p-3 bg-green-900/50 rounded-md text-sm">
                    <span className="font-semibold text-green-400">Correct Answer: </span>
                    <span className="text-green-300">{q.answer}</span>
                </div>
            )}
        </Card>
    );
  }

  const renderConfigView = () => (
    <Card className="animate-page-enter">
      <div className="p-4 mb-4 bg-cyan-900/30 border-l-4 border-cyan-500">
        <h3 className="font-bold text-cyan-300">Exam Mode: {examMode}</h3>
        <p className="text-sm text-cyan-400">Question topics and patterns are adjusted for the selected exam. Change this in Settings.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">1. Select Topics</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {Object.entries(examConfig.subjects).map(([subject, topics]) => (
              <div key={subject}>
                <h4 className="font-medium text-cyan-500 dark:text-cyan-400 mb-2">{subject}</h4>
                <div className="space-y-2">
                  {topics.map(topic => (
                    <label key={topic} className="flex items-center text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-cyan-600 focus:ring-cyan-500"
                        checked={selectedTopics.includes(topic)}
                        onChange={() => handleTopicChange(topic)}
                      />
                      <span className="ml-3">{topic}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">2. Number of Questions: <span className="text-cyan-500 dark:text-cyan-400">{questionCount}</span></h3>
            <input
              type="range"
              min="5"
              max="75"
              step="5"
              value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">3. Select Difficulty</h3>
            <div className="flex space-x-2">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${difficulty === level ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <Button onClick={handleGenerateTest} isLoading={isLoading} disabled={isLoading}>
              Generate Test
          </Button>
      </div>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-page-enter">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Custom Test Generator</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Design your own mock tests. Select subjects, topics, difficulty, and number of questions to start.</p>

      {!generatedTest && !isLoading && renderConfigView()}

      {isLoading && <Spinner message="Your custom test is being generated by AI..." />}
      
      {generatedTest && (
        <div className="animate-page-enter">
           <div className="mb-6">
              <div className="bg-gray-100 dark:bg-gray-800/80 p-4 rounded-lg">
                 {!submitted ? (
                   <>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test in Progress</h2>
                    <p className="text-gray-600 dark:text-gray-400">Answer all questions and submit.</p>
                   </>
                 ) : (
                   <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Results</h2>
                    <p className="text-4xl font-bold mt-2" style={{color: score > 70 ? '#4ade80' : score > 40 ? '#facc15' : '#f87171'}}>{score.toFixed(2)}%</p>
                    <p className="text-gray-600 dark:text-gray-400">Incorrect answers have been added to your Mistake Journal.</p>
                   </div>
                 )}
              </div>
           </div>
           
           <div>
                {generatedTest.map(renderQuizQuestion)}
           </div>

           <div className="mt-6 flex flex-wrap gap-4 justify-center">
             {!submitted && (
                <Button onClick={handleSubmitTest} variant="primary" size="lg">Submit Test</Button>
             )}
             {submitted && (
                <>
                  <Button onClick={resetTestState} variant="primary">Create a New Test</Button>
                </>
             )}
            </div>
        </div>
      )}
    </div>
  );
};

export default TestGeneratorPage;