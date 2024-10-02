
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


const nodemailer = require('nodemailer'); // For sending email
const crypto = require('crypto'); // For generating OTPs

// Transporter for nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tamoghna2396@gmail.com',
        pass: 'cdie tkza qqgd xmlb'
    }
});


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

// Forgot Password API: Generate and Send OTP to Email
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required."
        });
    }

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Generate a 6-digit OTP and set its expiration time (e.g., 15 minutes)
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes from now

        // Save the OTP and expiration in the user's document
        user.resetOtp = otp;
        user.resetOtpExpires = otpExpires;
        await user.save();

        // Send OTP via email
        const mailOptions = {
            from: 'tamoghna2396@gmail.com',
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is ${otp}. It is valid for 15 minutes.`
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: "OTP sent to your email."
        });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            message: "Email and OTP are required."
        });
    }

    try {
        // Check if the user exists and if the OTP is still valid
        const user = await User.findOne({
            email,
            resetOtp: otp,
            resetOtpExpires: { $gt: Date.now() } // Check if OTP is not expired
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP or OTP expired."
            });
        }

        // If OTP is valid, send a success response
        res.json({
            success: true,
            message: "OTP verified. You can now reset your password."
        });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Email and new password are required."
        });
    }

    // Validate the new password against your password rules
    if (!passwordPattern.test(newPassword)) {
        return res.status(400).json({
            success: false,
            message: "New password must meet the complexity requirements."
        });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update the user's password and clear the OTP fields
        user.password = hashedPassword;
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;

        await user.save();

        res.json({
            success: true,
            message: "Password reset successfully."
        });

    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

module.exports = router;
