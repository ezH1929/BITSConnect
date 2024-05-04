const express = require('express');
const User = require('../models/user'); // Adjust the path as per your project structure
const Group = require('../models/group.model'); // Adjust the path as per your project structure
const adminAuth = require('../middleware/adminAuth'); // Adjust the path as per your project structure
const router = new express.Router();

// List all users
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Delete a user
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).send();
        }

        res.send({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
});

// List all groups
router.get('/groups', adminAuth, async (req, res) => {
    try {
        const groups = await Group.find({});
        res.send(groups);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Delete a group
router.delete('/groups/:id', adminAuth, async (req, res) => {
    try {
        const group = await Group.findByIdAndDelete(req.params.id);

        if (!group) {
            return res.status(404).send();
        }

        res.send({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
