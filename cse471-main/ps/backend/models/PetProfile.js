const mongoose = require('mongoose');
const { Schema } = mongoose;

const petProfileSchema = new Schema({
    name: { type: String, required: true },
    dob: { type: Date, required: true }, // Date of Birth
    age: { type: Number }, // Auto-calculated age
    breed: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    image: { type: String },
    description: { type: String },
    vaccinations: [{
        vaccineName: { type: String, required: true },
        date: { type: Date, required: true },
        notes: { type: String }
    }],
    vetAppointments: [{
        doctorName: { type: String },
        address: { type: String },
        dateOfAppointment: { type: Date },
        notes: { type: String },
    }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalWalkedHours: { type: Number, default: 0 },
    avgWalkedHours: { type: Number, default: 0 },
    totalWalkedDistance: { type: Number, default: 0 },
    avgWalkedDistance: { type: Number, default: 0 },
    healthLogs: [{
        date: { type: Date, required: true },
        weight: { type: Number, required: true },
        diet: { type: String, required: true },
        medicalNotes: { type: String }
    }],
    adoptionStatus: { type: String, enum: ['available', 'pending', 'approved', 'rejected', 'adopted'], default: 'available' }
}, { timestamps: true });

// Middleware to calculate age before saving
petProfileSchema.pre('save', function (next) {
    if (this.dob) {
        const ageDiffMs = Date.now() - new Date(this.dob).getTime();
        const ageDate = new Date(ageDiffMs);
        this.age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }
    next();
});

const PetProfile = mongoose.model('PetProfile', petProfileSchema);

module.exports = PetProfile;