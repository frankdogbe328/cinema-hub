const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Review, User } = require('../models');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireDB } = require('../db');

router.use(requireDB);

router.get('/movie/:movieId', optionalAuth, async (req, res) => {
  const tmdbId = Number(req.params.movieId);
  const reviews = await Review.find({ tmdbId }).sort({ createdAt: -1 }).limit(50);
  res.json({ reviews });
});

router.post(
  '/',
  requireAuth,
  [
    body('movieId').isInt().toInt(),
    body('rating').isFloat({ min: 1, max: 10 }).toFloat(),
    body('review').isString().isLength({ min: 1, max: 4000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const review = await Review.create({
      userId: user._id,
      username: user.username,
      tmdbId: req.body.movieId,
      rating: req.body.rating,
      text: req.body.review,
    });
    res.status(201).json({ review });
  }
);

router.delete('/:reviewId', requireAuth, async (req, res) => {
  const r = await Review.findOneAndDelete({ _id: req.params.reviewId, userId: req.user.userId });
  if (!r) return res.status(404).json({ message: 'Review not found' });
  res.json({ success: true });
});

router.put('/:reviewId', requireAuth, async (req, res) => {
  const { rating, text } = req.body;
  const update = {};
  if (typeof rating === 'number') update.rating = rating;
  if (typeof text === 'string') update.text = text;
  const r = await Review.findOneAndUpdate(
    { _id: req.params.reviewId, userId: req.user.userId },
    update,
    { new: true }
  );
  if (!r) return res.status(404).json({ message: 'Review not found' });
  res.json({ review: r });
});

module.exports = router;
