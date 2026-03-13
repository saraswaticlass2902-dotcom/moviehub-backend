const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: 'User already exists' });

        user = new User({ name, email, password });
        await user.save();

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid Credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: { name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;