const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    username: { type: String, required: true },
    tmdbId: { type: Number, required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    text: { type: String, required: true, maxlength: 4000 },
    likes: { type: Number, default: 0 },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reviewSchema.index({ tmdbId: 1, createdAt: -1 });

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
