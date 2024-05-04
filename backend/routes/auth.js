const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth'); // Admin authorization middleware

// POST endpoint to create a new admin
router.post('/create-admin', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({
            username,
            email,
            password, // In production, you should hash the password before storing it
            isAdmin: true // Set the isAdmin flag to true
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        // Save user
    
        await newUser.save();
        res.status(201).send({ message: 'Admin user created successfully', user: newUser });
    } catch (error) {
        res.status(500).send({ message: 'Failed to create admin user', error: error });
    }
});



// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // Create a new user
        user = new User({
            username,
            email,
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();

        res.status(201).json({ msg: "User registered successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }

        

        jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            // Exclude password and possibly other sensitive details
            const { password, ...userData } = user.toObject();
            res.json({
                token,
                user: userData,
                isAdmin: user.isAdmin
                 // Sending back user data except the password
            });
        });
        

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
