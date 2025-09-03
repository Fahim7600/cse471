const PetProfile = require('../models/PetProfile.js'); // Ensure this file exists and is correctly implemented
const User = require('../models/User'); // Ensure this file exists and is correctly implemented
const Notification = require('../models/Notification'); // Ensure this file exists and is correctly implemented
const AdoptionRequest = require('../models/AdoptionRequest');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/pets/'); // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'pet-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Export the upload middleware for use in routes
exports.upload = upload;




const createNotification = async (userId, message, type = 'info') => {
    const notification = new Notification({
        userId,
        message,
        type
    });
    await notification.save();
};





  exports.addvaccination = async (req, res) => {
    const petId = req.params.petId;
    const { vaccineName, date, notes } = req.body;
  
    try {
        const pet = await PetProfile.findById(petId);
        if (!pet) return res.status(404).json({ message: 'Pet not found' });
  
        pet.vaccinations.push({ vaccineName, date, notes });
  
        const updatedPet = await pet.save();
        await createNotification(pet.owner, ` ${pet.name}'s vaccination added.`);
  
        res.status(201).json({ message: 'Vaccination added', pet: updatedPet });
    } catch (err) {
        console.error('Error adding vaccination:', err);
        res.status(500).json({ message: 'Failed to add vaccination', error: err });
    }
  }


  exports.updatevaccination = async (req, res) => {
    const { petId, vaccinationId } = req.params;
    const { vaccineName, date, notes } = req.body;

    try {
        console.log(`Editing vaccination for petId: ${petId}, vaccinationId: ${vaccinationId}`); // Log IDs

        const pet = await PetProfile.findById(petId);
        if (!pet) {
            console.error(`Pet not found for ID: ${petId}`); // Log if pet not found
            return res.status(404).json({ message: 'Pet not found' });
        }

        const vaccination = pet.vaccinations.id(vaccinationId);
        if (!vaccination) {
            console.error(`Vaccination not found for ID: ${vaccinationId}`); // Log if vaccination not found
            return res.status(404).json({ message: 'Vaccination not found' });
        }

        vaccination.vaccineName = vaccineName || vaccination.vaccineName;
        vaccination.date = date || vaccination.date;
        vaccination.notes = notes || vaccination.notes;

        const updatedPet = await pet.save();
        console.log('Updated pet after vaccination edit:', updatedPet); // Log the updated pet details

        res.status(200).json({ message: 'Vaccination updated successfully', pet: updatedPet });
    } catch (err) {
        console.error('Error updating vaccination:', err); // Log the error
        res.status(500).json({ message: 'Failed to update vaccination', error: err });
    }
}



exports.deletevaccination =async (req, res) => {
    const { petId, vaccinationId } = req.params;

    try {
        console.log(`Attempting to delete vaccination with ID: ${vaccinationId} for pet ID: ${petId}`);

        const pet = await PetProfile.findById(petId);
        if (!pet) {
            console.error(`Pet not found for ID: ${petId}`);
            return res.status(404).json({ message: 'Pet not found' });
        }

        const vaccination = pet.vaccinations.id(vaccinationId);
        if (!vaccination) {
            console.error(`Vaccination not found for ID: ${vaccinationId}`);
            return res.status(404).json({ message: 'Vaccination not found' });
        }

        // Allow deletion of any vaccination record
        const updatedVaccinations = pet.vaccinations.filter(
            (vaccination) => vaccination._id.toString() !== vaccinationId
        );

        pet.vaccinations = updatedVaccinations;
        const updatedPet = await pet.save();
        console.log('Updated pet after vaccination deletion:', updatedPet);

        res.status(200).json({ message: 'Vaccination deleted successfully', pet: updatedPet });
    } catch (err) {
        console.error('Error deleting vaccination:', err);
        res.status(500).json({ message: 'Failed to delete vaccination', error: err });
    }
}


