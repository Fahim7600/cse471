import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { getPetImageUrl, handleImageError } from '../../utils/imageUtils';
import { IoMale, IoFemale } from 'react-icons/io5';
import ib2Background from '../../assets/ib4.jpg';

const Chat = () => {
    const { chatId, petId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [petInfo, setPetInfo] = useState(null);
    const [chatInfo, setChatInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [typing, setTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [isNewChat, setIsNewChat] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize socket connection and get current user
    useEffect(() => {
        const initializeChat = async () => {
            try {
                setError(null);
                
                // Get current user info
                const userResponse = await fetch('http://localhost:3000/user-info', {
                    credentials: 'include'
                });
                
                if (!userResponse.ok) {
                    setError('Please log in to access chat');
                    navigate('/login');
                    return;
                }
                
                const userData = await userResponse.json();
                setCurrentUser(userData.user);

                // Check if this is a new chat (petId) or existing chat (chatId)
                if (petId) {
                    // This is a new chat - get pet info and set up for new chat
                    setIsNewChat(true);
                    
                    const petResponse = await fetch(`http://localhost:3000/pets/${petId}`, {
                        credentials: 'include'
                    });
                    
                    if (!petResponse.ok) {
                        setError('Pet not found');
                        setLoading(false);
                        return;
                    }
                    
                    const petData = await petResponse.json();
                    setPetInfo(petData);
                    setMessages([]); // No messages for new chat
                    
                    // Initialize socket for new chat
                    const newSocket = io('http://localhost:3000', {
                        withCredentials: true,
                        timeout: 10000,
                        transports: ['websocket', 'polling']
                    });

                    newSocket.on('connect', () => {
                        console.log('Connected to server for new chat');
                        // Don't join chat room yet - will join when first message is sent
                    });

                    newSocket.on('joined-chat', (response) => {
                        if (response.success) {
                            console.log('Successfully joined chat room:', response.roomId);
                        } else {
                            console.error('Failed to join chat:', response.error);
                            setError('Failed to join chat room');
                        }
                    });

                    newSocket.on('connect_error', (error) => {
                        console.error('Socket connection error:', error);
                        setError('Failed to connect to chat server');
                    });

                    newSocket.on('new-message', (message) => {
                        console.log('Received new message:', message);
                        setMessages(prev => {
                            const exists = prev.some(msg => msg._id === message._id || 
                                (msg.content === message.content && msg.sender._id === message.sender._id && 
                                 Math.abs(new Date(msg.timestamp) - new Date(message.timestamp)) < 1000));
                            return exists ? prev : [...prev, message];
                        });
                    });

                    newSocket.on('message-error', (error) => {
                        console.error('Message error:', error);
                        setError(`Message failed: ${error.error}`);
                    });

                    newSocket.on('user-typing', ({ userId, isTyping }) => {
                        if (userId !== userData.user._id) {
                            setOtherUserTyping(isTyping);
                        }
                    });

                    newSocket.on('error', (error) => {
                        console.error('Socket error:', error);
                        setError('Chat connection error');
                    });

                    newSocket.on('disconnect', () => {
                        console.log('Disconnected from server');
                    });

                    setSocket(newSocket);
                    setLoading(false);
                    
                } else if (chatId) {
                    // This is an existing chat - original logic
                    if (!chatId) {
                        setError('Invalid chat ID');
                        setLoading(false);
                        return;
                    }

                    // Get chat by chatId
                    const chatResponse = await fetch(`http://localhost:3000/api/chat/${chatId}`, {
                        credentials: 'include'
                    });
                    
                    if (!chatResponse.ok) {
                        if (chatResponse.status === 404) {
                            setError('Chat not found');
                        } else if (chatResponse.status === 403) {
                            setError('You do not have access to this chat');
                        } else {
                            setError('Failed to load chat');
                        }
                        setLoading(false);
                        return;
                    }
                    
                    const chatData = await chatResponse.json();
                    setChatInfo(chatData.chat);
                    setMessages(chatData.chat.messages || []);

                    // Get pet info from chat data
                    if (chatData.chat.petId) {
                        // Check if petId is populated with all details
                        if (typeof chatData.chat.petId === 'object' && chatData.chat.petId.name) {
                            setPetInfo(chatData.chat.petId);
                        } else {
                            // If petId is just an ID string, fetch the complete pet information
                            try {
                                const petResponse = await fetch(`http://localhost:3000/pets/${chatData.chat.petId}`, {
                                    credentials: 'include'
                                });
                                if (petResponse.ok) {
                                    const petData = await petResponse.json();
                                    setPetInfo(petData);
                                } else {
                                    // Fallback: use whatever data we have
                                    setPetInfo(chatData.chat.petId);
                                }
                            } catch (error) {
                                console.error('Error fetching pet details:', error);
                                setPetInfo(chatData.chat.petId);
                            }
                        }
                    }

                    // Initialize socket with error handling
                    const newSocket = io('http://localhost:3000', {
                        withCredentials: true,
                        timeout: 10000,
                        transports: ['websocket', 'polling']
                    });

                    newSocket.on('connect', () => {
                        console.log('Connected to server');
                        newSocket.emit('join-chat', {
                            petId: chatData.chat.petId._id,
                            userId: userData.user._id,
                            chatId: chatData.chat._id
                        });
                    });

                    newSocket.on('joined-chat', (response) => {
                        if (response.success) {
                            console.log('Successfully joined chat room:', response.roomId);
                        } else {
                            console.error('Failed to join chat:', response.error);
                            setError('Failed to join chat room');
                        }
                    });

                    newSocket.on('connect_error', (error) => {
                        console.error('Socket connection error:', error);
                        setError('Failed to connect to chat server');
                    });

                    newSocket.on('new-message', (message) => {
                        console.log('Received new message:', message);
                        setMessages(prev => {
                            // Check if message already exists to prevent duplicates
                            const exists = prev.some(msg => msg._id === message._id || 
                                (msg.content === message.content && msg.sender._id === message.sender._id && 
                                 Math.abs(new Date(msg.timestamp) - new Date(message.timestamp)) < 1000));
                            return exists ? prev : [...prev, message];
                        });
                    });

                    newSocket.on('message-error', (error) => {
                        console.error('Message error:', error);
                        setError(`Message failed: ${error.error}`);
                    });

                    newSocket.on('user-typing', ({ userId, isTyping }) => {
                        if (userId !== userData.user._id) {
                            setOtherUserTyping(isTyping);
                        }
                    });

                    newSocket.on('error', (error) => {
                        console.error('Socket error:', error);
                        setError('Chat connection error');
                    });

                    newSocket.on('disconnect', () => {
                        console.log('Disconnected from server');
                    });

                    setSocket(newSocket);
                    setLoading(false);
                } else {
                    setError('Invalid chat parameters');
                    setLoading(false);
                    return;
                }

                return () => {
                    if (socket) {
                        socket.disconnect();
                    }
                };

            } catch (error) {
                console.error('Error initializing chat:', error);
                setError('Failed to initialize chat: ' + error.message);
                setLoading(false);
            }
        };

        initializeChat();
    }, [chatId, petId, navigate]);

    // Handle typing indicator
    const handleTyping = () => {
        if (!typing && socket && petInfo) {
            setTyping(true);
            socket.emit('typing', {
                petId: petInfo._id,
                userId: currentUser?._id,
                isTyping: true
            });
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
            if (socket && petInfo) {
                socket.emit('typing', {
                    petId: petInfo._id,
                    userId: currentUser?._id,
                    isTyping: false
                });
            }
        }, 1000);
    };

    // Send message
    const sendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() || !socket || !currentUser) return;

        try {
            if (isNewChat) {
                // Create the chat when sending the first message
                const response = await fetch(`http://localhost:3000/api/chat/pet/${petId}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!response.ok) {
                    setError('Failed to create chat');
                    return;
                }

                const chatData = await response.json();
                
                // Update state to reflect this is now an existing chat
                setChatInfo(chatData.chat);
                setIsNewChat(false);
                
                // Join the chat room and wait for confirmation
                socket.emit('join-chat', {
                    petId: petInfo._id,
                    userId: currentUser._id,
                    chatId: chatData.chat._id
                });

                // Wait a moment for the socket to join the room
                await new Promise(resolve => setTimeout(resolve, 100));

                // Navigate to the existing chat URL
                navigate(`/chat/${chatData.chat._id}`, { replace: true });
                
                // Send the message
                const messageData = {
                    petId: petInfo._id,
                    senderId: currentUser._id,
                    content: newMessage.trim(),
                    chatId: chatData.chat._id
                };

                socket.emit('send-message', messageData);
                setNewMessage('');
                
            } else {
                // Existing chat - send message normally
                const messageData = {
                    petId: petInfo._id,
                    senderId: currentUser._id,
                    content: newMessage.trim(),
                    chatId: chatInfo?._id
                };

                socket.emit('send-message', messageData);
                setNewMessage('');
            }
            
            // Stop typing indicator
            setTyping(false);
            socket.emit('typing', {
                petId: petInfo._id,
                userId: currentUser._id,
                isTyping: false
            });
            
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Failed to send message');
        }
    };

    // Format timestamp
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div 
                className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${ib2Background})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="text-center relative z-10">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-xl text-white font-semibold drop-shadow-lg">Loading chat...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div 
                className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${ib2Background})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-200 max-w-md relative z-10">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Chat Error</h3>
                    <p className="text-red-500 mb-4">{error}</p>
                    <div className="space-x-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => navigate('/chats')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Back to Chats
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="fixed inset-0 flex flex-col bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url(${ib2Background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Overlay for better readability */}
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Main Chat Container */}
            <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                <div className="w-full max-w-4xl h-full max-h-[90vh]">
                    <div className="bg-white/70 backdrop-blur-sm border border-blue-200/50 rounded-3xl shadow-lg h-full flex flex-col">
                        
                        {/* Header */}
                        <div className="p-6 pb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-3xl border-b border-blue-400">
                            {petInfo && (
                                <div className="flex items-center">
                                    {/* Back Button */}
                                    <button
                                        onClick={() => navigate('/chats')}
                                        className="mr-4 p-2 text-white hover:text-blue-100 hover:bg-white/20 rounded-full transition-all duration-200 ease-in-out"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    
                                    <div className="relative mr-4">
                                        {petInfo.image ? (
                                            <img
                                                src={getPetImageUrl(petInfo.image)}
                                                alt={petInfo.name || 'Pet'}
                                                className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg"
                                                onError={handleImageError}
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full border-3 border-white shadow-lg bg-blue-100 flex items-center justify-center">
                                                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            </div>
                                        )}
                                        
                                        {/* Online Status */}
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-1">
                                            <h2 className="text-xl font-bold text-white">
                                                {petInfo.name || 'Unknown Pet'}
                                            </h2>
                                            <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                                    petInfo.gender === 'Male' ? 'bg-blue-300' : 'bg-pink-300'
                                                }`}>
                                                    {petInfo.gender === 'Male' ? (
                                                        <IoMale className="w-2.5 h-2.5 text-blue-800" />
                                                    ) : petInfo.gender === 'Female' ? (
                                                        <IoFemale className="w-2.5 h-2.5 text-pink-800" />
                                                    ) : (
                                                        <span className="text-xs font-bold">?</span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-white font-medium">
                                                    {petInfo.gender || 'Unknown'}
                                                </span>
                                            </div>
                                            {petInfo.age && (
                                                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                                    <span className="text-xs text-white font-medium">
                                                        {petInfo.age} years old
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm text-blue-100 opacity-90">
                                            <div className="flex items-center space-x-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                <span>{(petInfo.breed && petInfo.breed !== 'undefined') ? petInfo.breed : 'Unknown Breed'}</span>
                                            </div>
                                            <span>•</span>
                                            <div className="flex items-center space-x-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span>Chatting with: {
                                                    (chatInfo?.participants?.find(p => p._id !== currentUser?._id)?.name) || 
                                                    petInfo.owner?.name || 
                                                    'Unknown User'
                                                }</span>
                                            </div>
                                            {isNewChat && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-blue-200 font-medium">New Chat</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                {messages.length === 0 ? (
                    <div className="text-center text-blue-500 mt-20">
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 max-w-md mx-auto">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-blue-600">
                                {isNewChat ? 'Start a conversation' : 'No messages yet'}
                            </p>
                            <p className="text-sm text-blue-400 mt-2">
                                {isNewChat 
                                    ? `Send a message to start chatting about ${petInfo?.name}!`
                                    : `Start the conversation about ${petInfo?.name}!`
                                }
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Conversation Starter Message - Only show when there are messages */}
                        <div className="text-center py-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-500 mb-1">
                                This marks the start of the conversation
                            </p>
                            <p className="text-xs text-gray-400">
                                Chatting about {petInfo?.name || 'this pet'}
                            </p>
                        </div>

                        {/* Actual Messages */}
                        {messages.map((message, index) => {
                        const isOwnMessage = message.sender._id === currentUser?._id;
                        const otherUser = chatInfo?.participants?.find(p => p._id !== currentUser?._id);
                        return (
                            <div
                                key={message._id || index}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
                            >
                                <div className={`flex items-end space-x-3 max-w-sm lg:max-w-lg ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    {!isOwnMessage && (
                                        <div className="flex-shrink-0">
                                            {/* User Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white">
                                                {message.sender.name.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                    )}
                                    <div
                                        className={`px-5 py-3 rounded-2xl shadow-lg ${
                                            isOwnMessage
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md'
                                                : 'bg-white text-gray-800 border border-blue-100 rounded-bl-md'
                                        }`}
                                    >
                                        {!isOwnMessage && (
                                            <div className="text-xs font-semibold mb-1 text-blue-600">
                                                {message.sender.name}
                                            </div>
                                        )}
                                        <div className="text-sm leading-relaxed">{message.content}</div>
                                        <div
                                            className={`text-xs mt-2 ${
                                                isOwnMessage ? 'text-blue-200' : 'text-gray-400'
                                            }`}
                                        >
                                            {formatTime(message.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    </>
                )}

                {/* Typing indicator */}
                {otherUserTyping && (
                    <div className="flex justify-start mb-4">
                        <div className="flex items-end space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white">
                                    {chatInfo?.participants?.find(p => p._id !== currentUser?._id)?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                            </div>
                            <div className="bg-white text-gray-800 px-5 py-3 rounded-2xl rounded-bl-md border border-blue-100 shadow-lg">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
                        </div>

                        {/* Message input */}
                        <div className="p-6 pt-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-3xl border-t border-blue-400">
                            <form onSubmit={sendMessage}>
                                <div className="flex space-x-4 items-center relative">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                                handleTyping();
                                            }}
                                            placeholder="Type your message..."
                                            className="w-full px-6 py-4 border-2 border-white/30 rounded-full focus:outline-none focus:ring-4 focus:ring-white/50 focus:border-white/50 bg-white text-gray-800 placeholder-gray-500 shadow-lg transition-all duration-200"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="px-6 py-3 bg-white hover:bg-blue-50 disabled:bg-gray-200 text-blue-600 hover:text-blue-700 disabled:text-gray-400 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
                                        style={{ marginTop: '0' }}
                                    >
                                        <span>Send</span>
                                        <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
