const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const groupSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,  // Removes any leading or trailing whitespace
    unique: true, // Ensures that each group name is unique in the database
    minlength: 3 // Ensures the name has a minimum length
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10, // Minimum length for descriptions to ensure quality
    maxlength: 500 // Maximum length for descriptions to control size
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxMembers: {
    type: Number,
    required: true,
    min: 1, // Minimum number of members allowed
    max: 1000 // Maximum number of members allowed
  },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: {
    type: Date,
    default: Date.now // Automatically sets to the current date and time
  } 
  
  // Add other fields as necessary
});

groupSchema.methods.joinGroup = function(userId) {
  // Check for group capacity
  if (this.members.length >= this.maxMembers) {
      return Promise.reject(new Error("Group is already at maximum capacity"));
  }
  
  // Check if the user is already a member
  if (this.members.includes(userId)) {
      return Promise.reject(new Error("User already a member of this group"));
  }

  // Add user to the group
  this.members.push(userId);
  return this.save();
};


const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
