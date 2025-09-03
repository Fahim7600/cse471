import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../provider/Authprovider';
import axios from 'axios';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    // Check if user is admin
    useEffect(() => {
        if (!user || (!user.isAdmin && user.role !== 'admin')) {
            navigate('/');
            return;
        }
        fetchReviews();
    }, [user, navigate]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:3000/api/reviews', { 
                withCredentials: true 
            });
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setError('Failed to load reviews. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (reviewId) => {
        const reviewToDelete = reviews.find(r => r._id === reviewId);
        
        const confirmMessage = `Are you sure you want to delete this review by ${reviewToDelete?.userId?.name || 'Unknown User'}? This action cannot be undone.`;
            
        if (!window.confirm(confirmMessage)) {
            return;
        }
        
        try {
            setLoading(true);
            await axios.delete(`http://localhost:3000/api/reviews/${reviewId}`, {
                withCredentials: true
            });
            setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
        } catch (error) {
            console.error('Error deleting review:', error);
            setError(error.response?.data?.message || 'Failed to delete review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const ReviewCard = ({ review }) => (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full text-white font-bold">
                        {review.userId?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">
                            {review.userId?.name || 'Anonymous User'}
                        </h4>
                        <p className="text-sm text-gray-500">
                            {review.userId?.email || 'No email'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-3">
                    {/* Rating */}
                    <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-full">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                                key={star}
                                className={`w-4 h-4 ${
                                    star <= review.rating ? 'text-amber-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                        <span className="ml-1 text-sm font-medium text-gray-700">{review.rating}/5</span>
                    </div>
                    
                    {/* Date */}
                    <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <p className="text-gray-700 leading-relaxed">
                    {review.content}
                </p>
            </div>

            {/* Admin Actions */}
            <div className="flex justify-end px-4 pb-4">
                <button
                    onClick={() => handleDelete(review._id)}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Review
                </button>
            </div>
        </div>
    );

    if (!user || (!user.isAdmin && user.role !== 'admin')) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">You need admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Manage Reviews
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Review and moderate user feedback
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-50 px-4 py-2 rounded-lg">
                                <span className="text-sm font-medium text-blue-900">
                                    Total Reviews: {reviews.length}
                                </span>
                            </div>
                            
                            <button
                                onClick={() => navigate('/admin-home')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                )}

                {/* Reviews List */}
                {!loading && (
                    <div className="space-y-4">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <ReviewCard key={review._id} review={review} />
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Found</h3>
                                <p className="text-gray-600">
                                    There are currently no user reviews to moderate.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReviews;
