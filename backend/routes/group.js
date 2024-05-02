const express = require('express');
const router = express.Router();
const Group = require('../models/group.model');
const Post = require('../models/post');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Route to create a new group
router.post('/groups', authMiddleware, async (req, res) => {
    const { name, description, maxMembers } = req.body;
    const admin = req.user.id;

    if (!name || !description || typeof maxMembers !== 'number' || maxMembers < 1) {
        return res.status(400).json({ message: "Invalid data provided. Please check name, description, and maxMembers." });
    }
    
    if (!mongoose.Types.ObjectId.isValid(admin)) {
        return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const newGroup = new Group({
        name,
        description,
        maxMembers,
        admin,
        members: [admin]
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
    const { page = 1, limit = 10 } = req.query;
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
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({ message: "Invalid group ID format" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
        return res.status(404).json({ message: "Group not found" });
    }

    const updatedGroup = await group.joinGroup(userId);
    if (updatedGroup instanceof Error) {
        throw updatedGroup;
    }

    res.status(200).json({ message: "Joined the group successfully", group: updatedGroup });
});

// Route to access a specific group's details
router.get('/groups/:groupId', authMiddleware, async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId).populate('members', '_id name');
    if (!group.members.some(member => member._id.equals(userId))) {
        return res.status(403).json({ message: "Access denied. Not a member of the group." });
    }

    res.json(group);
});

// Socket.IO routes for posts within a group
module.exports = function(io) {

    router.post('/groups/:groupId/posts', authMiddleware, async (req, res) => {
        const { text } = req.body;
        const { groupId } = req.params;
        const userId = req.user.id;

        const newPost = new Post({
            text,
            createdBy: userId,
            group: groupId
        });

        try {
            const savedPost = await newPost.save();
            const populatedPost = await savedPost.populate('createdBy', 'username').execPopulate(); // Populate createdBy with relevant fields
    
            io.to(groupId).emit('newPost', populatedPost);  // Emit the populated post data
            res.status(201).json(populatedPost);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    router.get('/groups/:groupId/posts', authMiddleware, async (req, res) => {
        const { groupId } = req.params;
        const posts = await Post.find({ group: groupId }).populate('createdBy', 'username');
        res.status(200).json(posts);
    });

    return router;
};
