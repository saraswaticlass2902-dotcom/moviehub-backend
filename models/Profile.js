const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    phone: { type: String },
    address: { type: String },
    profilePhoto: { type: String },
    profilePhotoPublicId: { type: String }
});

module.exports = mongoose.model('Profile', profileSchema);