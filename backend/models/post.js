// In your post model file (e.g., post.model.js)

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true  // Ensures text has no leading or trailing whitespace
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
        index: true  // Improves query performance for posts by group
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true  // Improves query performance for posts by user
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true  // May improve sorting by creation date
    }
});




module.exports = mongoose.model('Post', postSchema);
