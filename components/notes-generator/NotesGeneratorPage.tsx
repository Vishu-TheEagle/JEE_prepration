import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { generateNotes } from '../../services/geminiService';
import Button from '../common/Button';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import DoubtResponse from '../doubt-solver/DoubtResponse'; // Reusing this component for markdown display
import { ArrowDownTrayIcon } from '../icons/HeroIcons';

const NotesGeneratorPage: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic.');
      return;
    }

    setIsLoading(true);
    setNotes(null);
    const toastId = toast.loading('Generating your personal study notes...');

    try {
      const result = await generateNotes(topic);
      setNotes(result);
      toast.success('Notes generated successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-page-enter">
      <h1 className="text-3xl font-bold text-white mb-2">AI Notes Generator</h1>
      <p className="text-gray-400 mb-6">Enter any topic from the JEE syllabus to get comprehensive, AI-generated study notes.</p>

      <Card>
        <div className="p-4">
          <label htmlFor="topic-input" className="block text-sm font-medium text-gray-300 mb-2">
            Topic Name
          </label>
          <input
            id="topic-input"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'Newton's Laws of Motion' or 'Conic Sections'"
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end p-4 border-t border-gray-700 gap-4">
          {notes && (
            <Button onClick={() => toast.success("Notes saved for offline access.")} variant="secondary" leftIcon={<ArrowDownTrayIcon className="w-5 h-5"/>}>
              Save for Offline
            </Button>
          )}
          <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>
            Generate Notes
          </Button>
        </div>
      </Card>

      {isLoading && <Spinner message="Your AI tutor is crafting your notes..." />}
      {notes && <DoubtResponse solution={notes} title="AI Generated Notes" />}
    </div>
  );
};

export default NotesGeneratorPage;