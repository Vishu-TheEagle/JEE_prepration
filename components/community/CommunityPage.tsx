import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommunity } from '../../hooks/useCommunity';
import { useAuth } from '../../hooks/useAuth';
import Card from '../common/Card';
import Button from '../common/Button';
import { ChatBubbleLeftRightIcon } from '../icons/HeroIcons';

const CommunityPage: React.FC = () => {
    const { questions, addQuestion } = useCommunity();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    
    const sortedQuestions = [...questions].sort((a, b) => b.upvotes - a.upvotes);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) return;
        addQuestion({
            author: user?.name || 'Anonymous',
            title,
            body,
            tags: [], // Simplified for now
        });
        setTitle('');
        setBody('');
        setIsFormVisible(false);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-page-enter">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Community Q&A</h1>
                    <p className="text-gray-400 mt-1">Ask questions, share knowledge, and learn together.</p>
                </div>
                <Button onClick={() => setIsFormVisible(!isFormVisible)}>
                    {isFormVisible ? 'Cancel' : 'Ask a Question'}
                </Button>
            </div>

            {isFormVisible && (
                <Card className="mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Question Title"
                            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            required
                        />
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Describe your question in detail..."
                            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition min-h-[120px]"
                            rows={5}
                            required
                        />
                        <div className="flex justify-end">
                            <Button type="submit">Post Question</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="space-y-4">
                {sortedQuestions.map(q => (
                    <Link to={`/community/${q.id}`} key={q.id}>
                        <Card className="hover:bg-gray-700/70 hover:border-cyan-500 border border-transparent transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">{q.title}</h2>
                                    <p className="text-sm text-gray-400">by {q.author} &bull; {q.answers.length} answers</p>
                                </div>
                                <div className="text-center ml-4">
                                    <p className="font-bold text-lg text-cyan-400">{q.upvotes}</p>
                                    <p className="text-xs text-gray-500">votes</p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CommunityPage;
