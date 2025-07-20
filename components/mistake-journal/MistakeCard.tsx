import React, { useState } from 'react';
import { Mistake, DoubtType } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { CheckCircleIcon, XCircleIcon, LightBulbIcon } from '../icons/HeroIcons';
import { solveDoubt } from '../../services/geminiService';
import DoubtResponse from '../doubt-solver/DoubtResponse';

interface MistakeCardProps {
  mistake: Mistake;
}

const MistakeCard: React.FC<MistakeCardProps> = ({ mistake }) => {
  const { question, userAnswer, timestamp } = mistake;
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  const handleGetExplanation = async () => {
    setIsLoadingExplanation(true);
    setExplanation(null);
    try {
        const result = await solveDoubt({
            type: DoubtType.TEXT,
            content: `Explain why the correct answer to the following question is "${question.answer}". My answer was "${userAnswer}".\n\nQuestion: ${question.question}\nOptions: ${question.options.join(', ')}`
        });
        setExplanation(result);
    } catch (error) {
        console.error("Failed to get AI explanation", error);
        setExplanation("Sorry, I was unable to generate an explanation at this time.");
    } finally {
        setIsLoadingExplanation(false);
    }
  }

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-cyan-400 font-medium bg-cyan-900/50 px-2 py-1 rounded-full inline-block mb-2">{question.topic}</p>
                <p className="font-semibold text-gray-200">{question.question}</p>
            </div>
            <p className="text-xs text-gray-500 flex-shrink-0 ml-4">{new Date(timestamp).toLocaleString()}</p>
        </div>

        <div className="mt-4 space-y-2">
          {question.options.map((option, index) => {
            const isUserAnswer = option === userAnswer;
            const isCorrectAnswer = option === question.answer;
            
            let classes = "flex items-center p-3 rounded-md text-gray-300 ";
            if (isUserAnswer && !isCorrectAnswer) {
              classes += "bg-red-500/20";
            } else if (isCorrectAnswer) {
              classes += "bg-green-500/20";
            } else {
                classes += "bg-gray-700/50";
            }

            return (
              <div key={index} className={classes}>
                {isUserAnswer && !isCorrectAnswer && <XCircleIcon className="w-5 h-5 mr-3 text-red-400 shrink-0" />}
                {isCorrectAnswer && <CheckCircleIcon className="w-5 h-5 mr-3 text-green-400 shrink-0" />}
                {!isUserAnswer && !isCorrectAnswer && <div className="w-5 h-5 mr-3 shrink-0" />}
                <span>{option}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
            <Button onClick={handleGetExplanation} isLoading={isLoadingExplanation} variant="secondary" leftIcon={<LightBulbIcon className="w-5 h-5 mr-2" />}>
                Get AI Explanation
            </Button>
        </div>
        {explanation && <div className="mt-4"><DoubtResponse solution={explanation} title="AI Explanation" /></div>}
      </div>
    </Card>
  );
};

export default MistakeCard;