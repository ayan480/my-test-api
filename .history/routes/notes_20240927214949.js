
// routes/notes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const Note = require('../models/Note');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs module

// Body parsing middleware to handle form-data
const app = express();
app.use(express.urlencoded({ extended: true })); // Parses form-data for text fields

// Set up multer for file uploads with size and file count limits
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure the 'uploads' directory exists
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); // Directory where files will be stored
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

        console.log("Request body:", req.body); // Debugging
        console.log("Uploaded files:", req.files); // Debugging

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

            res.status(201).json({
                success: true,
                message: attachments.length ? "Note added successfully with attachments" : "Note added successfully",
                data: newNote
            });
        } catch (error) {
            console.error("Error while adding note:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    });
});

// Fetch Notes route by user ID
router.get('/get-notes/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const notes = await Note.find({ userId: userId });

        if (!notes || notes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No notes found for this user."
            });
        }

        // Format the response, ensuring attachments are included
        const formattedNotes = notes.map(note => ({
            id: note._id,
            title: note.title,
            content: note.content,
            createdAt: note.createdAt,
            attachments: note.attachments // Includes attachment file paths
        }));

        res.status(200).json({
            success: true,
            message: "Notes fetched successfully",
            data: formattedNotes
        });
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

module.exports = router;