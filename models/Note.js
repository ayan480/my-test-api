const mongoose = require('mongoose');



const noteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    attachments: [{ type: String }], // File paths
    createdAt: { type: Date, default: Date.now }, // Automatically set creation date
    updatedAt: { type: Date } // Update date
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note
