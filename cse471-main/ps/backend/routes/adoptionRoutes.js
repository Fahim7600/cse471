const express = require('express');
const router = express.Router();
const adoptionController = require('../controllers/adoptionController');

const { isAdmin } = require('../middleware/authMiddleware');



// POST: Request Adoption (for pet owners to add/remove pets from adoption list)
router.post('/request-adoption/:petId', adoptionController.requestAdoption);

// POST: Request Pet Adoption (for users to request adoption from owners)
router.post('/request-pet-adoption/:petId', adoptionController.requestPetAdoption);

// Legacy routes for backward compatibility (if needed)
router.post('/request/:petId', adoptionController.requestPetAdoption); // Maps to existing function
router.get('/request', adoptionController.getPendingAdoptions); // Maps to existing function  
router.put('/request/:requestId', adoptionController.reviewAdoption); // Maps to existing function

// GET: pending pets (For staff)
router.get('/pending-adoptions', isAdmin, adoptionController.getPendingAdoptions);

// GET: adoption requests for pet owner
router.get('/owner-adoption-requests', adoptionController.getOwnerAdoptionRequests);

router.get('/available-adoptions', adoptionController.getAvailableAdoptions);

// POST: Approve or Reject Request (For pet owners)
router.post('/review-adoption/:requestId', adoptionController.reviewAdoption);

// POST: Cleanup adoption requests (Admin only)
router.post('/cleanup-adoption-requests', isAdmin, adoptionController.cleanupAdoptionRequests);

// GET: Check user's adoption limit status
router.get('/adoption-limit-status', adoptionController.getAdoptionLimitStatus);

module.exports = router;
