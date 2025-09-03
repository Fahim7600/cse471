const mongoose = require('mongoose');
const { Schema } = mongoose;

// console.log(Schema, 'Schema')

const adoptionRequestSchema = new Schema({
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'PetProfile', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Pet owner ID for easier filtering
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date }
});

module.exports = mongoose.model('AdoptionRequest', adoptionRequestSchema);
