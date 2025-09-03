const User = require('../models/User');
const PetProfile = require('../models/PetProfile');
const AdoptionRequest = require('../models/AdoptionRequest');
const Review = require('../models/Review');
const Chat = require('../models/Chat');
const LostOrFound = require('../models/LostOrFound');

const getDashboardMetrics = async (req, res) => {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

        // Calculate total pets by summing petIds from all users
        const users = await User.find({}, 'petIds');
        const totalPets = users.reduce((total, user) => total + (user.petIds ? user.petIds.length : 0), 0);

        const [
            totalUsers,
            newUsers24h,
            totalAdoptionRequests,
            approvedRequests,
            rejectedRequests,
            totalReviews,
            newReviews24h,
            totalChats,
            newChats24h,
            totalLostFoundReports,
            newLostFound24h
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } }),
            AdoptionRequest.countDocuments(),
            AdoptionRequest.countDocuments({ status: 'approved' }),
            AdoptionRequest.countDocuments({ status: 'rejected' }),
            Review.countDocuments(),
            Review.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } }),
            Chat.countDocuments(),
            Chat.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } }),
            // Only count ACTIVE lost reports (status: 'lost'), not found ones
            LostOrFound.countDocuments({ status: 'lost' }),
            // Count new lost reports in last 24 hours
            LostOrFound.countDocuments({ 
                status: 'lost',
                requestedAt: { $gte: twentyFourHoursAgo } 
            })
        ]);

        res.json({
            totalUsers,
            totalPets, // Now calculated from user petIds arrays
            newUsers24h,
            totalAdoptionRequests,
            approvedRequests,
            rejectedRequests,
            totalReviews,
            newReviews24h,
            totalChats,
            newChats24h,
            activeSessions: 0, // Can be implemented with session tracking
            lostFoundReports: totalLostFoundReports,
            newLostFound24h
        });
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).json({ message: 'Error fetching dashboard metrics' });
    }
};

module.exports = {
    getDashboardMetrics
}; 