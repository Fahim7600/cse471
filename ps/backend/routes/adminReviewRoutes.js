const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');

// Admin-only middleware
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = await User.findById(req.session.userId);
        if (!user || (user.role !== 'admin' && !user.isAdmin)) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all reviews with user details (admin only)
router.get('/reviews', requireAdmin, async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('userId', 'name email role isAdmin banned')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching admin reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete any review (admin only)
router.delete('/reviews/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await review.deleteOne();
        res.json({ message: 'Review deleted by admin successfully' });
    } catch (error) {
        console.error('Error deleting review (admin):', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get review statistics (admin only)
router.get('/reviews/stats', requireAdmin, async (req, res) => {
    try {
        const totalReviews = await Review.countDocuments();
        const averageRating = await Review.aggregate([
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);
        
        const ratingDistribution = await Review.aggregate([
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const recentReviews = await Review.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        res.json({
            totalReviews,
            averageRating: averageRating[0]?.avgRating || 0,
            ratingDistribution,
            recentReviews
        });
    } catch (error) {
        console.error('Error fetching review stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
