// index.js
const express = require('express');
const app = express();

// Import the auth routes (make sure this is correct)
const authRoutes = require('./routes/auth');

app.use(express.json());

// Use the imported router as middleware
app.use('/auth', authRoutes); // `authRoutes` should be a router function, not an object

app.listen(3000, () => {
    console.log('Server running on port 3000');
});


