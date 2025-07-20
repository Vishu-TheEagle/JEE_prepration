
import React from 'react';
import { ExamQuestion } from '../../types';

interface QuestionPaletteProps {
  questions: ExamQuestion[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
}

const QuestionPalette: React.FC<QuestionPaletteProps> = ({ questions, currentQuestionIndex, onSelectQuestion }) => {
  const getStatusColor = (status: ExamQuestion['status'], isCurrent: boolean): string => {
    if (isCurrent) return 'bg-yellow-500 text-black';
    switch (status) {
      case 'answered':
        return 'bg-green-600 text-white';
      case 'unanswered':
        return 'bg-red-600 text-white';
      case 'review':
        return 'bg-purple-600 text-white';
      case 'unvisited':
      default:
        return 'bg-gray-700 text-gray-300 hover:bg-gray-600';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-4">Question Palette</h3>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => onSelectQuestion(index)}
            className={`flex items-center justify-center w-10 h-10 rounded font-bold transition-transform transform hover:scale-110 ${getStatusColor(q.status, index === currentQuestionIndex)}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-2 text-sm">
        <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-green-600 mr-2"></div> Answered</div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-red-600 mr-2"></div> Not Answered</div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-purple-600 mr-2"></div> Marked for Review</div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-gray-700 mr-2"></div> Not Visited</div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-yellow-500 mr-2"></div> Current</div>
      </div>
    </div>
  );
};

export default QuestionPalette;
