const express = require('express');
const router = express.Router();
const authController = require('../controllers/authRoutesController');


// Signup Page - API endpoint
router.get('/signup', (req, res) => {
    res.json({ 
        message: 'Signup endpoint - Use POST /signup to register',
        status: 'OK'
    });
});
// 
// Signup Logic
// Removed duplicate /signup route to avoid conflicts
router.post('/signup', authController.signup);



  

// Login Page - API endpoint
router.get('/login', (req, res) => {
    res.json({ 
        message: 'Login endpoint - Use POST /login to authenticate',
        status: 'OK'
    });
});

// Login Logic
// This route handles user login and checks for banned status
// Features:
// - Validates user credentials
// - Checks if user is banned
// - Creates user session
// - Returns user information
router.post('/login', authController.login)


router.get('/check-session', authController.checkSession);



router.get('/user/:id', authController.getUser)



router.get('/logout', authController.getlogout)
// Get all users (admin only)
router.get('/users', authController.getAllUsers)
// Ban/Unban user route handler
// This route allows administrators to ban or unban user accounts
// Features:
// - Protected route (admin only)
// - Prevents banning of admin accounts
// - Updates user's banned status in database
// - Returns success/error messages
router.post('/users/:userId/ban', authController.banUser);

module.exports = router;