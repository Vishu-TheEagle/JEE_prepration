import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';
import { ChatMessage } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { PaperAirplaneIcon, ClipboardIcon } from '../icons/HeroIcons';
import Whiteboard from './Whiteboard';

const mockUsers = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh'];
// In a real app, this would be your backend server URL
const SOCKET_SERVER_URL = "http://localhost:5000";

const CollaborationPage: React.FC = () => {
    const { user } = useAuth();
    const { roomId } = useParams<{ roomId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const passcode = location.state?.passcode;

    const socketRef = useRef<Socket | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!passcode || !roomId) {
            toast.error("Invalid room access.");
            navigate('/collaboration');
            return;
        }

        // Connect to the Socket.IO server
        socketRef.current = io(SOCKET_SERVER_URL);
        const socket = socketRef.current;

        // Join the specific room
        socket.emit('join-room', roomId);

        // Initial welcome message
        const welcomeMessage: ChatMessage = {
            sender: 'bot',
            name: 'StudyBot',
            text: `Welcome to Study Room #${roomId}, ${user?.name}!`,
            timestamp: Date.now()
        };
        setMessages([welcomeMessage]);

        // Listen for incoming messages
        socket.on('chat-message', (message: ChatMessage) => {
            setMessages(prev => [...prev, message]);
        });
        
        // Cleanup on component unmount
        return () => {
            socket.disconnect();
        };

    }, [user, roomId, passcode, navigate]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current) return;

        const userMessage: ChatMessage = {
            sender: 'user',
            name: user?.name || 'Me',
            text: newMessage,
            timestamp: Date.now()
        };
        
        // Emit message to the server
        socketRef.current.emit('chat-message', { roomId, message: userMessage });
        setNewMessage('');
    };
    
    const handleInvite = () => {
        const inviteText = `Join my study session!\nRoom ID: ${roomId}\nPasscode: ${passcode}`;
        navigator.clipboard.writeText(inviteText)
            .then(() => toast.success("Invite details copied to clipboard!"))
            .catch(() => toast.error("Could not copy invite details."));
    }

    return (
        <div className="flex flex-col lg:flex-row h-full max-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 animate-page-enter">
            <div className="w-full lg:w-96 flex-shrink-0 bg-gray-100 dark:bg-gray-800/50 p-4 flex flex-col border-r border-gray-200 dark:border-gray-700">
                 <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Room #{roomId}</h3>
                    <div className="space-y-2">
                        {mockUsers.map(name => (
                            <div key={name} className="flex items-center">
                                <span className="h-2 w-2 bg-green-500 rounded-full mr-3"></span>
                                <span className="text-gray-600 dark:text-gray-300">{name}</span>
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleInvite} variant="secondary" className="w-full mt-4" leftIcon={<ClipboardIcon className="w-4 h-4 mr-2"/>}>
                        Copy Invite Details
                    </Button>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Group Chat</h3>
                    <Card className="flex-1 overflow-y-auto mb-4 p-2">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-2.5 ${msg.name === user?.name ? 'justify-end' : ''}`}>
                                    {msg.name !== user?.name && <div className="w-8 h-8 rounded-full bg-cyan-700 dark:bg-cyan-800 flex items-center justify-center shrink-0 font-bold text-sm text-white">{msg.name.substring(0, 2)}</div>}
                                    <div className={`flex flex-col w-full max-w-[320px] leading-1.5 p-3 rounded-xl ${msg.name === user?.name ? 'bg-cyan-600 rounded-br-none text-white' : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'}`}>
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{msg.name}</span>
                                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-sm font-normal py-2.5 text-gray-800 dark:text-white">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 transition"
                        />
                        <Button type="submit" size="lg" className="p-3"><PaperAirplaneIcon className="w-6 h-6"/></Button>
                    </form>
                </div>
            </div>
            <div className="flex-1 p-4 sm:p-6 flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Collaborative Whiteboard</h2>
                <Whiteboard socket={socketRef.current} roomId={roomId} />
            </div>
        </div>
    );
};

export default CollaborationPage;