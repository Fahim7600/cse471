const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    // email: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isAdmin: { type: Boolean, default: false },
    contactInfo: String,
    image: String,
    documents: String,
    isVerified: { type: Boolean, default: false },
    petIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PetProfile' }], // Array to store pet object IDs
    profilePicture: {
        type: String,
        default: ''
    },
    banned: {
        type: Boolean,
        default: false
    },
    location: {
        address: {
            type: String,
            default: ''
        },
        latitude: {
            type: Number,
            default: null
        },
        longitude: {
            type: Number,
            default: null
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);