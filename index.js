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

const { MongoClient } = require("mongodb");
 
// Replace the following with your Atlas connection string                                                                                                                                        
const url = "mongodb+srv://tamoghna2396:1xaU4RyPVvF10ZCm@cluster0.colrt.mongodb.net/";

// Connect to your Atlas cluster
const client = new MongoClient(url);

async function run() {
    try {
        await client.connect();
        console.log("Successfully connected to Atlas");

    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await client.close();
    }
}

run().catch(console.dir);



