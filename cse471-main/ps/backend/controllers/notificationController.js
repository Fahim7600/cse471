
const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        if (!req.session.userId) {
            console.log('No user ID in session');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        console.log('Fetching notifications for user:', req.session.userId);
        const notifications = await Notification.find({ userId: req.session.userId })
            .sort({ createdAt: -1 });

        console.log(`Found ${notifications.length} notifications`);
        res.json(notifications);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
    }
}

exports.markAsRead = async (req, res) => {
    try {
        console.log('Marking notification as read:', req.params.id);
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            console.log('Notification not found:', req.params.id);
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check if the notification is about a future appointment or vaccination
        const message = notification.message;
        if (message.includes('appointment') || message.includes('vaccination')) {
            // Extract the number of days from the message
            const daysMatch = message.match(/(\d+)\s+days?/);
            if (daysMatch) {
                const daysUntil = parseInt(daysMatch[1]);
                // If the event is in the future, prevent marking as read
                if (daysUntil > 0) {
                    return res.status(403).json({ 
                        message: 'Cannot mark notification as read before the event date',
                        daysUntil: daysUntil
                    });
                }
            }
        }
        const updatedNotification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        console.log('Notification marked as read:', updatedNotification._id);
        res.json(updatedNotification);
    } catch (err) {
        console.error('Error updating notification:', err);
        res.status(500).json({ message: 'Failed to mark notification as read', error: err.message });
    }
}

exports.deleteNotification = async (req, res) => {
    try {
        console.log('Deleting notification:', req.params.id);
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) {
            console.log('Notification not found for deletion:', req.params.id);
            return res.status(404).json({ message: 'Notification not found' });
        }
        console.log('Notification deleted:', notification._id);
        res.json({ message: 'Notification deleted successfully' });
    } catch (err) {
        console.error('Error deleting notification:', err);
        res.status(500).json({ message: 'Failed to delete notification', error: err.message });
    }
};