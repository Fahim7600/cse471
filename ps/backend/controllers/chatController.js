const Chat = require('../models/Chat');
const PetProfile = require('../models/PetProfile');
const User = require('../models/User');

// Check if chat exists for a pet (without creating it)
const checkChatExists = async (req, res) => {
    try {
        const { petId } = req.params;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Get pet details to find owner
        const pet = await PetProfile.findById(petId).populate('owner', 'name email');
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        if (!pet.owner) {
            return res.status(404).json({ message: 'Pet owner not found' });
        }

        // Check if chat already exists
        const existingChat = await Chat.findOne({
            petId,
            participants: { $all: [userId, pet.owner._id] }
        });

        res.json({
            success: true,
            chatExists: !!existingChat,
            chatId: existingChat?._id,
            pet: {
                _id: pet._id,
                name: pet.name,
                image: pet.image,
                breed: pet.breed,
                gender: pet.gender,
                age: pet.age
            },
            owner: {
                _id: pet.owner._id,
                name: pet.owner.name,
                email: pet.owner.email
            }
        });

    } catch (error) {
        console.error('Error checking chat existence:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get or create a chat for a specific pet
const getOrCreateChat = async (req, res) => {
    try {
        const { petId } = req.params;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Get pet details to find owner
        const pet = await PetProfile.findById(petId).populate('owner');
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        // Check if chat already exists
        let chat = await Chat.findOne({
            petId,
            participants: { $all: [userId, pet.owner._id] }
        }).populate('participants', 'name email')
          .populate('messages.sender', 'name email');

        if (!chat) {
            // Create new chat
            chat = new Chat({
                petId,
                participants: [userId, pet.owner._id],
                messages: []
            });
            await chat.save();
            await chat.populate('participants', 'name email');
        }

        res.json({
            success: true,
            chat: {
                _id: chat._id,
                petId: chat.petId,
                participants: chat.participants,
                messages: chat.messages,
                lastMessage: chat.lastMessage
            }
        });

    } catch (error) {
        console.error('Error getting/creating chat:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific chat by chatId
const getChatById = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        }).populate('participants', 'name email')
          .populate('messages.sender', 'name email')
          .populate('petId', 'name image breed gender age owner');

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        res.json({
            success: true,
            chat: {
                _id: chat._id,
                petId: chat.petId,
                participants: chat.participants,
                messages: chat.messages,
                lastMessage: chat.lastMessage
            }
        });

    } catch (error) {
        console.error('Error getting chat:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all chats for a user
const getUserChats = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const chats = await Chat.find({
            participants: userId,
            isActive: true
        })
        .populate('participants', 'name email')
        .populate('petId', 'name image breed gender age')
        .populate('lastMessage.sender', 'name')
        .sort({ 'lastMessage.timestamp': -1 });

        res.json({
            success: true,
            chats
        });

    } catch (error) {
        console.error('Error getting user chats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get messages for a specific chat
const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        }).populate('messages.sender', 'name email');

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        res.json({
            success: true,
            messages: chat.messages
        });

    } catch (error) {
        console.error('Error getting chat messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        await Chat.updateOne(
            { 
                _id: chatId,
                participants: userId,
                'messages.sender': { $ne: userId }
            },
            { 
                $set: { 'messages.$[elem].read': true }
            },
            {
                arrayFilters: [{ 'elem.sender': { $ne: userId } }]
            }
        );

        res.json({ success: true, message: 'Messages marked as read' });

    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    checkChatExists,
    getOrCreateChat,
    getChatById,
    getUserChats,
    getChatMessages,
    markMessagesAsRead
};
