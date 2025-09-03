const express = require('express');
const router = express.Router();
const LostOrFound = require('../controllers/lostorfoundController');



// Report a pet as lost
router.post('/report-lost/:petId', LostOrFound.reportLostPet)

// Get all lost pets
router.get('/lost-pets', LostOrFound.getLostPets);

// Mark a pet as found
router.post('/mark-found/:reportId', LostOrFound.markPetAsFound);

router.post('/reports/:reportId/comments', LostOrFound.addcomment);
router.get('/reports/:reportId/comments', LostOrFound.getcomment);








module.exports = router;