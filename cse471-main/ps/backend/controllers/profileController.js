const User = require('../models/User');
const Notification = require('../models/Notification');


const createNotification = async (userId, message, type = 'info') => {
    const notification = new Notification({
        userId,
        message,
        type
    });
    await notification.save();
};


exports.updateProfile = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Only update fields that are provided in the request
        const updateData = {};
        const fields = ['name', 'email', 'contactInfo', 'image', 'documents'];
        
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Handle location separately
        if (req.body.location) {
            updateData.location = {
                address: req.body.location.address || '',
                latitude: req.body.location.latitude || null,
                longitude: req.body.location.longitude || null
            };
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId,
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        await createNotification(updatedUser._id, 'Your profile has been updated successfully.');

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile.' });
    }
}



exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get profile data.' });
    }
}



exports.updateProfile = async (req, res) => {
    const id = req.params.id;
    const updateprofile = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                name: updateprofile.name,
                // email: updateprofile.email,
                contactInfo: updateprofile.contactInfo,
                image: updateprofile.image,
                documents: updateprofile.documents,
                ...(updateprofile.location && {
                    location: {
                        address: updateprofile.location.address || '',
                        latitude: updateprofile.location.latitude || null,
                        longitude: updateprofile.location.longitude || null
                    }
                })
            },
            { new: true }  // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        await createNotification(updatedUser._id, 'Your profile has been updated successfully.');

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile.' });
    }
}