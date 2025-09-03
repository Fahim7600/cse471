const AdoptionRequest = require('../models/AdoptionRequest');
const PetProfile = require('../models/PetProfile');
const User = require('../models/User');
const Chat = require('../models/Chat');

// ADOPTION LIMIT CONFIGURATION
const ADOPTION_LIMIT = 3; // Maximum pets a user can have in total (adopted + self-added)

// Helper function to check if user can adopt more pets
const canUserAdopt = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return { canAdopt: false, reason: 'User not found' };
        
        const totalPetsCount = user.petIds ? user.petIds.length : 0;
        
        if (totalPetsCount >= ADOPTION_LIMIT) {
            return {
                canAdopt: false,
                reason: 'Adoption limit reached',
                currentPets: totalPetsCount,
                limit: ADOPTION_LIMIT
            };
        }
        
        return {
            canAdopt: true,
            currentPets: totalPetsCount,
            limit: ADOPTION_LIMIT
        };
    } catch (error) {
        console.error('Error checking adoption limit:', error);
        return { canAdopt: false, reason: 'Error checking limit' };
    }
};

// For pet owners to add/remove their pets from adoption list
exports.requestAdoption = async (req, res) => {
    try {
        const { userId } = req.session;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { petId } = req.params;

        // Check if pet exists
        const pet = await PetProfile.findById(petId);
        if (!pet) return res.status(404).json({ message: 'Pet not found' });

        // Check if user owns this pet
        if (pet.owner.toString() !== userId) {
            return res.status(403).json({ message: 'You can only manage adoption for your own pets' });
        }

        // Check if there's already an approved adoption request for this pet
        const existing = await AdoptionRequest.findOne({ petId, requestedBy: userId, status: 'approved' });

        if (existing) {
            // Pet is already in adoption list - remove it
            await AdoptionRequest.findByIdAndDelete(existing._id);
            
            // Delete all chats related to this pet
            const deletedChats = await Chat.deleteMany({ petId: petId });
            console.log(`Deleted ${deletedChats.deletedCount} chats related to pet ${petId}`);
            
            pet.adoptionStatus = 'available';
            await pet.save();
            res.status(200).json({ 
                message: 'Pet removed from adoption list and related chats deleted', 
                inAdoptionList: false,
                chatsDeleted: deletedChats.deletedCount
            });
        } else {
            // Pet is not in adoption list - add it directly (no admin approval needed)
            const request = new AdoptionRequest({ 
                petId, 
                requestedBy: userId, 
                status: 'approved',  // Directly approved
                reviewedBy: userId,  // Self-approved
                reviewedAt: new Date()
            });
            await request.save();

            pet.adoptionStatus = 'approved';
            await pet.save();
            res.status(200).json({ message: 'Pet added to adoption list', inAdoptionList: true });
        }
    } catch (err) {
        console.error('Error in requestAdoption:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// For users to request adoption of a pet from its owner
exports.requestPetAdoption = async (req, res) => {
    try {
        const { userId } = req.session;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { petId } = req.params;

        // Check if pet exists
        const pet = await PetProfile.findById(petId);
        if (!pet) return res.status(404).json({ message: 'Pet not found' });

        // Check if user is trying to adopt their own pet
        if (pet.owner.toString() === userId) {
            return res.status(400).json({ message: 'You cannot adopt your own pet' });
        }

        // Check if pet is available for adoption
        const availableAdoption = await AdoptionRequest.findOne({ petId, status: 'approved' });
        if (!availableAdoption) {
            return res.status(400).json({ message: 'This pet is not available for adoption' });
        }

        // ADOPTION LIMIT VALIDATION - Check if user has reached adoption limit
        const adoptionCheck = await canUserAdopt(userId);
        if (!adoptionCheck.canAdopt) {
            console.log(`Adoption limit reached for user ${userId}: ${adoptionCheck.currentPets}/${adoptionCheck.limit} pets`);
            return res.status(403).json({ 
                message: `You have reached your adoption limit of ${adoptionCheck.limit} pets. You cannot adopt more pets.`,
                currentPets: adoptionCheck.currentPets,
                limit: adoptionCheck.limit,
                limitReached: true
            });
        }

        console.log(`User ${userId} adoption check: ${adoptionCheck.currentPets}/${adoptionCheck.limit} pets - Adoption allowed`);

        // Check if user has already requested this pet
        const existingRequest = await AdoptionRequest.findOne({ 
            petId, 
            requestedBy: userId, 
            status: 'pending' 
        });
        
        if (existingRequest) {
            return res.status(400).json({ message: 'You have already requested to adopt this pet' });
        }

        // Create adoption request to owner
        const request = new AdoptionRequest({ 
            petId, 
            requestedBy: userId, 
            status: 'pending',
            ownerId: pet.owner  // Add owner ID for easy filtering
        });
        await request.save();

        res.status(200).json({ message: 'Adoption request sent to pet owner' });
    } catch (err) {
        console.error('Error in requestPetAdoption:', err);
        res.status(500).json({ message: 'Server error' });
    }
}


// Get pending adoption requests for admin (if needed)
exports.getPendingAdoptions = async (req, res) => {
    try {
        const requests = await AdoptionRequest.find({ status: 'pending' }).populate('petId requestedBy');
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

// Get adoption requests for pet owner
exports.getOwnerAdoptionRequests = async (req, res) => {
    try {
        const { userId } = req.session;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Find all pets owned by the user
        const userPets = await PetProfile.find({ owner: userId });
        const petIds = userPets.map(pet => pet._id);

        // Find pending adoption requests for user's pets
        const requests = await AdoptionRequest.find({ 
            petId: { $in: petIds }, 
            status: 'pending',
            requestedBy: { $ne: userId } // Exclude owner's own requests
        }).populate({
            path: 'petId',
            select: 'name breed image'
        }).populate({
            path: 'requestedBy',
            select: 'name email phone'
        });

        res.status(200).json(requests);
    } catch (err) {
        console.error('Error getting owner adoption requests:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// exports.getAvailableAdoptions =async (req, res) => {
//     try {
//         const approved = await AdoptionRequest.find({ status: 'approved' }).populate({
//             path: 'petId',
//             populate: {
//                 path: 'owner',
//                 select: 'name email phone'
//             }
//         });
//         res.json(approved.map(req => req.petId));
//     } catch (err) {
//         res.status(500).json({ message: 'Error fetching adoption list' });
//     }
// }


exports.getAvailableAdoptions  =async (req, res) => {
    try {
        const { search, ageFilter } = req.query;
        console.log('Received query params:', { search, ageFilter });
        
        // Build the query for approved adoption requests
        let query = { status: 'approved' };
        
        // Added by  - Search functionality
        if (search && search.trim() !== '') {
            console.log('Searching for:', search);
            // First find matching pets that are available for adoption (not adopted)
            const matchingPets = await PetProfile.find({
                $and: [
                    {
                        $or: [
                            { name: { $regex: search, $options: 'i' } },
                            { breed: { $regex: search, $options: 'i' } }
                        ]
                    },
                    { 
                        $or: [
                            { adoptionStatus: { $ne: 'adopted' } },
                            { adoptionStatus: { $exists: false } }
                        ]
                    }
                ]
            });
            
            console.log('Found matching pets:', matchingPets.length);
            
            // Then find adoption requests for those pets
            if (matchingPets.length > 0) {
                query.petId = { $in: matchingPets.map(pet => pet._id) };
            } else {
                // If no pets match the search, return empty array
                return res.json([]);
            }
        }

        // Get all approved adoption requests with populated pet details and owner info
        const approved = await AdoptionRequest.find(query)
            .populate({
                path: 'petId',
                populate: {
                    path: 'owner',
                    select: 'name email phone banned'
                }
            });

        console.log('Found approved requests:', approved.length);

        // Filter out pets from banned users, non-existent pets, and adopted pets
        let pets = approved
            .map(req => req.petId)
            .filter(pet => {
                // Check if pet exists and has an owner
                if (!pet || !pet.owner) {
                    console.log('Filtering out pet with missing data:', pet?._id);
                    return false;
                }
                
                // Check if owner is banned
                if (pet.owner.banned === true) {
                    console.log('Filtering out pet from banned user:', pet.owner.name, pet.name);
                    return false;
                }
                
                // Check if pet has been adopted
                if (pet.adoptionStatus === 'adopted') {
                    console.log('Filtering out adopted pet:', pet.name);
                    return false;
                }
                
                return true;
            });

        console.log('Filtered pets after removing banned users and adopted pets:', pets.length);

        // Added by  - Sort by age
        if (ageFilter && ageFilter !== 'none') {
            console.log('Sorting by age:', ageFilter);
            pets.sort((a, b) => {
                const ageA = calculateAge(a.dob);
                const ageB = calculateAge(b.dob);
                return ageFilter === 'youngest' ? ageA - ageB : ageB - ageA;
            });
        }

        console.log('Sending response with pets:', pets.length);
        res.json(pets);
    } catch (err) {
        console.error('Error in available-adoptions:', err);
        res.status(500).json({ message: 'Error fetching adoption list' });
    }
};

// Helper function to calculate age
const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};


// For pet owners to approve/reject adoption requests
exports.reviewAdoption = async (req, res) => {
    try {
        console.log('=== Review Adoption Request ===');
        const { status } = req.body;
        const { userId } = req.session;
        console.log('Request body:', req.body);
        console.log('User ID:', userId);
        console.log('Request ID:', req.params.requestId);
        
        if (!userId) {
            console.log('ERROR: No user ID in session');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const request = await AdoptionRequest.findById(req.params.requestId).populate('petId');
        console.log('Found request:', request);
        if (!request) {
            console.log('ERROR: Request not found');
            return res.status(404).json({ message: 'Request not found' });
        }

        if (!request.petId) {
            console.log('ERROR: Pet not found for this request');
            return res.status(404).json({ message: 'Pet not found for this request' });
        }

        console.log('Pet owner ID:', request.petId.owner.toString());
        console.log('Current user ID:', userId);
        
        // Check if user owns the pet
        if (request.petId.owner.toString() !== userId) {
            console.log('ERROR: User does not own this pet');
            return res.status(403).json({ message: 'You can only review requests for your own pets' });
        }

        if (status === 'approved') {
            console.log('Approving adoption request...');
            // Update the pet ownership and status first
            const pet = await PetProfile.findById(request.petId._id);
            console.log('Found pet:', pet);
            console.log('Transferring ownership from:', pet.owner, 'to:', request.requestedBy);
            
            const oldOwnerId = pet.owner;
            const newOwnerId = request.requestedBy;
            
            // Transfer ownership to the new adopter
            pet.owner = newOwnerId;
            pet.adoptionStatus = 'adopted';
            await pet.save();
            console.log('Pet saved successfully');

            // Update User models - remove pet from old owner and add to new owner
            try {
                // Remove pet from old owner's petIds array
                const oldOwnerUpdate = await User.findByIdAndUpdate(
                    oldOwnerId,
                    { $pull: { petIds: pet._id } }
                );
                console.log('Removed pet from old owner:', oldOwnerUpdate ? 'Success' : 'Failed');

                // Add pet to new owner's petIds array
                const newOwnerUpdate = await User.findByIdAndUpdate(
                    newOwnerId,
                    { $addToSet: { petIds: pet._id } }
                );
                console.log('Added pet to new owner:', newOwnerUpdate ? 'Success' : 'Failed');
            } catch (userUpdateError) {
                console.error('Error updating user petIds:', userUpdateError);
                // Don't fail the entire operation for this
            }

            // Remove the original adoption listing (owner's approved request)
            const deletedRequests = await AdoptionRequest.deleteMany({ 
                petId: request.petId._id, 
                status: 'approved',
                requestedBy: userId // Remove owner's original listing
            });
            console.log('Deleted original adoption listing:', deletedRequests.deletedCount);
            
            // Reject all other pending requests for this pet
            const rejectedRequests = await AdoptionRequest.updateMany(
                { 
                    petId: request.petId._id, 
                    status: 'pending',
                    _id: { $ne: request._id }
                },
                { 
                    status: 'rejected',
                    reviewedBy: userId,
                    reviewedAt: new Date()
                }
            );
            console.log('Rejected other pending requests:', rejectedRequests.modifiedCount);

            // Delete all chats related to this pet since it's now adopted
            const deletedChats = await Chat.deleteMany({ petId: request.petId._id });
            console.log('Deleted chats related to adopted pet:', deletedChats.deletedCount);

            // Mark this request as approved
            request.status = 'approved';
        } else if (status === 'rejected') {
            console.log('Rejecting adoption request...');
            request.status = 'rejected';
        } else {
            console.log('ERROR: Invalid status provided');
            return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected"' });
        }
        
        request.reviewedBy = userId;
        request.reviewedAt = new Date();
        await request.save();
        console.log('Request saved successfully');

        console.log('=== Review Adoption Completed Successfully ===');
        res.status(200).json({ message: `Request ${status} successfully` });
    } catch (err) {
        console.error('ERROR in reviewAdoption:', err);
        console.error('Error details:', err.message);
        console.error('Stack trace:', err.stack);
        res.status(500).json({ message: 'Review failed', error: err.message });
    }
}

// Cleanup function to remove adoption requests for banned or deleted users
exports.cleanupAdoptionRequests = async (req, res) => {
    try {
        console.log('Starting adoption requests cleanup...');
        
        // Find all adoption requests with populated pet and owner data
        const allRequests = await AdoptionRequest.find({}).populate({
            path: 'petId',
            populate: {
                path: 'owner',
                select: 'banned'
            }
        });

        let removedCount = 0;
        const requestsToRemove = [];

        for (const request of allRequests) {
            // Check if pet exists and has an owner
            if (!request.petId || !request.petId.owner) {
                console.log(`Marking request ${request._id} for removal: missing pet or owner`);
                requestsToRemove.push(request._id);
                continue;
            }
            
            // Check if owner is banned
            if (request.petId.owner.banned === true) {
                console.log(`Marking request ${request._id} for removal: owner is banned`);
                requestsToRemove.push(request._id);
                continue;
            }
        }

        // Remove identified requests
        if (requestsToRemove.length > 0) {
            const result = await AdoptionRequest.deleteMany({ 
                _id: { $in: requestsToRemove } 
            });
            removedCount = result.deletedCount;
            
            // Also update pet adoption status for affected pets
            const affectedPetIds = allRequests
                .filter(req => requestsToRemove.includes(req._id))
                .map(req => req.petId?._id)
                .filter(id => id);
                
            await PetProfile.updateMany(
                { _id: { $in: affectedPetIds } },
                { adoptionStatus: 'available' }
            );

            // Delete all chats related to affected pets
            if (affectedPetIds.length > 0) {
                const deletedChats = await Chat.deleteMany({ 
                    petId: { $in: affectedPetIds } 
                });
                console.log(`Deleted ${deletedChats.deletedCount} chats for ${affectedPetIds.length} affected pets`);
            }
        }

        console.log(`Cleanup completed. Removed ${removedCount} adoption requests.`);
        
        if (res) {
            res.json({ 
                message: 'Cleanup completed', 
                removedRequests: removedCount 
            });
        }
        
        return { removedRequests: removedCount };
    } catch (err) {
        console.error('Error during cleanup:', err);
        if (res) {
            res.status(500).json({ message: 'Cleanup failed', error: err.message });
        }
        throw err;
    }
};

// Get user's current adoption limit status
exports.getAdoptionLimitStatus = async (req, res) => {
    try {
        const { userId } = req.session;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const adoptionCheck = await canUserAdopt(userId);
        
        res.status(200).json({
            canAdopt: adoptionCheck.canAdopt,
            currentPets: adoptionCheck.currentPets,
            limit: adoptionCheck.limit,
            remainingSlots: Math.max(0, adoptionCheck.limit - adoptionCheck.currentPets),
            message: adoptionCheck.canAdopt 
                ? `You can adopt ${adoptionCheck.remainingSlots} more pet(s)`
                : `You have reached your limit of ${adoptionCheck.limit} pets`
        });
    } catch (err) {
        console.error('Error getting adoption limit status:', err);
        res.status(500).json({ message: 'Failed to get adoption limit status' });
    }
};
