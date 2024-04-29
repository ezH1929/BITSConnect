const express = require('express');
const router = express.Router();
const Group = require('../models/group.model');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Route to create a new group
router.post('/groups', authMiddleware, async (req, res) => {
    const { name, description, maxMembers } = req.body;
    const admin = req.user.id;

    // Validate input data
    if (!name || !description || typeof maxMembers !== 'number' || maxMembers < 1) {
        return res.status(400).json({ message: "Invalid data provided. Please check name, description, and maxMembers." });
    }

    // Validate the createdBy field to be a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(admin)) {
        return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const newGroup = new Group({
        name,
        description,
        maxMembers,
        admin, // This should be the ID of the user creating the group
        members: [admin] // Starts with an empty members array
    });

    try {
        const savedGroup = await newGroup.save();
        res.status(201).json(savedGroup);
    } catch (error) {
        res.status(500).json({ message: "Failed to save group: " + error.message });
    }
});

// Route to get groups with pagination
router.get('/groups', authMiddleware, async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Default page 1 and limit 10

    try {
        const groups = await Group.find()
                                  .limit(limit * 1)
                                  .skip((page - 1) * limit)
                                  .exec();

        const count = await Group.countDocuments();
        res.status(200).json({
            groups,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch groups: " + error.message });
    }
});

// Route to join a group
router.post('/groups/:groupId/join', authMiddleware, async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id; // Ensure you're using _id if that's what's stored in JWT

    try {
        // Validate groupId for correct format
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "Invalid group ID format" });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Using the joinGroup method to encapsulate logic
        const updatedGroup = await group.joinGroup(userId);
        if (updatedGroup instanceof Error) {
            throw updatedGroup;  // If joinGroup method returns an error, throw it to catch block
        }

        res.status(200).json({ message: "Joined the group successfully", group: updatedGroup });
    } catch (error) {
        res.status(500).json({ message: "Failed to join group: " + error.message });
    }
});





// Route to access a specific group's details
router.get('/groups/:groupId', authMiddleware, async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    try {
        const group = await Group.findById(groupId)
                                 .populate('members', '_id name'); // Ensure you are loading member IDs or relevant fields

        // Check if the user is a member of the group
        if (!group.members.some(member => member._id.equals(userId))) {
            return res.status(403).json({ message: "Access denied. Not a member of the group." });
        }

        res.json(group);
    } catch (error) {
        res.status(404).json({ message: "Group not found." });
    }
});

const Post = require('../models/post');

router.post('/groups/:groupId/posts', authMiddleware, async (req, res) => {
    const { text } = req.body;
    const { groupId } = req.params;
    const post = new Post({
        text,
        group: groupId,
        createdBy: req.user.id
    });

    try {
        await post.save();
        res.status(201).send(post);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.get('/groups/:groupId/posts', authMiddleware, async (req, res) => {
    try {
        const { groupId } = req.params;
        const posts = await Post.find({ group: groupId }).sort({ createdAt: -1 }).populate('createdBy', 'username'); // Fetch posts sorted by creation date
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch group posts: " + error.message });
    }
});

module.exports = router;
