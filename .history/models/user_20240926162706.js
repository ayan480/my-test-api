const mongoose = require('../db/db.js');
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
