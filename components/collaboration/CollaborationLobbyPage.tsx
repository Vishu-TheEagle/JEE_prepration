
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../common/Card';
import Button from '../common/Button';
import { PlusIcon, KeyIcon } from '../icons/HeroIcons';
import { useLocale } from '../../hooks/useLocale';

const CollaborationLobbyPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLocale();
    const [joinRoomId, setJoinRoomId] = useState('');
    const [joinPasscode, setJoinPasscode] = useState('');

    const handleCreateRoom = () => {
        const newRoomId = Math.random().toString(36).substring(2, 8);
        const newPasscode = Math.random().toString(10).substring(2, 8);
        
        toast.success(`Created Room #${newRoomId}`);
        navigate(`/collaboration/${newRoomId}`, { state: { passcode: newPasscode } });
    };

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinRoomId.trim() || !joinPasscode.trim()) {
            toast.error("Please enter both Room ID and Passcode.");
            return;
        }
        navigate(`/collaboration/${joinRoomId}`, { state: { passcode: joinPasscode } });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-page-enter">
            <h1 className="text-3xl font-bold text-white mb-2">{t('collaboration')}</h1>
            <p className="text-gray-400 mb-6">Create a private study room or join a friend's session.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <div className="text-center p-6">
                        <PlusIcon className="mx-auto h-16 w-16 text-cyan-400" />
                        <h2 className="mt-4 text-xl font-semibold text-white">Create a New Study Room</h2>
                        <p className="mt-2 text-gray-400">Start a new private session and invite your friends to collaborate.</p>
                        <Button onClick={handleCreateRoom} className="mt-6">
                            Create Room
                        </Button>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                         <div className="text-center">
                            <KeyIcon className="mx-auto h-16 w-16 text-cyan-400" />
                            <h2 className="mt-4 text-xl font-semibold text-white">Join an Existing Room</h2>
                            <p className="mt-2 text-gray-400">Enter the Room ID and Passcode shared by your friend.</p>
                        </div>
                        <form onSubmit={handleJoinRoom} className="mt-6 space-y-4">
                            <input
                                type="text"
                                value={joinRoomId}
                                onChange={(e) => setJoinRoomId(e.target.value)}
                                placeholder="Room ID"
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 transition"
                            />
                            <input
                                type="text"
                                value={joinPasscode}
                                onChange={(e) => setJoinPasscode(e.target.value)}
                                placeholder="Passcode"
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 transition"
                            />
                            <Button type="submit" className="w-full">
                                Join Room
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CollaborationLobbyPage;
