import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPetImageUrl, handleImageError } from '../../utils/imageUtils';
import '../UserCSS/PetCard.css';

// Added by tarek - Modal styles configuration
const modalStyles = {
    overlay: `fixed inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center p-4 z-50`,
    container: `bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col
        transform transition-all duration-300 border border-blue-100`,
    header: `flex justify-between items-center mb-6 pb-4 border-b border-blue-100`,
    title: `text-2xl font-bold text-blue-800`,
    closeButton: `p-2 hover:bg-blue-50 rounded-full transition-colors duration-200`,
    commentList: `flex-1 overflow-y-auto mb-6 pr-2 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] 
        [&::-webkit-scrollbar-track]:bg-blue-50 [&::-webkit-scrollbar-track]:rounded-lg
        [&::-webkit-scrollbar-thumb]:bg-blue-200 [&::-webkit-scrollbar-thumb]:rounded-lg
        [&::-webkit-scrollbar-thumb:hover]:bg-blue-300`,
    commentCard: `mb-4 p-4 bg-blue-50/50 rounded-xl hover:bg-blue-50/80 transition-colors duration-200 border border-blue-100`,
    avatar: `w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold`,
    commentMeta: `flex items-center gap-2 mb-1`,
    commentText: `text-gray-700 leading-relaxed`,
    inputContainer: `pt-4 border-t border-blue-100`,
    input: `flex-1 px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300/50 
        focus:border-blue-400 transition-all duration-200 bg-blue-50/30`,
    button: `px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2`
};

