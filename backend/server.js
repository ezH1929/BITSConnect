const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet()); // Secure your Express apps by setting various HTTP headers
app.use(bodyParser.json()); // Parse JSON bodies (alternative to express.json())

const corsOptions = {
  origin: 'http://localhost:3000',  // This should match the URL of your frontend application
  optionsSuccessStatus: 200 // For legacy browser support
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per window
});
app.use(limiter);

// MongoDB Connection
console.log("URI from .env:", process.env.ATLAS_URI);
mongoose.connect(process.env.ATLAS_URI);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// Routes
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/group'); // Ensure this is declared and required properly
const userRoutes = require('./routes/user'); 
const authMiddleware = require('./middleware/authMiddleware')
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes); // Group routes handle all '/api/groups' endpoints
app.use('/api/users', userRoutes);
app.use(authMiddleware);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
