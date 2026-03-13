const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Storage Configuration for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'moviehub_posters',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const upload = multer({ storage: storage });

// Middleware to verify JWT token
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Get all favorites for a user
router.get('/:email', auth, async (req, res) => {
    try {
        const favorites = await Favorite.find({ userEmail: req.params.email });
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add to favorites (existing simple add)
router.post('/add', auth, async (req, res) => {
    try {
        const { userEmail, movieId, movieTitle, poster } = req.body;
        const favorite = new Favorite({ userEmail, movieId, movieTitle, poster });
        await favorite.save();
        res.status(201).json({ message: 'Added to favorites' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add movie with image upload to Cloudinary
router.post('/add-manual', auth, upload.single('image'), async (req, res) => {
    try {
        const { userEmail, movieTitle } = req.body;

        // The image URL and publicId are provided by Cloudinary via Multer
        const posterUrl = req.file ? req.file.path : '';
        const posterPublicId = req.file ? req.file.filename : '';

        const favorite = new Favorite({
            userEmail,
            movieId: Math.floor(Math.random() * 1000000), // Generate a random ID
            movieTitle,
            poster: posterUrl,
            posterPublicId: posterPublicId
        });

        await favorite.save();
        res.status(201).json({
            success: true,
            message: 'Movie added with image!',
            posterUrl,
            posterPublicId
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Remove from favorites
router.delete('/remove/:email/:movieId', auth, async (req, res) => {
    try {
        const favorite = await Favorite.findOne({
            userEmail: req.params.email,
            movieId: req.params.movieId
        });

        if (favorite && favorite.posterPublicId) {
            // Delete image from Cloudinary
            await cloudinary.uploader.destroy(favorite.posterPublicId);
        }

        await Favorite.findOneAndDelete({
            userEmail: req.params.email,
            movieId: req.params.movieId
        });

        res.json({ message: 'Removed from favorites and image deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;