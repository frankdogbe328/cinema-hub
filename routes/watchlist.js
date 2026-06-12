const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Watchlist } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { requireDB } = require('../db');

router.use(requireDB, requireAuth);

router.get('/', async (req, res) => {
  const items = await Watchlist.find({ userId: req.user.userId }).sort({ addedAt: -1 });
  res.json({ items });
});

router.post(
  '/',
  [
    body('tmdbId').isInt().toInt(),
    body('mediaType').optional().isIn(['movie', 'tv']),
    body('title').isString().isLength({ min: 1, max: 240 }),
    body('posterPath').optional({ nullable: true }).isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { tmdbId, mediaType = 'movie', title, posterPath = null } = req.body;
    try {
      const item = await Watchlist.findOneAndUpdate(
        { userId: req.user.userId, tmdbId },
        { $setOnInsert: { mediaType, title, posterPath, addedAt: new Date() } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      res.status(201).json({ item });
    } catch (err) {
      if (err.code === 11000) return res.status(200).json({ message: 'Already in watchlist' });
      console.error('watchlist add error', err);
      res.status(500).json({ message: 'Could not add to watchlist' });
    }
  }
);

router.delete('/:tmdbId', async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);
  await Watchlist.deleteOne({ userId: req.user.userId, tmdbId });
  res.json({ success: true });
});

router.put('/:tmdbId', async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);
  const { watched, userRating } = req.body;
  const update = {};
  if (typeof watched === 'boolean') update.watched = watched;
  if (typeof userRating === 'number') update.userRating = userRating;
  const item = await Watchlist.findOneAndUpdate(
    { userId: req.user.userId, tmdbId },
    update,
    { new: true }
  );
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json({ item });
});

module.exports = router;