// Added by tarek - Comment Modal Component for lost/found pet posts
const CommentModal = ({ isOpen, onClose, comments, reportId, onAddComment }) => {
    const [newComment, setNewComment] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            onClick={handleClose}
            className={`${modalStyles.overlay} ${isAnimating ? 'bg-opacity-0' : 'bg-opacity-50'}`}
            style={{ animation: isAnimating ? 'fadeIn 0.3s ease-out forwards' : '' }}
        >
            <div 
                className={`${modalStyles.container} ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className={modalStyles.header}>
                    <h3 className={modalStyles.title}>Comments</h3>
                    <button onClick={onClose} className={modalStyles.closeButton}>
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className={modalStyles.commentList}>
                    {comments?.length > 0 ? (
                        comments.map((comment, index) => (
                            <div key={index} className={modalStyles.commentCard}>
                                <div className="flex items-start gap-3">
                                    <div className={modalStyles.avatar}>
                                        {(comment?.user?.name?.charAt(0)?.toUpperCase()) || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <div className={modalStyles.commentMeta}>
                                            <span className="font-semibold text-gray-800">{comment?.user?.name || 'Anonymous'}</span>
                                            <span className="text-xs text-gray-500">
                                                {comment?.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                                            </span>
                                        </div>
                                        <p className={modalStyles.commentText}>{comment?.text || ''}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-blue-500/60">
                            <svg className="w-16 h-16 mb-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-center font-medium">No comments yet. Be the first to comment!</p>
                        </div>
                    )}
                </div>

                <div className={modalStyles.inputContainer}>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className={modalStyles.input}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && newComment.trim()) {
                                    onAddComment(reportId, newComment);
                                    setNewComment('');
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                if (newComment.trim()) {
                                    onAddComment(reportId, newComment);
                                    setNewComment('');
                                }
                            }}
                            disabled={!newComment.trim()}
                            className={modalStyles.button}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Post
                        </button>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

const LostOrFound = () => {
    const [lostPets, setLostPets] = useState([]);
    const [comments, setComments] = useState({});
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchLostPets();
    }, []);

    useEffect(() => {
        if (selectedReport) {
            fetchComments(selectedReport);
        }
    }, [selectedReport]);

    const fetchLostPets = async () => {
        try {
            const response = await fetch('https://cse471-production.up.railway.app/lost-pets', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setLostPets(data);
            }
        } catch (error) {
            console.error('Error fetching lost pets:', error);
        }
    };

    const handleMarkAsFound = async (reportId) => {
        try {
            const response = await fetch(`https://cse471-production.up.railway.app/mark-found/${reportId}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                alert('Pet marked as found successfully!');
                fetchLostPets();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to mark pet as found');
            }
        } catch (error) {
            console.error('Error marking pet as found:', error);
            alert('Failed to mark pet as found');
        }
    };

    const fetchComments = async (reportId) => {
        try {
            const response = await fetch(`https://cse471-production.up.railway.app/reports/${reportId}/comments`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setComments(prev => ({ ...prev, [reportId]: data }));
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleAddComment = async (reportId, text) => {
        try {
            const response = await fetch(`https://cse471-production.up.railway.app/reports/${reportId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                fetchComments(reportId);
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to add comment');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <div className="px-4 py-12 mx-auto adoption-list max-w-7xl sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
                        Lost Pets
                    </h2>
                    <p className="text-lg text-blue-600/80 max-w-2xl mx-auto">
                        Join our community in helping lost pets find their way home. Every share and comment makes a difference.
                    </p>
                </div>

                {/* Pet Cards Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {lostPets.map((report) => {
                    const { _id, petId, requestedBy, requestedAt, reviewedAt, status } = report;

                    return (
                        <div key={_id} className="group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200">
                            {/* Status Badge */}
                            <div className="absolute top-3 right-3 z-10">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    status === 'found' 
                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                        : 'bg-red-100 text-red-700 border border-red-200'
                                }`}>
                                    {status === 'found' ? '✅ Found' : '🔍 Missing'}
                                </span>
                            </div>

                            {/* Pet Image */}
                            <div className="relative overflow-hidden">
                                {petId?.image ? (
                                    <img
                                        src={getPetImageUrl(petId.image)}
                                        alt={petId?.name || 'Unknown pet'}
                                        className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                                        onError={handleImageError}
                                    />
                                ) : (
                                    <div className="w-full h-48 flex items-center justify-center text-blue-400 bg-blue-50">
                                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            
                            {/* Pet Information */}
                            <div className="p-5">
                                <div className="mb-3">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{petId?.name || 'Unknown Pet'}</h3>
                                    <p className="text-blue-600 font-medium text-sm">{petId?.breed || 'Breed unknown'}</p>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{petId?.description || 'No description provided.'}</p>
                                
                                {/* Report Information */}
                                <div className="p-3 mb-4 rounded-xl bg-blue-50/80 border border-blue-100">
                                    <h4 className="font-semibold text-blue-800 text-sm mb-2">Report Details</h4>
                                    <p className="text-xs text-blue-700 mb-1">📅 Reported: {requestedAt ? new Date(requestedAt).toLocaleDateString() : '-'}</p>
                                    <p className="text-xs text-blue-700 mb-1">👤 By: {requestedBy?.name || 'Unknown'}</p>
                                    {report.lostLocation && report.lostLocation.address && (
                                        <p className="text-xs text-red-700 mb-1">📍 Lost near: {report.lostLocation.address}</p>
                                    )}
                                    {status === 'found' && reviewedAt && (
                                        <p className="text-xs text-green-700 mt-1">✅ Found: {new Date(reviewedAt).toLocaleDateString()}</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2">
                                    {status === 'lost' && (
                                        <button
                                            onClick={() => handleMarkAsFound(_id)}
                                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-3 focus:ring-green-300/50 text-sm"
                                        >
                                            🎯 Mark as Found
                                        </button>
                                    )}
                                    
                                    <button
                                        onClick={() => {
                                            setSelectedReport(_id);
                                            setIsModalOpen(true);
                                        }}
                                        className="w-full bg-white border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-3 focus:ring-blue-300/50 text-sm"
                                    >
                                        💬 Comments ({comments[_id]?.length || 0})
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Empty State */}
            {lostPets.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <p className="text-xl text-blue-600/80 font-medium mb-2">No lost pets reported</p>
                    <p className="text-blue-500/60">Check back later or help spread the word about missing pets in your area.</p>
                </div>
            )}

            {/* Comment Modal */}
            <CommentModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedReport(null);
                }}
                comments={comments[selectedReport] || []}
                reportId={selectedReport}
                onAddComment={handleAddComment}
            />
        </div>
    </div>
    );
};

export default LostOrFound;
