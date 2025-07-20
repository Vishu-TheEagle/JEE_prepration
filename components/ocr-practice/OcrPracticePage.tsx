import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';

import { generatePracticeFromImage } from '../../services/geminiService';
import { TestQuestion } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import { CameraIcon, SparklesIcon } from '../icons/HeroIcons';

// Reusing the quiz rendering logic from TestGeneratorPage by copying it here.
// In a larger app, this would be a shared component.
const renderQuizQuestion = (
    q: TestQuestion, 
    index: number, 
    userAnswers: {[key: string]: string}, 
    submitted: boolean,
    handleAnswerChange: (id: string, answer: string) => void
) => {
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
                                name={`question-${q.id}`} 
                                value={option} 
                                className="h-4 w-4 shrink-0 text-cyan-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-cyan-500 cursor-pointer" 
                                onChange={() => handleAnswerChange(q.id, option)}
                                checked={userAnswers[q.id] === option}
                                disabled={submitted}
                            />
                            <span className="ml-3 text-gray-800 dark:text-gray-300">{option}</span>
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
};


const OcrPracticePage: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [generatedTest, setGeneratedTest] = useState<TestQuestion[] | null>(null);
    const [userAnswers, setUserAnswers] = useState<{[questionId: string]: string}>({});
    const [submitted, setSubmitted] = useState(false);
    
    const resetState = () => {
        setImageFile(null);
        setImagePreview(null);
        setGeneratedTest(null);
        setUserAnswers({});
        setSubmitted(false);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if(file.size > 4 * 1024 * 1024) { // 4MB limit
                toast.error("Image size should be less than 4MB.");
                return;
            }
            resetState();
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleGeneratePractice = async () => {
        if (!imageFile) {
            toast.error("Please upload an image first.");
            return;
        }

        setIsLoading(true);
        setGeneratedTest(null);
        const toastId = toast.loading('AI is reading your image and creating a test...');

        try {
            const imageData = await getBase64(imageFile);
            const questions = await generatePracticeFromImage(imageData);
            
            if (questions.length === 0) {
                toast.error("The AI could not find any questions in the image. Try a different one.", { id: toastId });
                return;
            }

            setGeneratedTest(questions);
            toast.success('Your practice test is ready!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (questionId: string, answer: string) => {
        setUserAnswers(prev => ({...prev, [questionId]: answer}));
    };

    const handleSubmitTest = () => {
        if (Object.keys(userAnswers).length !== generatedTest?.length) {
          toast.error("Please answer all questions before submitting.");
          return;
        }
        setSubmitted(true);
        toast.success(`Test submitted! Check your answers.`);
    };

    const renderInitialView = () => (
        <Card>
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-cyan-500 hover:bg-gray-800 transition-colors text-center"
            >
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                />
                {imagePreview ? (
                    <img src={imagePreview} alt="Question page preview" className="max-h-80 mx-auto rounded-lg" />
                ) : (
                    <div className="flex flex-col items-center text-gray-400">
                        <CameraIcon className="w-16 h-16"/>
                        <p className="mt-4 text-lg font-semibold">Click to upload an image</p>
                        <p className="text-sm text-gray-500">Upload a photo of a textbook page or your notes.</p>
                    </div>
                )}
            </div>
            {imagePreview && (
                <div className="flex justify-end p-4 mt-4 border-t border-gray-700">
                    <Button onClick={handleGeneratePractice} isLoading={isLoading} disabled={isLoading} leftIcon={<SparklesIcon className="w-5 h-5 mr-2"/>}>
                        Generate Practice Test
                    </Button>
                </div>
            )}
        </Card>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-page-enter">
            <h1 className="text-3xl font-bold text-white mb-2">Practice from Image (OCR)</h1>
            <p className="text-gray-400 mb-6">Turn any book page, screenshot, or handwritten note into an interactive quiz instantly.</p>

            {!generatedTest ? renderInitialView() : (
                 <div className="animate-page-enter">
                    <div className="mb-6">
                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Practice Test from Image</h2>
                            <p className="text-gray-600 dark:text-gray-400">Questions extracted by AI. Good luck!</p>
                        </Card>
                    </div>
                    
                    <div>
                        {generatedTest.map((q, i) => renderQuizQuestion(q, i, userAnswers, submitted, handleAnswerChange))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4 justify-center">
                        {!submitted ? (
                            <Button onClick={handleSubmitTest} variant="primary" size="lg">Submit Test</Button>
                        ) : (
                            <Button onClick={resetState} variant="primary">Practice with a New Image</Button>
                        )}
                    </div>
                </div>
            )}

            {isLoading && <Spinner message="AI is analyzing your image..." />}
        </div>
    );
};

export default OcrPracticePage;
