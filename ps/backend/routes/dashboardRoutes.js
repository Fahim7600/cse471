const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Staff/Admin Dashboard - API endpoint
router.get('/staff-dashboard', async (req, res) => {
    if (req.session.role !== 'staff') {
        return res.status(403).json({ 
            message: 'Access denied - Staff role required',
            status: 'error'
        });
    }
    try {
        const users = await User.find({ isVerified: false });
        res.json({ 
            message: 'Staff dashboard data',
            users: users,
            status: 'OK'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching users',
            error: error.message,
            status: 'error'
        });
    }
});

// Approve User
router.post('/approve-user/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isVerified: true });
        res.json({ 
            message: 'User approved successfully',
            status: 'OK'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error approving user',
            error: error.message,
            status: 'error'
        });
    }
});

// Reject User
router.post('/reject-user/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ 
            message: 'User rejected and deleted successfully',
            status: 'OK'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error rejecting user',
            error: error.message,
            status: 'error'
        });
    }
});

module.exports = router;