const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Mock user data (replace with MongoDB in production)
let users = [
  {
    id: 1,
    email: 'admin@cinemahub.com',
    username: 'admin',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      avatar: null,
      bio: 'CinemaHub Administrator',
      preferences: {
        favoriteGenres: ['Action', 'Drama'],
        language: 'en',
        notifications: true
      }
    },
    watchlist: [],
    createdAt: new Date()
  }
];

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        profile: user.profile,
        watchlistCount: user.watchlist.length,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { firstName, lastName, bio, favoriteGenres, language, notifications } = req.body;

    // Update profile
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (bio !== undefined) user.profile.bio = bio;
    if (favoriteGenres) user.profile.preferences.favoriteGenres = favoriteGenres;
    if (language) user.profile.preferences.language = language;
    if (notifications !== undefined) user.profile.preferences.notifications = notifications;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/users/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/avatar', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // In a real application, you would handle file upload here
    // For now, we'll just return a success message
    const avatarUrl = req.body.avatarUrl || 'https://via.placeholder.com/150';

    user.profile.avatar = avatarUrl;

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatar: avatarUrl
      }
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/preferences', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.profile.preferences
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { favoriteGenres, language, notifications } = req.body;

    if (favoriteGenres) user.profile.preferences.favoriteGenres = favoriteGenres;
    if (language) user.profile.preferences.language = language;
    if (notifications !== undefined) user.profile.preferences.notifications = notifications;

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.profile.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const stats = {
      watchlistCount: user.watchlist.length,
      favoriteGenres: user.profile.preferences.favoriteGenres,
      memberSince: user.createdAt,
      totalMoviesWatched: user.watchlist.filter(movie => movie.watched).length,
      averageRating: user.watchlist.length > 0 
        ? (user.watchlist.reduce((sum, movie) => sum + (movie.rating || 0), 0) / user.watchlist.length).toFixed(1)
        : 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

module.exports = router; 