

import React, { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { solveDoubt } from '../../services/geminiService';
import { DoubtRequest, DoubtType } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import DoubtResponse from './DoubtResponse';
import { DocumentTextIcon, CameraIcon, MicrophoneIcon } from '../icons/HeroIcons';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useGamification } from '../../hooks/useGamification';


const DoubtSolverPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<DoubtType>(DoubtType.TEXT);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addXp } = useGamification();

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    supported: speechSupported,
  } = useSpeechRecognition({
    onEnd: () => {
        // Automatically submit when user stops talking
        if (transcript) {
            handleSubmit(transcript);
        }
    }
  });

  useEffect(() => {
    // Sync transcript with question state for audio tab
    if (activeTab === DoubtType.AUDIO) {
        setQuestion(transcript);
    }
  }, [transcript, activeTab]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(file.size > 4 * 1024 * 1024) { // 4MB limit
        toast.error("Image size should be less than 4MB.");
        return;
      }
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
  }

  const handleSubmit = useCallback(async (audioTranscript?: string) => {
    let request: DoubtRequest | null = null;
    let finalQuestion = audioTranscript || question;

    if (activeTab === DoubtType.TEXT && !finalQuestion.trim()) {
      toast.error('Please enter a question.');
      return;
    }
    if (activeTab === DoubtType.IMAGE && !imageFile) {
        toast.error('Please upload an image.');
        return;
    }
     if (activeTab === DoubtType.AUDIO && !finalQuestion.trim()) {
      toast.error('Please speak a question.');
      return;
    }

    setIsLoading(true);
    setSolution(null);
    const toastId = toast.loading('Your personal AI tutor is thinking...');

    try {
        if(activeTab === DoubtType.IMAGE && imageFile){
            const imageData = await getBase64(imageFile);
            request = { type: DoubtType.IMAGE, content: finalQuestion, imageData };
        } else { // Handles TEXT and AUDIO
            request = { type: DoubtType.TEXT, content: finalQuestion };
        }
        
        if(request){
            const result = await solveDoubt(request);
            setSolution(result);
            addXp(10, ['first_doubt']);
            toast.success('Solution found! +10 XP', { id: toastId });
        }
    } catch (error) {
      console.error(error);
      toast.error('An unexpected error occurred.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }, [question, imageFile, activeTab, addXp]);
  
  const TabButton: React.FC<{ type: DoubtType; label: string; icon: React.ReactNode, disabled?: boolean }> = ({ type, label, icon, disabled }) => (
    <button
      onClick={() => {
        if (disabled) return;
        setActiveTab(type);
        setSolution(null);
        setQuestion('');
      }}
      disabled={disabled}
      className={`flex-1 flex items-center justify-center p-3 text-sm font-medium border-b-2 transition-colors disabled:text-gray-600 disabled:cursor-not-allowed ${activeTab === type ? 'text-cyan-400 border-cyan-400' : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'}`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-page-enter">
      <h1 className="text-3xl font-bold text-white mb-2">AI Doubt Solver</h1>
      <p className="text-gray-400 mb-6">Stuck on a problem? Get a step-by-step solution from your AI Tutor instantly.</p>

      <Card>
        <div className="flex border-b border-gray-700">
            <TabButton type={DoubtType.TEXT} label="Type Question" icon={<DocumentTextIcon className="w-5 h-5"/>}/>
            <TabButton type={DoubtType.IMAGE} label="Upload Image" icon={<CameraIcon className="w-5 h-5"/>}/>
            <TabButton type={DoubtType.AUDIO} label="Ask Audio" icon={<MicrophoneIcon className="w-5 h-5"/>} disabled={!speechSupported}/>
        </div>
        <div className="p-4">
        {activeTab === DoubtType.TEXT && (
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your Physics, Chemistry, or Math question here..."
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 min-h-[120px]"
            rows={5}
            disabled={isLoading}
          />
        )}
        {activeTab === DoubtType.IMAGE && (
          <div className="text-center">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              disabled={isLoading}
            />
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-cyan-500 hover:bg-gray-800 transition-colors"
            >
                {imagePreview ? (
                    <img src={imagePreview} alt="Question preview" className="max-h-60 mx-auto rounded-lg" />
                ) : (
                    <div className="flex flex-col items-center text-gray-400">
                        <CameraIcon className="w-12 h-12"/>
                        <p className="mt-2">Click to upload an image of your question</p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 4MB</p>
                    </div>
                )}
            </div>
            {imagePreview && (
                 <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Optional: Add any specific question or context about the image..."
                    className="w-full p-3 mt-4 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                    rows={2}
                    disabled={isLoading}
                />
            )}
          </div>
        )}
        {activeTab === DoubtType.AUDIO && (
            <div className="flex flex-col items-center justify-center py-10">
                <button
                    onClick={isListening ? stopListening : startListening}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                >
                    <MicrophoneIcon className="w-12 h-12 text-white" />
                    {isListening && <span className="absolute inset-0 rounded-full bg-red-500 animate-ping"></span>}
                </button>
                <p className="mt-4 text-lg font-medium text-white">{isListening ? 'Listening...' : 'Tap to speak'}</p>
                <p className="mt-2 text-gray-400 min-h-[2.5rem] p-2">{transcript || 'Your question will appear here...'}</p>
            </div>
        )}
        </div>
        {activeTab !== DoubtType.AUDIO && (
          <div className="flex justify-end p-4 border-t border-gray-700">
              <Button onClick={() => handleSubmit()} isLoading={isLoading} disabled={isLoading}>
                  Solve Doubt
              </Button>
          </div>
        )}
      </Card>

      {isLoading && <Spinner message="Generating your step-by-step solution..." />}
      {solution && <DoubtResponse solution={solution} />}
    </div>
  );
};

export default DoubtSolverPage;