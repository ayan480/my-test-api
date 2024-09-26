const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const Note = require('../models/Note');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads with size and file count limits
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory where files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Create unique file names
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB per file
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf/; // Allowed file types
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Only .jpeg, .jpg, .png, and .pdf files are allowed."));
        }
    }
}).array('attachments', 3); // Max 3 attachments

// Add Note route with attachments
router.post('/add-note', (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        const { userId, title, content } = req.body;

        // Basic validation
        if (!userId || !title || !content) {
            return res.status(400).json({
                success: false,
                message: "All fields are required (userId, title, content)."
            });
        }

        try {
            // Check if the user exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            // Handle uploaded files
            const attachments = req.files ? req.files.map(file => file.path) : [];

            // Create a new note with attachments
            const newNote = new Note({
                userId,
                title,
                content,
                attachments // Store attachment paths
            });

            // Save the note to the database
            await newNote.save();

            if(!attachments || attachments.length === 0){
            res.status(201).json({
                success: true,
                message: "Note added successfully with attachments",
                data: newNote
            });
        }else{
            res.status(201).json({
                success: true,
                message: "Note added successfully",
                data: newNote
            });
        }
        } catch (error) {
            console.error("Error while adding note:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    });
});

module.exports = router;
