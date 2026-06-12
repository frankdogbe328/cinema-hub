require('dotenv').config({ path: './.env' });

// Surface silent crashes — don't let the process die without telling us why.
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise);
  console.error('   Reason:', reason?.stack || reason);
});
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err.stack || err);
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const { connectDB } = require('./db');
const { validateEnv } = require('./lib/envCheck');

validateEnv();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'cinemahub-dev-secret-key-2026-change-in-production';
  console.log('⚠️  JWT_SECRET not set — using dev fallback. Set JWT_SECRET in production.');
}

// Security & utility middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // SPA handles CSP via meta if needed
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// API rate limiting
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests. Try again later.' },
  })
);

// Connect to MongoDB (fire-and-forget; routes that need DB use requireDB middleware).
// We NEVER exit on failure here — that would kill the Vercel function permanently.
connectDB().catch((err) => {
  console.error('⚠️  MongoDB connect failed (will retry on first DB-bound request):', err?.message || err);
});

// API routes
// TMDB is the single source of truth for movie metadata.
// Auth, watchlist, reviews, recommendations are first-party (Mongo-backed).
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/google-auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/tmdb', require('./routes/tmdb'));
app.use('/api/_diag', require('./routes/diag'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Serve React build in production (Vercel handles this via vercel.json, but this lets
// `node server.js` also serve the SPA in self-hosted setups).
const clientDist = path.join(__dirname, 'client', 'dist');
if (require('fs').existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: '1y', index: false }));
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 for any /api/* not matched above
app.use('/api/*', (_req, res) => res.status(404).json({ message: 'Not found' }));

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// Only call listen when not on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🎬  CinemaHub API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
