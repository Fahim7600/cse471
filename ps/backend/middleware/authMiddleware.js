const User = require('../models/User');
const protect = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Unauthorized - Please log in' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const isAdmin = async (req, res, next) => {
    try {
        // Check if user is logged in
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Unauthorized - Please log in' });
        }

        // Find user and check if they are an admin
        const user = await User.findById(req.session.userId);
        if (!user || (user.role !== 'admin' && !user.isAdmin)) {
            return res.status(403).json({ message: 'Forbidden - Admin access required' });
        }

        // Add user to request object for use in routes
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    protect,
    isAdmin
};