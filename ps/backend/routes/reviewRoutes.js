const express = require('express');
const router = express.Router();
const { createReview, getAllReviews, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Get all reviews (public route)
router.get('/', getAllReviews);

// Create a review (protected route)
router.post('/', protect, createReview);

// Update a review (protected route)
router.put('/:id', protect, updateReview);

// Delete a review (protected route)
router.delete('/:id', protect, deleteReview);

module.exports = router;