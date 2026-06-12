const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { signToken } = require('../middleware/auth');
const { requireDB } = require('../db');

// Decode Google ID token (JWT) without verifying signature.
// NOTE: For production hardening, verify against Google's JWKS using google-auth-library.
function decodeGoogleCredential(credential) {
  try {
    return jwt.decode(credential);
  } catch {
    return null;
  }
}

router.post('/google', requireDB, async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Missing Google credential' });

    const payload = decodeGoogleCredential(credential);
    if (!payload || !payload.email || !payload.sub) {
      return res.status(400).json({ message: 'Invalid Google credential' });
    }

    const email = payload.email.toLowerCase();
    const username = payload.name || payload.given_name || email.split('@')[0];
    const picture = payload.picture || null;
    const googleId = payload.sub;

    let user = await User.findOne({ $or: [{ email }, { googleId }] });
    if (!user) {
      user = await User.create({
        email,
        username,
        googleId,
        picture,
        isVerified: true,
        authProvider: 'google',
      });
    } else {
      user.googleId = user.googleId || googleId;
      user.picture = picture || user.picture;
      user.isVerified = true;
      if (user.authProvider === 'email' && !user.passwordHash) user.authProvider = 'google';
      await user.save();
    }

    const token = signToken(user);
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    console.error('google auth error', err);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

router.get('/google/status', (_req, res) => {
  res.json({
    configured: !!process.env.GOOGLE_CLIENT_ID,
    clientId: process.env.GOOGLE_CLIENT_ID || null,
  });
});

module.exports = router;
