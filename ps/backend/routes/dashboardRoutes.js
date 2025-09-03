const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Staff/Admin Dashboard
router.get('/staff-dashboard', async (req, res) => {
    if (req.session.role !== 'staff') return res.redirect('/login');
    const users = await User.find({ isVerified: false });
    res.render('staffDashboard', { users });
});

// Approve User
router.post('/approve-user/:id', async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isVerified: true });
    res.redirect('/staff-dashboard');
});

// Reject User
router.post('/reject-user/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/staff-dashboard');
});

module.exports = router;