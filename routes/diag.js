// Read-only diagnostic endpoint — shows the SHAPE of secret env vars without
// revealing them. Safe to call from anywhere. Delete this route once deployed
// state is confirmed good.
const express = require('express');
const router = express.Router();

function describe(name, opts = {}) {
  const raw = process.env[name];
  if (raw == null) return { name, present: false };
  const clean = raw.replace(/\s+/g, '');
  return {
    name,
    present: true,
    length: raw.length,
    lengthAfterStrip: clean.length,
    hadWhitespace: raw.length !== clean.length,
    first6: opts.peekStart ? clean.slice(0, 6) : undefined,
    last6: opts.peekEnd ? clean.slice(-6) : undefined,
    startsWith: opts.startsWith ? clean.startsWith(opts.startsWith) : undefined,
  };
}

router.get('/env', (_req, res) => {
  res.json({
    note: 'Diagnostic only. No secret values are returned in full.',
    nodeEnv: process.env.NODE_ENV || null,
    vercel: !!process.env.VERCEL,
    region: process.env.VERCEL_REGION || null,
    vars: {
      TMDB_API_KEY: describe('TMDB_API_KEY', {
        peekStart: true,
        peekEnd: true,
        startsWith: 'eyJ',
      }),
      MONGODB_URI: describe('MONGODB_URI', {
        peekStart: true,
        startsWith: 'mongodb',
      }),
      JWT_SECRET: describe('JWT_SECRET'),
      EMAIL_USER: { name: 'EMAIL_USER', value: process.env.EMAIL_USER || null },
      EMAIL_PASS: describe('EMAIL_PASS'),
      GOOGLE_CLIENT_ID: { name: 'GOOGLE_CLIENT_ID', present: !!process.env.GOOGLE_CLIENT_ID },
    },
  });
});

module.exports = router;
