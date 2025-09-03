const LostOrFound = require('../models/LostOrFound');
const PetProfile = require('../models/PetProfile');
const Notification = require('../models/Notification'); 
const User = require('../models/User');

// Function to update admin metrics (this will be called when lost/found status changes)
const updateAdminMetrics = async () => {
    try {
        // Get current counts for logging
        const activeLostReports = await LostOrFound.countDocuments({ status: 'lost' });
        const totalReports = await LostOrFound.countDocuments();
        
        console.log(`Admin metrics updated - Active Lost Reports: ${activeLostReports}, Total Reports: ${totalReports}`);
        console.log('Admin dashboard should refresh to show updated counts');
    } catch (error) {
        console.error('Error updating admin metrics:', error);
    }
};

const createNotification = async (userId, message, type = 'info') => {
    const notification = new Notification({
        userId,
        message,
        type
    });
    await notification.save();
};

// Function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
};

exports.reportLostPet = async (req, res) => {
    try {
        const { petId } = req.params;
        const { lostLocation } = req.body;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check if pet exists
        const pet = await PetProfile.findById(petId);
        const man = await User.findById(userId);
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        // Check if there's already an active lost report for this pet
        const existingReport = await LostOrFound.findOne({
            petId,
            status: 'lost'
        });

        if (existingReport) {
            return res.status(400).json({ message: 'Pet is already reported as lost' });
        }

        // Create new lost report with location
        const lostReport = new LostOrFound({
            petId,
            requestedBy: userId,
            status: 'lost',
            lostLocation: lostLocation || {
                address: '',
                latitude: null,
                longitude: null
            }
        });

        await lostReport.save();

        // Update admin metrics
        await updateAdminMetrics();

        // If location data is provided, find users within 1km radius
        if (lostLocation && lostLocation.latitude && lostLocation.longitude) {
            const users = await User.find({
                'location.latitude': { $ne: null },
                'location.longitude': { $ne: null }
            });

            let notificationCount = 0;
            for (const user of users) {
                // Skip the user who reported the pet as lost
                if (user._id.toString() === userId) continue;

                const distance = calculateDistance(
                    lostLocation.latitude,
                    lostLocation.longitude,
                    user.location.latitude,
                    user.location.longitude
                );

                // If user is within 1km radius, send notification
                if (distance <= 1) {
                    const message = `🚨 Lost Pet Alert: ${pet.name} (${pet.breed}) has been reported as lost near your location (${lostLocation.address}). Please keep an eye out for this pet!`;
                    await createNotification(user._id, message, 'alert');
                    notificationCount++;
                }
            }

            console.log(`Sent notifications to ${notificationCount} users within 1km radius`);
        } else {
            // Fallback: Send notification to all users if no location is provided
            const users = await User.find();
            for (const user of users) {
                if (user._id.toString() === userId) continue; // Skip the reporter
                const message = `Pet ${pet.name} (${pet.breed}) has been reported as lost by ${man.name}.`;
                await createNotification(user._id, message);
            }
        }

        res.status(201).json({ 
            message: 'Pet reported as lost successfully', 
            report: lostReport 
        });
    } catch (error) {
        console.error('Error reporting lost pet:', error);
        res.status(500).json({ message: 'Failed to report pet as lost' });
    }
}


exports.getLostPets = async (req, res) => {
    try {
        const lostPets = await LostOrFound.find({ status: 'lost' })
            .populate('petId', 'name breed image description')
            .populate('requestedBy', 'name email')
            .sort({ requestedAt: -1 });

        res.status(200).json(lostPets);
    } catch (error) {
        console.error('Error fetching lost pets:', error);
        res.status(500).json({ message: 'Failed to fetch lost pets' });
    }
}


exports.markPetAsFound = async (req, res) => {
    try {
        const { reportId } = req.params;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const report = await LostOrFound.findById(reportId);
        const man = await User.findById(userId);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.status = 'found';
        report.reviewedBy = userId;
        report.reviewedAt = new Date();

        await report.save();

        // Update admin metrics
        await updateAdminMetrics();

        await createNotification(report.requestedBy, `Your pet has been marked as found by ${man.name}, contactinfo: ${man.contactInfo}`);
        res.status(200).json({ message: 'Pet marked as found', report });
    } catch (error) {
        console.error('Error marking pet as found:', error);
        res.status(500).json({ message: 'Failed to mark pet as found' });
    }
}



// Added by tarek - Comment routes for lost/found pet posts

    exports.addcomment= async (req, res) => {
    try {
        const { reportId } = req.params;
        const { text } = req.body;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const report = await LostOrFound.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Add the comment
        report.comments.push({
            user: userId,
            text
        });

        await report.save();

        // Create notification for the report owner
        if (report.requestedBy.toString() !== userId) {
            const commenter = await User.findById(userId);
            // await createNotification(
            //     report.requestedBy,
            //     ${commenter.name} commented on your lost pet report
            // );
        }

        res.status(201).json({ message: 'Comment added successfully', report });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Failed to add comment' });
    }
};

// Added by tarek - Get comments for a lost/found pet report
 
    exports.getcomment=async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await LostOrFound.findById(reportId)
            .populate({
                path: 'comments.user',
                select: 'name email profilePicture'
            });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json(report.comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Failed to fetch comments' });
    }
}

