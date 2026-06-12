const express = require('express');
const router = express.Router();
const axios = require('axios');
const { User } = require('../models');
const { optionalAuth } = require('../middleware/auth');
const { requireDB } = require('../db');

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY = (process.env.TMDB_API_KEY || process.env.TMDB_READ_TOKEN || '').trim();

router.get('/', requireDB, optionalAuth, async (req, res) => {
  try {
    let genres = [];
    if (req.user?.userId) {
      const user = await User.findById(req.user.userId).select('preferences');
      genres = user?.preferences?.favoriteGenres || [];
    }

    if (!TMDB_KEY) return res.status(503).json({ message: 'TMDB_API_KEY not configured' });

    const params = { sort_by: 'popularity.desc', page: 1, language: 'en-US' };
    if (genres.length) params.with_genres = genres.join('|');

    const { data } = await axios.get(`${TMDB_BASE}/discover/movie`, {
      headers: { Authorization: `Bearer ${TMDB_KEY}` },
      params,
      timeout: 8000,
    });

    res.json({ recommendations: data.results, basedOnGenres: genres });
  } catch (err) {
    console.error('recommendations error', err.message);
    res.status(500).json({ message: 'Could not fetch recommendations' });
  }
});

module.exports = router;
