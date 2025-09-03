const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');



// Fetch notifications for the logged-in user (entrepreneur)
router.get('/', NotificationController.getNotifications);

// Mark notification as read
router.patch('/:id', NotificationController.markAsRead);

        // If we get here, either it's not a future event or the event date has passed
        

// Delete notification
router.delete('/:id', NotificationController.deleteNotification);
module.exports = router;
