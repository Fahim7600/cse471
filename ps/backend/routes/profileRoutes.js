




const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
  // Import Notification model





// Function to create a notification

// Update Profile Logic
router.patch('/update-profile', profileController.updateProfile);

// Get Profile Info (for viewing profile)
router.get('/profile/:id', profileController.getProfile);


// Update Profile Logic
router.put('/profile/:id', profileController.updateProfile);

// module.exports = router;


module.exports = router;

