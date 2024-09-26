const mongoose = require('mongoose');
mongoose.set('debug', true); // Enable debug mode


// MongoDB connection string (replace with your own connection string)
const dbURI = 'mongodb+srv://userAT:LSdXPxSYMrEgBFsm@cluster0.bfs04.mongodb.net/test-db?retryWrites=true&w=majority';

mongoose.connect(dbURI, {serverSelectionTimeoutMS: 30000  })
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

module.exports = mongoose;
