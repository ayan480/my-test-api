const Message = require('../models/message.js');

// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Import the User model

// Regex patterns for validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email validation
const phonePattern = /^\d{10}$/; // Example pattern for a 10-digit phone number

// Sample static response data
const staticId = 1; // Static ID
const staticNameFromEmail = ""; // Default name if email doesn't have a portion



router.post('/login', (req, res) => {
    const { emailOrPhone, password } = req.body;

    // Basic validation
    if (!emailOrPhone || !password) {
        return res.status(400).json({
            success: false,
            data: {},
            message: "Login failed: Email/Phone and Password are required."
        });
    }

    // Check if input is a valid email or phone number
    let isValid = false;
    if (emailPattern.test(emailOrPhone)) {
        isValid = true; // Valid email
    } else if (phonePattern.test(emailOrPhone)) {
        isValid = true; // Valid phone number
    } else {
        return res.status(400).json({
            success: false,
            data: {},
            message: "Login failed: Invalid email or phone number."
        });
    }

    // Extract name from email (if it's an email)
    let name = staticNameFromEmail; // Fallback name
    if (emailOrPhone.includes('@')) {
        name = emailOrPhone.split('@')[0]; // Get portion before '@'
    }

    // Here you would typically validate the credentials against a database
    const loginSuccessful = true; // Replace this with actual login logic

    if (loginSuccessful) {
        return res.json({
            success: true,
            data: {
                name: name,
                id: staticId
            },
            message: "Successfully logged in."
        });
    } else {
        return res.json({
            success: false,
            data: {},
            message: "Login failed."
        });
    }
});


router.post('/signup', async (req, res) => {
    const { firstName, lastName, phoneNumber, email } = req.body;

    // Basic validation
    if (!firstName || !lastName || !phoneNumber || !email) {
        return res.status(400).json({
            success: false,
            data: {},
            message: "Signup failed: All fields are required."
        });
    }

    // Validate email
    if (!emailPattern.test(email)) {
        return res.status(400).json({
            success: false,
            data: {},
            message: "Signup failed: Invalid email address."
        });
    }

    // Validate phone number
    if (!phonePattern.test(phoneNumber)) {
        return res.status(400).json({
            success: false,
            data: {},
            message: "Signup failed: Invalid phone number. It should be 10 digits."
        });
    }

    // Check if the user already exists
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                data: {},
                message: "Signup failed: Email already in use."
            });
        }

        // Create a new user instance
        const newUser = new User({
            firstName,
            lastName,
            phoneNumber,
            email
        });

       // Save the user to the database
       const savedUser = await newUser.save();

        // Send a successful response
        return res.status(201).json({
            success: true,
            data: {
                id: savedUser._id, // Return the user's MongoDB _id
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                phoneNumber: savedUser.phoneNumber,
                email: savedUser.email
            },
            message: "Signup successful."
        });
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({
            success: false,
            data: {},
            message: "Signup failed: An internal error occurred."
        });
    }
});

module.exports = router;
