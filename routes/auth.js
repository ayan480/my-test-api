
// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Import the User model


// Sample static response data
const staticId = 1; // Static ID
const bcrypt = require('bcrypt'); // For password hashing (if used in future)

// Regex patterns for validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email validation
const phonePattern = /^\d{10}$/; // Example pattern for a 10-digit phone number
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // Password validation pattern





router.post('/login', async (req, res) => {
    const { emailOrPhone, password } = req.body;

    // Basic validation
    if (!emailOrPhone || !password) {
        return res.status(400).json({
            success: false,
            data: {},
            message: "Login failed: Email/Phone and Password are required."
        });
    }

    // Determine if the input is a valid email or phone number
    let query = {};
    if (emailPattern.test(emailOrPhone)) {
        query.email = emailOrPhone;
    } else if (phonePattern.test(emailOrPhone)) {
        query.phoneNumber = emailOrPhone;
    } else {
        return res.status(400).json({
            success: false,
            data: {},
            message: "Login failed: Invalid email or phone number."
        });
    }

    try {
        // Check if the user exists in the database
        const user = await User.findOne(query);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                data: {},
                message: "Login failed: User not found."
            });
        }

        // Log the user object to see if the password exists
        console.log("User fetched:", user);

       // Compare the plain text password with the hashed password
       var passwordMatch = await bcrypt.compare(password, user.password);
       console.log("Provided password:", passwordMatch);
        console.log("Provided password:", password);
        console.log("Hashed password from DB:", user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                data: {},
                message: "Login failed: Incorrect password."
            });
        }

        // If login is successful
        return res.json({
            success: true,
            data: {
                id: user._id,
                name: user.firstName + ' ' + user.lastName,
                email: user.email
            },
            message: "Successfully logged in."
        });

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            success: false,
            data: {},
            message: "Login failed: An internal error occurred."
        });
    }
});


// Number of salt rounds for bcrypt
const saltRounds = 10;

router.post('/signup', async (req, res) => {
    const { firstName, lastName, phoneNumber, email, password } = req.body;

    // Basic validation
    if (!firstName || !lastName || !phoneNumber || !email || !password) {
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

    // Validate password (min 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character)
    if (!passwordPattern.test(password)) {
        return res.status(400).json({
            success: false,
            data: {},
            message: "Signup failed: Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character."
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

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        console.log("Password => "+hashedPassword)
        // Create a new user instance
        const newUser = new User({
            firstName,
            lastName,
            phoneNumber,
            email,
            password: hashedPassword 
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Send a successful response with the user's ID
        return res.status(201).json({
            success: true,
            data: {
                id: savedUser._id,
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
