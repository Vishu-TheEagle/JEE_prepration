import React from 'react';
import toast from 'react-hot-toast';
import { useMistakes } from '../../hooks/useMistakes';
import MistakeCard from './MistakeCard';
import Card from '../common/Card';
import Button from '../common/Button';
import { BookOpenIcon, TrashIcon, ArrowDownTrayIcon } from '../icons/HeroIcons';

const MistakeJournalPage: React.FC = () => {
  const { mistakes, clearMistakes } = useMistakes();

  const handleClearJournal = () => {
    if (window.confirm('Are you sure you want to clear your entire mistake journal? This action cannot be undone.')) {
        clearMistakes();
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-page-enter">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Mistake Journal</h1>
          <p className="text-gray-400 mt-1">Review your incorrect answers and learn from them.</p>
        </div>
        {mistakes.length > 0 && (
            <div className="flex gap-2">
                <Button onClick={() => toast.success("Journal saved for offline access.")} variant="secondary" leftIcon={<ArrowDownTrayIcon className="w-5 h-5"/>}>
                    Save for Offline
                </Button>
                <Button onClick={handleClearJournal} variant="secondary" className="bg-red-900/50 text-red-300 hover:bg-red-800/50 focus:ring-red-500" leftIcon={<TrashIcon className="w-5 h-5" />}>
                    Clear Journal
                </Button>
            </div>
        )}
      </div>

      {mistakes.length === 0 ? (
        <Card className="text-center py-16">
          <BookOpenIcon className="mx-auto h-16 w-16 text-gray-500" />
          <h2 className="mt-4 text-xl font-semibold text-white">Your Journal is Empty</h2>
          <p className="mt-2 text-gray-400">
            Mistakes you make in the 'Test Generator' will automatically appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {mistakes.map((mistake, index) => (
            <MistakeCard key={`${mistake.timestamp}-${index}`} mistake={mistake} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MistakeJournalPage;