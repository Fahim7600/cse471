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
const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173', 
            'http://localhost:5174',
            'https://cse471-dtjw.vercel.app',
            'https://cse471-three.vercel.app'
        ],
        methods: ['GET', 'POST'],
        credentials: true
    }
});


app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:5174',
        'https://cse471-dtjw.vercel.app',
        'https://cse471-three.vercel.app'
    ], // Allow both localhost and Vercel domains
    credentials: true // Allow cookies (sessions) to be sent
}));
// app.use(cors());

app.use(express.json())
// app.use(cors());




// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
// app.use(session({
//     secret: 'secretKey',
//     resave: false,
//     saveUninitialized: true
// }));
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true in production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 30 // 30 minutes
    }
}));



// MongoDB Connection
// mongodb+srv://petsphere:<db_password>@petsphere.tgznjun.mongodb.net/?retryWrites=true&w=majority&appName=petsphere
mongoose.connect('mongodb+srv://petsphere:123@petsphere.tgznjun.mongodb.net/petsphere?retryWrites=true&w=majority&appName=petsphere')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Health check route for Railway
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/', require('./routes/authRoutes'));

app.get('/', (req, res) => {
    res.render('index');
});

// adoption
app.use('/', require('./routes/adoptionRoutes'));


app.use('/', require('./routes/petRoutes'));

const notificationRoutes = require('./routes/Notification');
app.use('/api/notifications', notificationRoutes);
const lostorfoundRoutes = require('./routes/lostorfoundRoutes');
app.use('/', lostorfoundRoutes);

app.use('/', require('./routes/profileRoutes'));
// app.use('/api/user', require('./routes/profileRoutes'));

app.use('/api/reviews', require('./routes/reviewRoutes')); //rupom

app.use('/', require('./routes/dashboardRoutes'));
app.use((req, res, next) => {
    if (req.session.userId) {
        req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes
    }
    next();
});

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

const adminReviewRoutes = require('./routes/adminReviewRoutes');
app.use('/admin', adminReviewRoutes);

const chatRoutes = require('./routes/chatRoutes');
app.use('/api', chatRoutes);

// User info route
app.get('/user-info', (req, res) => {
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


// Socket.IO connection handling
const Chat = require('./models/Chat');
const User = require('./models/User');

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a chat room for a specific pet
    socket.on('join-chat', async (data) => {
        const { petId, userId, chatId } = data;
        
        try {
            let chat;
            
            if (chatId) {
                // If chatId is provided, use it directly
                chat = await Chat.findById(chatId);
            } else {
                // Find the specific chat for this user and pet
                const PetProfile = require('./models/PetProfile');
                const pet = await PetProfile.findById(petId).populate('owner');
                
                if (!pet) {
                    console.log(`Pet not found: ${petId}`);
                    return;
                }
                
                if (!pet.owner) {
                    console.log(`Pet owner not found or deleted for pet: ${petId}`);
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
                console.log(`User ${userId} joined chat ${chat._id} for pet ${petId}`);
                
                // Emit confirmation back to the client
                socket.emit('joined-chat', { 
                    chatId: chat._id, 
                    roomId: roomId,
                    success: true 
                });
            } else {
                console.log(`No chat found for user ${userId} and pet ${petId}`);
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

    // Handle sending messages
    socket.on('send-message', async (data) => {
        try {
            const { petId, senderId, content, chatId } = data;

            let chat;
            
            if (chatId) {
                // If chatId is provided, find the chat directly
                chat = await Chat.findById(chatId);
            } else {
                // Find or create chat with proper participants
                const PetProfile = require('./models/PetProfile');
                const pet = await PetProfile.findById(petId).populate('owner');
                
                if (!pet) {
                    console.error('Pet not found');
                    socket.emit('message-error', { error: 'Pet not found' });
                    return;
                }
                
                if (!pet.owner) {
                    console.error('Pet owner not found or deleted for pet:', petId);
                    socket.emit('message-error', { error: 'Pet owner not found' });
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
                console.error('Chat not found and could not be created');
                socket.emit('message-error', { error: 'Chat not found' });
                return;
            }

            // Add message to chat
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
            
            // Use the specific chat room
            const roomId = `chat-${chat._id}`;

            // Make sure sender is in the room
            if (!socket.rooms.has(roomId)) {
                socket.join(roomId);
                socket.chatId = chat._id;
                console.log(`Auto-joined user ${senderId} to room ${roomId}`);
            }

            // Populate sender info for the response
            await chat.populate('messages.sender', 'name email');
            const populatedMessage = chat.messages[chat.messages.length - 1];

            // Emit message to all users in the room
            io.to(roomId).emit('new-message', {
                _id: populatedMessage._id,
                sender: populatedMessage.sender,
                content: populatedMessage.content,
                timestamp: populatedMessage.timestamp,
                petId,
                chatId: chat._id
            });

            console.log(`Message sent to room ${roomId}: ${content}`);

        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('message-error', { error: 'Failed to send message' });
        }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
        const { petId, userId, isTyping } = data;
        const roomId = `chat-${socket.chatId}`;
        socket.to(roomId).emit('user-typing', { userId, isTyping });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Make io available to routes
app.set('io', io);

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Start the reminder service
    startReminderService();
    console.log('Reminder service started');
});