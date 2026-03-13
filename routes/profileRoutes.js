const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Reuse Cloudinary config from movieRoutes or centralized config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'moviehub_profiles',
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
        // We need to make sure req.user has email if the controller expects it
        // Or fetch user from DB if jwt only has ID.
        // For simplicity, let's assume JWT payload has email or we fetch it.
        // If JWT only has ID, we might need to find the user first.
        req.user = decoded;
        // Assuming your login/register signs token with { id, email }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Get current user profile
router.get('/me', auth, profileController.getProfile);

// Update profile text data
router.put('/update', auth, profileController.updateProfile);

// Upload/Update profile photo
router.post('/upload-photo', auth, upload.single('image'), profileController.uploadProfilePhoto);

// Admin/Public view profile by email
router.get('/:email', auth, profileController.getProfileByEmail);

module.exports = router;