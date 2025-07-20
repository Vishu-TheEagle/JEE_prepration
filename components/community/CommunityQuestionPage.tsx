import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useCommunity } from '../../hooks/useCommunity';
import { useAuth } from '../../hooks/useAuth';
import Card from '../common/Card';
import Button from '../common/Button';

const ArrowUpSolidIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
  </svg>
);


const CommunityQuestionPage: React.FC = () => {
    const { questionId } = useParams<{ questionId: string }>();
    const { getQuestionById, addAnswer, upvoteQuestion, upvoteAnswer } = useCommunity();
    const { user } = useAuth();
    const [newAnswer, setNewAnswer] = useState('');

    const question = questionId ? getQuestionById(questionId) : undefined;
    
    if (!question) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-white">Question not found</h1>
                <Link to="/community" className="text-cyan-400 hover:underline mt-4 inline-block">Back to Community Q&A</Link>
            </div>
        );
    }
    
    const sortedAnswers = [...question.answers].sort((a,b) => b.upvotes - a.upvotes);

    const handleAnswerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAnswer.trim()) return;
        addAnswer(question.id, {
            author: user?.name || 'Anonymous',
            content: newAnswer
        });
        setNewAnswer('');
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-page-enter">
            <Card className="mb-6">
                <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                        <button onClick={() => upvoteQuestion(question.id)} className="p-1 text-gray-400 hover:text-cyan-400"><ArrowUpSolidIcon className="w-6 h-6"/></button>
                        <span className="text-xl font-bold text-white">{question.upvotes}</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{question.title}</h1>
                        <p className="text-sm text-gray-500">Asked by {question.author} on {new Date(question.timestamp).toLocaleDateString()}</p>
                        <div className="prose prose-invert mt-4 max-w-none prose-pre:bg-gray-900">
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.body}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            </Card>

            <h2 className="text-2xl font-bold text-white mb-4">{question.answers.length} Answers</h2>
            <div className="space-y-4 mb-8">
                {sortedAnswers.map(answer => (
                    <Card key={answer.id}>
                        <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <button onClick={() => upvoteAnswer(question.id, answer.id)} className="p-1 text-gray-400 hover:text-cyan-400"><ArrowUpSolidIcon className="w-6 h-6"/></button>
                                <span className="text-lg font-bold text-white">{answer.upvotes}</span>
                            </div>
                            <div className="flex-1">
                                <div className="prose prose-invert max-w-none prose-pre:bg-gray-900">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer.content}</ReactMarkdown>
                                </div>
                                <p className="text-xs text-gray-500 mt-4 text-right">Answered by {answer.author} on {new Date(answer.timestamp).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card>
                <h3 className="text-xl font-bold text-white mb-4">Your Answer</h3>
                <form onSubmit={handleAnswerSubmit} className="space-y-4">
                     <textarea
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        placeholder="Type your answer here. Markdown is supported."
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition min-h-[150px]"
                        rows={6}
                        required
                    />
                    <div className="flex justify-end">
                        <Button type="submit">Post Your Answer</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CommunityQuestionPage;
