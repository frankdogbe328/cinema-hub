const express = require('express');
const axios = require('axios');
const { LRUCache } = require('lru-cache');

const router = express.Router();

const TMDB_BASE = 'https://api.themoviedb.org/3';
// Trim whitespace/newlines — Vercel env paste sometimes carries them, which makes
// Node reject the Authorization header with "Invalid character in header content".
const TMDB_KEY = (process.env.TMDB_API_KEY || process.env.TMDB_READ_TOKEN || '').trim();

const cache = new LRUCache({
  max: 500,
  ttl: 5 * 60 * 1000, // 5 minutes
});

function tmdbHeaders() {
  return TMDB_KEY ? { Authorization: `Bearer ${TMDB_KEY}` } : {};
}

async function tmdbGet(path, params = {}) {
  if (!TMDB_KEY) {
    const err = new Error('TMDB_API_KEY not configured');
    err.status = 503;
    throw err;
  }
  const key = `${path}?${new URLSearchParams(params).toString()}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${TMDB_BASE}${path}`, {
      headers: tmdbHeaders(),
      params: { language: 'en-US', ...params },
      timeout: 8000,
    });
    cache.set(key, data);
    return data;
  } catch (err) {
    const status = err.response?.status || 502;
    const message = err.response?.data?.status_message || err.message || 'TMDB request failed';
    const e = new Error(message);
    e.status = status;
    throw e;
  }
}

function handle(res, promise) {
  return promise
    .then((data) => res.json(data))
    .catch((err) => res.status(err.status || 500).json({ message: err.message }));
}

router.get('/trending/:window', (req, res) => {
  const w = ['day', 'week'].includes(req.params.window) ? req.params.window : 'week';
  handle(res, tmdbGet(`/trending/movie/${w}`));
});

router.get('/popular', (req, res) => {
  const page = Number(req.query.page) || 1;
  handle(res, tmdbGet('/movie/popular', { page }));
});

router.get('/top-rated', (req, res) => {
  const page = Number(req.query.page) || 1;
  handle(res, tmdbGet('/movie/top_rated', { page }));
});

router.get('/now-playing', (req, res) => {
  const page = Number(req.query.page) || 1;
  handle(res, tmdbGet('/movie/now_playing', { page }));
});

router.get('/upcoming', (req, res) => {
  const page = Number(req.query.page) || 1;
  handle(res, tmdbGet('/movie/upcoming', { page }));
});

router.get('/genres', (_req, res) => {
  handle(res, tmdbGet('/genre/movie/list'));
});

router.get('/discover', (req, res) => {
  const { with_genres, sort_by = 'popularity.desc', year, page = 1 } = req.query;
  const params = { sort_by, page: Number(page) };
  if (with_genres) params.with_genres = with_genres;
  if (year) params.primary_release_year = Number(year);
  handle(res, tmdbGet('/discover/movie', params));
});

router.get('/search', (req, res) => {
  const q = String(req.query.q || '').trim();
  const page = Number(req.query.page) || 1;
  if (!q) return res.json({ page: 1, results: [], total_pages: 0, total_results: 0 });
  handle(res, tmdbGet('/search/multi', { query: q, page, include_adult: false }));
});

router.get('/movie/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: 'Invalid id' });
  handle(res, tmdbGet(`/movie/${id}`, { append_to_response: 'videos,credits,similar' }));
});

router.get('/tv/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: 'Invalid id' });
  handle(res, tmdbGet(`/tv/${id}`, { append_to_response: 'videos,credits,similar' }));
});

module.exports = router;
