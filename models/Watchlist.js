const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
    title: { type: String, required: true },
    posterPath: { type: String, default: null },
    addedAt: { type: Date, default: Date.now },
    watched: { type: Boolean, default: false },
    userRating: { type: Number, min: 0, max: 10, default: null },
  },
  { timestamps: true }
);

watchlistSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.models.Watchlist || mongoose.model('Watchlist', watchlistSchema);
