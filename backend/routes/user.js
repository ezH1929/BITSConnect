const express = require('express');
const router = express.Router();
const User = require('../models/user');  // Ensure this path correctly points to your User model file

// Import the authMiddleware correctly
const authMiddleware = require('../middleware/authMiddleware');
console.log("Middleware defined: ", authMiddleware);
// GET user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        // Using the ID from decoded token to find the user
        console.log("UserID from token:", req.user.id);
        const userId = req.user.id; // Access the user ID from the decoded token directly
        const user = await User.findById(userId); // Use userId to find the user in the database
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);  // Send the user information as JSON
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// POST update user profile
router.post('/update', authMiddleware, async (req, res) => {
    try {
        const { name, email } = req.body;
        // Update the user's name and email based on their ID, and return the new document
        const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true });
        // Note: findByIdAndUpdate will return the user *before* the update is applied
        // You should check if the user exists *after* the update is applied
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
