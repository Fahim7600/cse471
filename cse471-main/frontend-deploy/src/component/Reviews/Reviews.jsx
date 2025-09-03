import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../provider/Authprovider';
import axios from 'axios';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ content: '', rating: 5 });
    const [editingReview, setEditingReview] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('date'); // 'date' or 'rating'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const isReviewPage = location.pathname === '/reviews';

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('https://cse471-production.up.railway.app/api/reviews', { 
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('Please login to post a review');
            navigate('/login');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            if (editingReview) {
                const response = await axios.put(
                    `https://cse471-production.up.railway.app/api/reviews/${editingReview._id}`,
                    newReview,
                    { 
                        withCredentials: true,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
                setReviews(prevReviews => 
                    prevReviews.map(review => 
                        review._id === editingReview._id ? response.data : review
                    )
                );
                setEditingReview(null);
            } else {
                const response = await axios.post(
                    'https://cse471-production.up.railway.app/api/reviews',
                    newReview,
                    { 
                        withCredentials: true,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
                setReviews(prevReviews => [response.data, ...prevReviews]);
            }
            setNewReview({ content: '', rating: 5 });
            setShowForm(false);
        } catch (error) {
            console.error('Error with review:', error);
            setError(error.response?.data?.message || 'Failed to process review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (review) => {
        setEditingReview(review);
        setNewReview({ content: review.content, rating: review.rating });
        setShowForm(true);
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }
        
        try {
            setLoading(true);
            await axios.delete(`https://cse471-production.up.railway.app/api/reviews/${reviewId}`, {
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

    const handlePostReviewClick = () => {
        if (!user) {
            setError('Please login to post a review');
            navigate('/login');
            return;
        }
        if (isReviewPage) {
            setEditingReview(null);
            setNewReview({ content: '', rating: 5 });
            setShowForm(!showForm);
        } else {
            navigate('/reviews');
        }
    };

    const sortReviews = (reviewsToSort) => {
        return [...reviewsToSort].sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            } else {
                return sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
            }
        });
    };

    const userReviews = reviews.filter(review => user && review.userId?._id === user.id);
    const otherReviews = reviews.filter(review => !user || review.userId?._id !== user.id);

    const sortedUserReviews = sortReviews(userReviews);
    const sortedOtherReviews = sortReviews(otherReviews);

    const ReviewCard = ({ review }) => (
        <div className="group relative overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:transform hover:scale-[1.02]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full text-white font-bold text-lg shadow-md">
                        {review.userId?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900 text-lg">
                                {review.userId?.name || 'Anonymous User'}
                            </h4>
                        </div>
                        <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-1 bg-amber-50 px-3 py-1 rounded-full">
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
                    <span className="ml-2 text-sm font-medium text-gray-700">{review.rating}/5</span>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
                <p className="text-gray-700 leading-relaxed line-height-7">
                    {review.content}
                </p>
            </div>

            {/* Actions */}
            {user && review.userId?._id === user.id && (
                <div className="flex justify-end space-x-3 px-6 pb-6">
                    <button
                        onClick={() => handleEdit(review)}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 disabled:opacity-50"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(review._id)}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            User Reviews & Experiences
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Share your experience with our pet care services and read what other pet owners have to say
                        </p>
                        <div className="mt-8 flex justify-center">
                            <div className="flex items-center space-x-8 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span>Rate your experience</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span>Help other pet owners</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Build trust & community</span>
                                </div>
                            </div>
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* Write Review Button */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <button
                                    onClick={handlePostReviewClick}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:transform-none"
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>
                                            {showForm && isReviewPage ? 'Cancel' : editingReview ? 'Edit Review' : 'Write Review'}
                                        </span>
                                    </div>
                                </button>
                            </div>

                            {/* Sort Controls */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sort Reviews</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="date">Date</option>
                                            <option value="rating">Rating</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                        <button
                                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                            className="w-full p-3 border border-gray-300 rounded-lg hover:border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-left flex items-center justify-between"
                                        >
                                            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                                            <svg className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Reviews</span>
                                        <span className="font-semibold text-gray-900">{reviews.length}</span>
                                    </div>
                                    {reviews.length > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Average Rating</span>
                                            <div className="flex items-center space-x-1">
                                                <span className="font-semibold text-gray-900">
                                                    {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                                                </span>
                                                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        {/* Review Form */}
                        {showForm && isReviewPage && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                    {editingReview ? 'Edit Your Review' : 'Write a Review'}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
                                        <div className="flex space-x-2">
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <button
                                                    key={rating}
                                                    type="button"
                                                    onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                                                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                                        newReview.rating >= rating
                                                            ? 'border-amber-400 bg-amber-50 text-amber-600'
                                                            : 'border-gray-300 hover:border-amber-300 text-gray-400'
                                                    }`}
                                                >
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600">
                                            {newReview.rating === 1 && "Poor - Not satisfied"}
                                            {newReview.rating === 2 && "Fair - Below expectations"}
                                            {newReview.rating === 3 && "Good - Met expectations"}
                                            {newReview.rating === 4 && "Very Good - Exceeded expectations"}
                                            {newReview.rating === 5 && "Excellent - Outstanding service"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Your Review</label>
                                        <textarea
                                            value={newReview.content}
                                            onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                                            rows={5}
                                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                            placeholder="Share your experience with our pet care services. What did you like? How can we improve?"
                                            required
                                        />
                                    </div>
                                    <div className="flex space-x-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 disabled:opacity-50"
                                        >
                                            {loading ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingReview(null);
                                                setNewReview({ content: '', rating: 5 });
                                            }}
                                            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Reviews List */}
                        <div className="space-y-8">
                            {/* User's Reviews Section */}
                            {user && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                        <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Your Reviews ({sortedUserReviews.length})
                                    </h2>
                                    
                                    {sortedUserReviews.length > 0 ? (
                                        <div className="space-y-6">
                                            {sortedUserReviews.map((review) => (
                                                <ReviewCard key={review._id} review={review} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-purple-50 border-2 border-dashed border-purple-200 rounded-xl">
                                            <div className="max-w-md mx-auto">
                                                <svg className="w-12 h-12 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">You haven't posted any reviews yet</h3>
                                                <p className="text-gray-600 mb-4">
                                                    Share your experience to help other pet owners make informed decisions
                                                </p>
                                                <button
                                                    onClick={handlePostReviewClick}
                                                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Write Your First Review
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Divider between user reviews and community reviews */}
                                    <div className="relative my-12">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t-2 border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-6 py-2 bg-gray-50 text-sm font-medium text-gray-500 rounded-full border border-gray-200">
                                                Community Reviews
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Other Reviews */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                    <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {user ? `Community Reviews (${sortedOtherReviews.length})` : `All Reviews (${sortedOtherReviews.length})`}
                                </h2>
                                <div className="space-y-6">
                                    {sortedOtherReviews.map((review) => (
                                        <ReviewCard key={review._id} review={review} />
                                    ))}
                                </div>
                            </div>

                            {/* Empty State */}
                            {reviews.length === 0 && !loading && (
                                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                                    <div className="max-w-md mx-auto">
                                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                                        <p className="text-gray-600 mb-6">
                                            Be the first to share your experience with our pet care services!
                                        </p>
                                        <button
                                            onClick={handlePostReviewClick}
                                            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Write First Review
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reviews;
