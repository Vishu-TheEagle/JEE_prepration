import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import Card from '../common/Card';
import Button from '../common/Button';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '../icons/HeroIcons';

interface DoubtResponseProps {
  solution: string;
  title?: string;
}

const DoubtResponse: React.FC<DoubtResponseProps> = ({ solution, title = "AI Generated Solution" }) => {
  const { isSpeaking, speak, cancel, supported } = useSpeechSynthesis();

  const handleReadAloud = () => {
    if (isSpeaking) {
      cancel();
    } else {
      speak(solution);
    }
  };

  return (
    <Card className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-cyan-400">{title}</h2>
        {supported && (
          <Button onClick={handleReadAloud} variant="secondary" size="sm" leftIcon={isSpeaking ? <SpeakerXMarkIcon className="w-5 h-5"/> : <SpeakerWaveIcon className="w-5 h-5"/>}>
            {isSpeaking ? "Stop" : "Read Aloud"}
          </Button>
        )}
      </div>
      <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-pre:bg-gray-900 prose-pre:rounded-lg">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkMath]} 
          rehypePlugins={[rehypeKatex]}
        >
          {solution}
        </ReactMarkdown>
      </div>
    </Card>
  );
};

export default DoubtResponse;
