const express = require('express');
const router = express.Router();
const petProfileController = require('../controllers/petRouteController');
 // Ensure this file exists and is correctly implemented


// Add vaccination details to existing pet profile 
router.post('/add-vaccination/:petId', petProfileController.addvaccination)

// Edit vaccination details
router.put('/edit-vaccination/:petId/:vaccinationId', petProfileController.updatevaccination);

// Delete vaccination
router.delete('/delete-vaccination/:petId/:vaccinationId', petProfileController.deletevaccination);

// Add or update vet appointment details
router.post('/add-vet-appointment/:petId', petProfileController.addvetappointment);

// Edit vet appointment details 
router.put('/edit-vet-appointment/:petId/:appointmentId', petProfileController.updateVetAppointment);

// Delete vet appointment
router.delete('/delete-vet-appointment/:petId/:appointmentId', petProfileController.deleteVetAppointment);

// Add a health log entry to a pet 
router.post('/add-health-log/:petId', petProfileController.addHealthLog);

// Get all health logs for a pet
router.get('/health-logs/:petId', petProfileController.getHealthLogs);
// Get health log for a pet by date 
router.get('/health-log/:petId/:date', petProfileController.getHealthLogByDate);




// Add pet profile 
router.post('/add-pet', petProfileController.upload.single('petImage'), petProfileController.addpet);

router.get('/pets', petProfileController.getAllPets); // Get all pets  

router.get('/user-pets', petProfileController.getAllPets); // Get user's pets (alternative route)

router.get('/pets/:id', petProfileController.getPetById); // Get pet by ID

router.get('/pet/:id', petProfileController.getPetById); // Get pet by ID (alternative route)

// Delete pet profile 
router.delete('/delete-pet/:petId', petProfileController.deletepet);

// Update existing pet details 
router.put('/update-pet/:petId', petProfileController.updatePet);


// Update walking data for a pet 
router.post('/update-walking-data/:petId', petProfileController.updatewalkingData);
// Reset walking data for a pet 
router.post('/reset-walking-data/:petId', petProfileController.resetWalkingData);


module.exports = router;
