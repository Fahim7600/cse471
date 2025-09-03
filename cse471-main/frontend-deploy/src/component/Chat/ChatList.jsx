import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPetImageUrl, handleImageError } from '../../utils/imageUtils';
import { IoMale, IoFemale } from 'react-icons/io5';

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const response = await fetch('https://cse471-production.up.railway.app/api/chats', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch chats');
            }
            
            const data = await response.json();
            // Filter out chats with null or invalid petId
            const validChats = (data.chats || []).filter(chat => 
                chat && chat._id && chat.petId && typeof chat.petId === 'object'
            );
            setChats(validChats);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading chats...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 bg-white/90 rounded-2xl p-6 shadow-lg border border-blue-100">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                My Chats
                            </h1>
                            <p className="text-sm text-blue-600/70 mt-1">
                                {chats.length} active conversation{chats.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/adoption')}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg font-semibold flex items-center space-x-2 text-sm sm:text-base"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="hidden sm:inline">Browse Pets</span>
                        <span className="sm:hidden">Browse</span>
                    </button>
                </div>

                {/* Content */}
                {chats.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-blue-100 max-w-md mx-auto">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-blue-700 mb-3">No chats yet</h3>
                            <p className="text-blue-500 mb-6 text-base sm:text-lg">Start chatting with pet owners by clicking the chat button on pet cards</p>
                            <button
                                onClick={() => navigate('/adoption')}
                                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-xl font-semibold text-base sm:text-lg flex items-center space-x-3 mx-auto"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>Find Pets to Adopt</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {chats.map((chat) => (
                            <div
                                key={chat._id}
                                onClick={() => navigate(`/chat/${chat._id}`)}
                                className="group relative bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-3xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-300/70 transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-white/90"
                            >
                                {/* Modern glass overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                <div className="relative z-10">
                                    {/* Header Section */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            {/* Pet Avatar with Modern Frame */}
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 p-1 shadow-lg group-hover:shadow-xl transition-all duration-300">
                                                    {chat.petId && chat.petId.image ? (
                                                        <img
                                                            src={getPetImageUrl(chat.petId.image)}
                                                            alt={chat.petId.name || 'Pet'}
                                                            className="w-full h-full rounded-xl object-cover"
                                                            onError={handleImageError}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Status Indicator */}
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-3 border-white rounded-full shadow-md"></div>
                                            </div>
                                            
                                            {/* Pet Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-800 truncate">
                                                        {chat.petId?.name || 'Unknown Pet'}
                                                    </h3>
                                                    {/* Gender Icon */}
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                                                        chat.petId?.gender === 'Male' 
                                                            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                                                            : chat.petId?.gender === 'Female'
                                                            ? 'bg-gradient-to-br from-pink-500 to-pink-600'
                                                            : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                                    }`}>
                                                        {chat.petId?.gender === 'Male' ? (
                                                            <IoMale className="w-4 h-4 text-white" />
                                                        ) : chat.petId?.gender === 'Female' ? (
                                                            <IoFemale className="w-4 h-4 text-white" />
                                                        ) : (
                                                            <span className="text-white text-xs font-bold">?</span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Pet Details Row */}
                                                <div className="flex items-center space-x-2 text-sm">
                                                    <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1 rounded-full font-medium">
                                                        {chat.petId?.breed || 'Unknown Breed'}
                                                    </span>
                                                    {chat.petId?.age && (
                                                        <span className="text-gray-600 font-medium">
                                                            Age: {chat.petId.age}y
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Time Badge */}
                                        <div className="flex flex-col items-end space-y-1">
                                            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                                                {formatTime(chat.lastMessage?.timestamp)}
                                            </span>
                                            <span className="text-xs text-gray-500">Last seen</span>
                                        </div>
                                    </div>
                                    
                                    {/* Message Preview */}
                                    <div className="mt-4">
                                        {chat.lastMessage ? (
                                            <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/50 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4">
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0">
                                                        {chat.lastMessage.sender?.name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span className="text-sm font-semibold text-gray-800">
                                                                {chat.lastMessage.sender?.name || 'Unknown User'}
                                                            </span>
                                                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                            <span className="text-xs text-gray-500 font-medium">
                                                                Latest message
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                                                            {chat.lastMessage.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm text-blue-700 font-medium">
                                                        Start chatting about {chat.petId?.name}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Hover Arrow */}
                                    <div className="absolute top-6 right-6 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 shadow-lg">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList;
