const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/adminMetricsController');
const { isAdmin } = require('../middleware/authMiddleware');

// Admin metrics routes
router.get('/metrics', isAdmin, getDashboardMetrics);

module.exports = router; 