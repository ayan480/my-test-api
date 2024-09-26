
// routes/notes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const Note = require('../models/Note');

// Add Note route
router.post('/add-note', async (req, res) => {
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

        // Create a new note for the user
        const newNote = new Note({
            userId,
            title,
            content
        });

        // Save the note to the database
        await newNote.save();

        res.status(201).json({
            success: true,
            message: "Note added successfully",
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

// Fetch Notes route by user ID
router.get('/get-notes/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const notes = await Note.find({ userId: userId });

        console.log("Fetched notes:", notes); // <-- This will help debug what's being returned

        if (!notes) {
            return res.status(404).json({
                success: false,
                message: "No notes found for this user."
            });
        }

        res.status(200).json({
            success: true,
            message: "Notes fetched successfully",
            data: notes
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