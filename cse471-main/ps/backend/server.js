const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { startReminderService } = require('./utils/reminderService');

const app = express();
const server = createServer(app);

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:5173', 
        'http://localhost:5174',
        'https://cse471-dtjw.vercel.app',
        'https://cse471-three.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Socket.IO with CORS
const io = new Server(server, { cors: corsOptions });

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
const { sessionMiddleware } = require('./middleware/sessionMiddleware');
app.use(sessionMiddleware);

// MongoDB Connection
mongoose.connect('mongodb+srv://petsphere:123@petsphere.tgznjun.mongodb.net/petsphere?retryWrites=true&w=majority&appName=petsphere')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Health check routes
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        port: process.env.PORT || 3000,
        timestamp: new Date().toISOString()
    });
});

app.get('/railway-status', (req, res) => {
    res.json({
        status: 'OK',
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000,
        railway: true,
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Pet Adoption API is running!',
        status: 'OK',
        port: process.env.PORT || 3000,
        timestamp: new Date().toISOString()
    });
});

// Mount routes with clear prefixes
app.use('/auth', require('./routes/authRoutes'));
app.use('/pets', require('./routes/petRoutes'));
app.use('/adoption', require('./routes/adoptionRoutes'));
app.use('/profile', require('./routes/profileRoutes'));
app.use('/dashboard', require('./routes/dashboardRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/admin', require('./routes/adminReviewRoutes'));

// API routes
app.use('/api/notifications', require('./routes/Notification'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/user-info', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const User = require('./models/User');
    User.findById(req.session.userId)
        .select('-password')
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ success: true, user });
        })
        .catch(error => {
            console.error('Error getting user info:', error);
            res.status(500).json({ message: 'Server error' });
        });
});

// Lost and found routes
app.use('/lost-found', require('./routes/lostorfoundRoutes'));

// Session middleware
app.use((req, res, next) => {
    if (req.session.userId) {
        req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes
    }
    next();
});

// Socket.IO connection handling
const Chat = require('./models/Chat');
const User = require('./models/User');

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-chat', async (data) => {
        const { petId, userId, chatId } = data;
        
        try {
            let chat;
            
            if (chatId) {
                chat = await Chat.findById(chatId);
            } else {
                const PetProfile = require('./models/PetProfile');
                const pet = await PetProfile.findById(petId).populate('owner');
                
                if (!pet || !pet.owner) {
                    socket.emit('joined-chat', { 
                        success: false, 
                        error: 'Pet or owner not found' 
                    });
                    return;
                }
                
                chat = await Chat.findOne({
                    petId,
                    participants: { $all: [userId, pet.owner._id] }
                });
            }
            
            if (chat) {
                const roomId = `chat-${chat._id}`;
                socket.join(roomId);
                socket.userId = userId;
                socket.petId = petId;
                socket.chatId = chat._id;
                
                socket.emit('joined-chat', { 
                    chatId: chat._id, 
                    roomId: roomId,
                    success: true 
                });
            } else {
                socket.emit('joined-chat', { 
                    success: false, 
                    error: 'Chat not found' 
                });
            }
        } catch (error) {
            console.error('Error in join-chat:', error);
            socket.emit('joined-chat', { 
                success: false, 
                error: 'Failed to join chat' 
            });
        }
    });

    socket.on('send-message', async (data) => {
        try {
            const { petId, senderId, content, chatId } = data;
            let chat;
            
            if (chatId) {
                chat = await Chat.findById(chatId);
            } else {
                const PetProfile = require('./models/PetProfile');
                const pet = await PetProfile.findById(petId).populate('owner');
                
                if (!pet || !pet.owner) {
                    socket.emit('message-error', { error: 'Pet or owner not found' });
                    return;
                }

                chat = await Chat.findOne({ 
                    petId, 
                    participants: { $all: [senderId, pet.owner._id] }
                });
                
                if (!chat) {
                    chat = new Chat({
                        petId,
                        participants: [senderId, pet.owner._id],
                        messages: [],
                        lastMessage: {
                            content,
                            timestamp: new Date(),
                            sender: senderId
                        }
                    });
                }
            }

            if (!chat) {
                socket.emit('message-error', { error: 'Chat not found' });
                return;
            }

            const newMessage = {
                sender: senderId,
                content,
                timestamp: new Date(),
                read: false
            };

            chat.messages.push(newMessage);
            chat.lastMessage = {
                content,
                timestamp: new Date(),
                sender: senderId
            };

            await chat.save();
            
            const roomId = `chat-${chat._id}`;
            if (!socket.rooms.has(roomId)) {
                socket.join(roomId);
                socket.chatId = chat._id;
            }

            await chat.populate('messages.sender', 'name email');
            const populatedMessage = chat.messages[chat.messages.length - 1];

            io.to(roomId).emit('new-message', {
                _id: populatedMessage._id,
                sender: populatedMessage.sender,
                content: populatedMessage.content,
                timestamp: populatedMessage.timestamp,
                petId,
                chatId: chat._id
            });

        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('message-error', { error: 'Failed to send message' });
        }
    });

    socket.on('typing', (data) => {
        const { userId, isTyping } = data;
        const roomId = `chat-${socket.chatId}`;
        socket.to(roomId).emit('user-typing', { userId, isTyping });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Make io available to routes
app.set('io', io);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ API Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route Not Found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString()
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
console.log(`Attempting to start server on port: ${PORT}`);
console.log(`Environment PORT: ${process.env.PORT}`);
console.log(`Fallback PORT: 3000`);

server.listen(PORT, () => {
    console.log(`✅ Server successfully running on port ${PORT}`);
    console.log(`🌐 Server accessible at: http://localhost:${PORT}`);
    startReminderService();
    console.log('Reminder service started');
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('Please try a different port or kill the process using this port');
    } else {
        console.error('❌ Server error:', error);
    }
});