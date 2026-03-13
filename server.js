const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('MovieHub Backend is Running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/favorites', movieRoutes);
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI || (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://'))) {
    console.error('ERROR: Invalid MONGODB_URI. Please check your Environment Variables on Render.');
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
    });