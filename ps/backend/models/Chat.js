const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PetProfile',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        read: {
            type: Boolean,
            default: false
        }
    }],
    lastMessage: {
        content: String,
        timestamp: Date,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
chatSchema.index({ petId: 1, participants: 1 });
chatSchema.index({ 'participants': 1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
