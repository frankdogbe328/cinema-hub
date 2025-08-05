const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock user database (replace with MongoDB in production)
let users = [
  {
    id: 1,
    email: 'admin@cinemahub.com',
    username: 'admin',
    password: '$2a$12$dpIEAtZMvuyl117cZvKZdOSa2IvyaPnD92UkbHcq/cE.YuVL4uS8e', // admin123
    isVerified: true,
    createdAt: new Date()
  }
];

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth authentication
 * @access  Public
 */
router.post('/google', async (req, res) => {
  try {
    const { email, name, picture, googleId } = req.body;

    if (!email || !name || !googleId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Google authentication data'
      });
    }

    // Check if user already exists
    let user = users.find(u => u.email === email);

    if (!user) {
      // Create new user from Google data
      const newUser = {
        id: users.length + 1,
        email,
        username: name,
        googleId,
        picture,
        isVerified: true, // Google users are pre-verified
        createdAt: new Date(),
        authProvider: 'google'
      };

      users.push(newUser);
      user = newUser;
      console.log(`✅ New Google user created: ${email}`);
    } else {
      // Update existing user with Google data
      user.googleId = googleId;
      user.picture = picture;
      user.isVerified = true;
      user.authProvider = 'google';
      console.log(`✅ Existing user logged in with Google: ${email}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          picture: user.picture,
          authProvider: user.authProvider
        }
      }
    });

  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/auth/google/status
 * @desc    Check if Google OAuth is configured
 * @access  Public
 */
router.get('/google/status', (req, res) => {
  const isConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  
  res.json({
    success: true,
    data: {
      isConfigured,
      clientId: isConfigured ? process.env.GOOGLE_CLIENT_ID : null
    }
  });
});

/**
 * @route   GET /auth/google/callback
 * @desc    Google OAuth callback handler
 * @access  Public
 */
router.get('/callback', (req, res) => {
  // This is a fallback for traditional OAuth flow
  // For Google Identity Services, we handle the callback in the frontend
  res.redirect('/login?error=oauth_callback_not_supported');
});

module.exports = router; 