exports.addvetappointment = async (req, res) => {
    const petId = req.params.petId;
    const { doctorName, address, dateOfAppointment, notes } = req.body; // Include notes
  
    try {
        const pet = await PetProfile.findById(petId);
        if (!pet) return res.status(404).json({ message: 'Pet not found' });
  
        const newAppointment = { doctorName, address, dateOfAppointment, notes };
        pet.vetAppointments.push(newAppointment);
  
        const updatedPet = await pet.save();
        await createNotification(pet.owner, ` ${pet.name}'s vet appointment added.`)
        res.status(201).json({ message: 'Vet appointment added', pet: updatedPet });
    } catch (err) {
        console.error('Error adding vet appointment:', err);
        res.status(500).json({ message: 'Failed to add vet appointment', error: err });
    }
  }




  exports.updateVetAppointment = async (req, res) => {
    const { petId, appointmentId } = req.params;
    const { doctorName, address, dateOfAppointment, notes } = req.body;

    console.log(`Editing appointment for petId: ${petId}, appointmentId: ${appointmentId}`); // Log pet and appointment IDs
    console.log('Request body:', req.body); // Log the incoming request body

    try {
        const pet = await PetProfile.findById(petId);
        if (!pet) {
            console.error(`Pet not found for ID: ${petId}`); // Log if pet not found
            return res.status(404).json({ message: 'Pet not found' });
        }

        const appointment = pet.vetAppointments.id(appointmentId);
        if (!appointment) {
            console.error(`Appointment not found for ID: ${appointmentId}`); // Log if appointment not found
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.doctorName = doctorName || appointment.doctorName;
        appointment.address = address || appointment.address;
        appointment.dateOfAppointment = dateOfAppointment || appointment.dateOfAppointment;
        appointment.notes = notes || appointment.notes;

        const updatedPet = await pet.save();
        console.log('Updated pet:', updatedPet); // Log the updated pet details

        res.status(200).json({ message: 'Appointment updated successfully', pet: updatedPet });
    } catch (err) {
        console.error('Error updating appointment:', err); // Log the error
        res.status(500).json({ message: 'Failed to update appointment', error: err });
    }
}


exports.deleteVetAppointment =async (req, res) => {
    const { petId, appointmentId } = req.params;

    try {
        console.log(`Attempting to delete appointment with ID: ${appointmentId} for pet ID: ${petId}`);

        const pet = await PetProfile.findById(petId);
        if (!pet) {
            console.error(`Pet not found for ID: ${petId}`);
            return res.status(404).json({ message: 'Pet not found' });
        }

        const appointment = pet.vetAppointments.id(appointmentId);
        if (!appointment) {
            console.error(`Appointment not found for ID: ${appointmentId}`);
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if the appointment date has passed - only allow deletion of future appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const appointmentDate = new Date(appointment.dateOfAppointment);
        appointmentDate.setHours(0, 0, 0, 0);

        if (appointmentDate < today) {
            return res.status(403).json({ 
                message: 'Cannot delete past appointments',
                appointmentDate: appointmentDate
            });
        }

        const updatedAppointments = pet.vetAppointments.filter(
            (appointment) => appointment._id.toString() !== appointmentId
        );

        pet.vetAppointments = updatedAppointments;
        const updatedPet = await pet.save();
        console.log('Updated pet after deletion:', updatedPet);

        res.status(200).json({ message: 'Appointment deleted successfully', pet: updatedPet });
    } catch (err) {
        console.error('Error deleting appointment:', err);
        res.status(500).json({ message: 'Failed to delete appointment', error: err });
    }
}






exports.addHealthLog = async (req, res) => {
    const { petId } = req.params;
    const { date, weight, diet, medicalNotes } = req.body;
    try {
        const pet = await PetProfile.findById(petId);
        if (!pet) return res.status(404).json({ message: 'Pet not found' });
        pet.healthLogs.push({ date, weight, diet, medicalNotes });
        const updatedPet = await pet.save();
        res.status(201).json({ message: 'Health log added', pet: updatedPet });
    } catch (err) {
        console.error('Error adding health log:', err);
        res.status(500).json({ message: 'Failed to add health log', error: err });
    }
}


exports.getHealthLogs =async (req, res) => {
    const { petId } = req.params;
    try {
        const pet = await PetProfile.findById(petId);
        if (!pet) return res.status(404).json({ message: 'Pet not found' });
        res.status(200).json({ healthLogs: pet.healthLogs });
    } catch (err) {
        console.error('Error fetching health logs:', err);
        res.status(500).json({ message: 'Failed to fetch health logs', error: err });
    }
}


exports.getHealthLogByDate = async (req, res) => {
    const { petId, date } = req.params;
    try {
        const pet = await PetProfile.findById(petId);
        if (!pet) return res.status(404).json({ message: 'Pet not found' });
        const log = pet.healthLogs.find(l => new Date(l.date).toISOString().slice(0,10) === new Date(date).toISOString().slice(0,10));
        if (!log) return res.status(404).json({ message: 'Health log not found for this date' });
        res.status(200).json({ healthLog: log });
    } catch (err) {
        console.error('Error fetching health log by date:', err);
        res.status(500).json({ message: 'Failed to fetch health log', error: err });
    }
}


exports.addpet= async (req, res) => {
    try {
        console.log('=== ADD PET REQUEST ===');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        console.log('Session info:', req.session);
        
        const { name, dob, breed, gender, imageUrl, description, owner } = req.body;
        
        // Handle image - either from file upload or URL
        let image = imageUrl; // Default to URL if provided
        if (req.file) {
            // If file was uploaded, use the file path
            image = `/uploads/pets/${req.file.filename}`;
            console.log('Using uploaded file:', image);
        } else if (imageUrl) {
            console.log('Using image URL:', imageUrl);
        }
  
        console.log('Creating pet with data:', { name, dob, breed, gender, image, description, owner });
        
        const newPet = new PetProfile({ name, dob, breed, gender, image, description, owner });
        const savedPet = await newPet.save();
        console.log('Pet saved successfully:', savedPet._id);
  
        // Update user's petIds array
        await User.findByIdAndUpdate(owner, { $push: { petIds: savedPet._id } });
        console.log('Updated user petIds for owner:', owner);
  
        await createNotification(owner, `a new pet ${savedPet.name} added.`);
        console.log('Notification created for owner:', owner);
  
        res.status(201).json({ message: 'Pet profile created', pet: savedPet });
    } catch (error) {
        console.error('Error creating pet profile:', error);
        res.status(500).json({ error: 'Failed to create pet profile', details: error.message });
    }
  }
  
  
  
exports.getAllPets = async (req, res) => {
    if (!req.session.userId || req.session.role !== 'user') {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const pets = await PetProfile.find({ owner: req.session.userId });

        // Calculate and format age for each pet
        const formattedPets = pets.map(pet => {
            const birthDate = new Date(pet.dob);
            const today = new Date();
            let years = today.getFullYear() - birthDate.getFullYear();
            let months = today.getMonth() - birthDate.getMonth();
            if (months < 0) {
                years--;
                months += 12;
            }
            const formattedAge = years > 0 ? `${years} years ${months} months` : `${months} months`;
            return { ...pet.toObject(), age: formattedAge };
        });

        res.status(200).json(formattedPets);
    } catch (err) {
        console.error('Error fetching pets:', err);
        res.status(500).json({ message: 'Failed to load pets' });
    }
}

exports.getPetById = async (req, res) => {
    try {
        console.log(`Fetching pet with ID: ${req.params.id}`); // Log the pet ID
        const pet = await PetProfile.findById(req.params.id).populate('owner', 'name email');
        if (!pet) {
            console.error(`Pet not found for ID: ${req.params.id}`); // Log if pet not found
            return res.status(404).json({ message: 'Pet not found' });
        }
        console.log(`Pet found:`, pet); // Log the pet details
        res.json(pet);
    } catch (err) {
        console.error(`Error fetching pet with ID: ${req.params.id}`, err); // Log the error
        res.status(500).json({ message: 'Server error' });
    }
}



// tarek

// tarek
exports. deletepet= async (req, res) => {
    try {
        const { petId } = req.params;

        // Remove the pet from the PetProfile collection
        const pet = await PetProfile.findByIdAndDelete(petId);
        if (!pet) {
            return res.status(404).json({ error: 'Pet not found' });
        }

        // Remove the pet ID from the petIds array in the User schema
        await User.updateMany(
            { petIds: petId },
            { $pull: { petIds: petId } }
        );

        // delete pet logic from adoption extend part
        // Remove all adoption requests for this pet
        await AdoptionRequest.deleteMany({ petId });

        await createNotification(pet.owner, ` ${pet.name} removed.`);

        res.status(200).json({ message: 'Pet profile deleted', pet });
    } catch (error) {
        console.error('Error deleting pet profile:', error);
        res.status(500).json({ error: 'Failed to delete pet profile' });
    }
}




// tarek
exports.updatePet = async (req, res) => {
    const petId = req.params.petId;
    const { name, dob, breed, description, image, vetAppointments } = req.body;
  
    try {
        const pet = await PetProfile.findById(petId);
        if (!pet) return res.status(404).json({ message: 'Pet not found' });
  
        pet.name = name || pet.name;
        pet.dob = dob || pet.dob;
        pet.breed = breed || pet.breed;
        pet.description = description || pet.description;
        pet.image = image || pet.image;
  
        if (vetAppointments) {
            vetAppointments.forEach((appointment) => {
                const existingAppointment = pet.vetAppointments.find(
                    (a) => a._id && a._id.toString() === appointment._id
                );
                if (existingAppointment) {
                    existingAppointment.doctorName = appointment.doctorName;
                    existingAppointment.address = appointment.address;
                    existingAppointment.dateOfAppointment = appointment.dateOfAppointment;
                } else {
                    pet.vetAppointments.push(appointment);
                }
            });
        }
  
        const updatedPet = await pet.save();
        await createNotification(pet.owner, `${pet.name}'s profile updated.`);
  
        res.status(200).json({ message: 'Pet profile updated', pet: updatedPet });
    } catch (err) {
        console.error('Error updating pet profile:', err);
        res.status(500).json({ message: 'Failed to update pet profile', error: err });
    }
  }


// naimur
// naimur
exports.updatewalkingData = async (req, res) => {
    const { petId } = req.params;
    const { walkedHours, walkedDistance } = req.body;

    try {
        const pet = await PetProfile.findById(petId);
        if (!pet) return res.status(404).json({ message: 'Pet not found' });
      
        pet.totalWalkedHours = (pet.totalWalkedHours || 0) + walkedHours;
        pet.totalWalkedDistance = (pet.totalWalkedDistance || 0) + walkedDistance;
     
        pet.avgWalkedHours = pet.totalWalkedHours > 0 ? pet.totalWalkedHours / pet.totalWalkedDistance : 0;
        pet.avgWalkedDistance = pet.totalWalkedDistance > 0 ? pet.totalWalkedDistance / pet.totalWalkedHours : 0;

        const updatedPet = await pet.save();
        res.status(200).json({ message: 'Walking data updated successfully', pet: updatedPet });
    } catch (err) {
        console.error('Error updating walking data:', err);
        res.status(500).json({ message: 'Failed to update walking data', error: err });
    }
}

exports.resetWalkingData = async (req, res) => {
    const { petId } = req.params;

    try {
        const pet = await PetProfile.findById(petId);
        if (!pet) return res.status(404).json({ message: 'Pet not found' });

        // Reset walking data
        pet.totalWalkedHours = 0;
        pet.avgWalkedHours = 0;
        pet.totalWalkedDistance = 0;
        pet.avgWalkedDistance = 0;

        const updatedPet = await pet.save();
        res.status(200).json({ message: 'Walking data reset successfully', pet: updatedPet });
    } catch (err) {
        console.error('Error resetting walking data:', err);
        res.status(500).json({ message: 'Failed to reset walking data', error: err });
    }
}

