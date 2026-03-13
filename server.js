const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health check endpoint for testing connection from phone browser
app.get('/', (req, res) => {
    res.send('MovieHub Backend is Running!');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', movieRoutes);
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // Listen on 0.0.0.0 to accept connections from any device on the network
        app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://10.94.56.36:${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));