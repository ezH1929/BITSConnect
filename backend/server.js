const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const Post = require('./models/post');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "https://bits-connect.vercel.app/",  // Ensure this matches the front-end URL
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'https://bits-connect.vercel.app/',
  credentials: true
}));
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per window
});
app.use(limiter);

// MongoDB Connection
mongoose.connect(process.env.ATLAS_URI).then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/group')(io); // Pass io instance to group routes
const userRoutes = require('./routes/user');
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('joinRoom', ({ groupId }) => {
      socket.join(groupId);
      console.log(`Socket ${socket.id} joined room ${groupId}`);
  });

  socket.on('sendMessage', async (data, callback) => {
    console.log("Received data for new post:", data);
    const { text, groupId, userId } = data;
    if (!userId) {
        console.error("UserID is undefined or null");
        callback("UserID is required");
        return;
    }
    try {
        const newPost = new Post({
            text,
            group: groupId,
            createdBy: userId
        });
        const savedPost = await newPost.save();
        const populatedPost = await Post.findById(savedPost._id).populate('createdBy', 'username');
        io.to(groupId).emit('newPost', populatedPost);
        callback('Message sent and saved');
    } catch (error) {
        console.error('Error saving post:', error);
        callback(`Error saving message: ${error.message}`);
    }
});


  socket.on('disconnect', () => {
      console.log('Client disconnected');
  });
});


