const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    movieId: { type: Number, required: true },
    movieTitle: { type: String, required: true },

    // Movie Image (Cloudinary)
    poster: {
      type: String, // Cloudinary secure URL
      required: true,
    },

    // IMPORTANT: Cloudinary public_id for deletion
    posterPublicId: {
      type: String,
      default: "",
    },

    // NEW: Favorite status within user's collection
    isFavorite: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Favorite", favoriteSchema);