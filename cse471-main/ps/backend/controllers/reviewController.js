const Review = require('../models/Review');
const User = require('../models/User');

const createReview = async (req, res) => {
    try {
        const { content, rating } = req.body;
        
        if (!req.session.userId) {
            return res.status(401).json({ message: 'You must be logged in to post a review' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const review = new Review({
            userId: user._id,
            content,
            rating
        });

        await review.save();
        
        const populatedReview = await Review.findById(review._id).populate('userId', 'name email');
        res.status(201).json(populatedReview);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: error.message });
    }
};

const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, rating } = req.body;
        
        const review = await Review.findById(id);
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if the user owns this review
        if (review.userId.toString() !== req.session.userId) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        review.content = content;
        review.rating = rating;
        await review.save();

        const updatedReview = await Review.findById(id).populate('userId', 'name email');
        res.json(updatedReview);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Get current user to check admin status
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check if the user owns this review OR is an admin
        const isOwner = review.userId.toString() === req.session.userId;
        const isAdmin = currentUser.role === 'admin' || currentUser.isAdmin === true;
        
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await review.deleteOne();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReview,
    getAllReviews,
    updateReview,
    deleteReview
};