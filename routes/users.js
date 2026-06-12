const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { User, Watchlist, Review } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { requireDB } = require('../db');

router.use(requireDB, requireAuth);

router.get('/profile', async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: user.toPublic() });
});

router.put(
  '/profile',
  [
    body('firstName').optional().isString().isLength({ max: 60 }),
    body('lastName').optional().isString().isLength({ max: 60 }),
    body('bio').optional().isString().isLength({ max: 500 }),
    body('avatar').optional().isURL(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { firstName, lastName, bio, avatar } = req.body;
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (bio !== undefined) user.profile.bio = bio;
    if (avatar !== undefined) user.profile.avatar = avatar;
    await user.save();
    res.json({ user: user.toPublic() });
  }
);

router.get('/preferences', async (req, res) => {
  const user = await User.findById(req.user.userId).select('preferences');
  res.json({ preferences: user?.preferences || {} });
});

router.put('/preferences', async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { favoriteGenres, language, notifications } = req.body;
  if (Array.isArray(favoriteGenres)) user.preferences.favoriteGenres = favoriteGenres.map(Number);
  if (typeof language === 'string') user.preferences.language = language;
  if (typeof notifications === 'boolean') user.preferences.notifications = notifications;
  await user.save();
  res.json({ preferences: user.preferences });
});

router.get('/stats', async (req, res) => {
  const [watchlistCount, reviewCount] = await Promise.all([
    Watchlist.countDocuments({ userId: req.user.userId }),
    Review.countDocuments({ userId: req.user.userId }),
  ]);
  res.json({ stats: { watchlistCount, reviewCount } });
});

module.exports = router;
