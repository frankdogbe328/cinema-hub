const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Mock user data (replace with MongoDB in production)
let users = [
  {
    id: 1,
    email: 'admin@cinemahub.com',
    username: 'admin',
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
 * @route   GET /api/watchlist
 * @desc    Get user's watchlist
 * @access  Private
 */
router.get('/', authenticateToken, (req, res) => {
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
        watchlist: user.watchlist,
        count: user.watchlist.length
      }
    });

  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get watchlist',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/watchlist
 * @desc    Add movie to watchlist
 * @access  Private
 */
router.post('/', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { movieId, title, poster, year, rating, genre } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID and title are required'
      });
    }

    // Check if movie already exists in watchlist
    const existingMovie = user.watchlist.find(movie => movie.movieId === movieId);
    if (existingMovie) {
      return res.status(400).json({
        success: false,
        message: 'Movie already in watchlist'
      });
    }

    const movieToAdd = {
      movieId,
      title,
      poster: poster || null,
      year: year || null,
      rating: rating || null,
      genre: genre || [],
      addedAt: new Date(),
      watched: false,
      userRating: null,
      notes: ''
    };

    user.watchlist.push(movieToAdd);

    res.status(201).json({
      success: true,
      message: 'Movie added to watchlist successfully',
      data: movieToAdd
    });

  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add movie to watchlist',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/watchlist/:movieId
 * @desc    Remove movie from watchlist
 * @access  Private
 */
router.delete('/:movieId', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { movieId } = req.params;

    const movieIndex = user.watchlist.findIndex(movie => movie.movieId === movieId);
    
    if (movieIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in watchlist'
      });
    }

    const removedMovie = user.watchlist.splice(movieIndex, 1)[0];

    res.json({
      success: true,
      message: 'Movie removed from watchlist successfully',
      data: removedMovie
    });

  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove movie from watchlist',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/watchlist/:movieId
 * @desc    Update movie in watchlist (mark as watched, add rating, etc.)
 * @access  Private
 */
router.put('/:movieId', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { movieId } = req.params;
    const { watched, userRating, notes } = req.body;

    const movie = user.watchlist.find(movie => movie.movieId === movieId);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in watchlist'
      });
    }

    // Update movie properties
    if (watched !== undefined) movie.watched = watched;
    if (userRating !== undefined) movie.userRating = userRating;
    if (notes !== undefined) movie.notes = notes;

    res.json({
      success: true,
      message: 'Watchlist updated successfully',
      data: movie
    });

  } catch (error) {
    console.error('Update watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update watchlist',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/watchlist
 * @desc    Clear entire watchlist
 * @access  Private
 */
router.delete('/', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const watchlistCount = user.watchlist.length;
    user.watchlist = [];

    res.json({
      success: true,
      message: 'Watchlist cleared successfully',
      data: {
        removedCount: watchlistCount
      }
    });

  } catch (error) {
    console.error('Clear watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear watchlist',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/watchlist/stats
 * @desc    Get watchlist statistics
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

    const watchlist = user.watchlist;
    const totalMovies = watchlist.length;
    const watchedMovies = watchlist.filter(movie => movie.watched).length;
    const unwatchedMovies = totalMovies - watchedMovies;

    // Calculate average rating
    const ratedMovies = watchlist.filter(movie => movie.userRating !== null);
    const averageRating = ratedMovies.length > 0 
      ? (ratedMovies.reduce((sum, movie) => sum + movie.userRating, 0) / ratedMovies.length).toFixed(1)
      : 0;

    // Get genre distribution
    const genreCount = {};
    watchlist.forEach(movie => {
      if (movie.genre && Array.isArray(movie.genre)) {
        movie.genre.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    // Get year distribution
    const yearCount = {};
    watchlist.forEach(movie => {
      if (movie.year) {
        yearCount[movie.year] = (yearCount[movie.year] || 0) + 1;
      }
    });

    const stats = {
      totalMovies,
      watchedMovies,
      unwatchedMovies,
      averageRating: parseFloat(averageRating),
      watchedPercentage: totalMovies > 0 ? Math.round((watchedMovies / totalMovies) * 100) : 0,
      genreDistribution: genreCount,
      yearDistribution: yearCount,
      recentlyAdded: watchlist
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        .slice(0, 5)
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get watchlist stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get watchlist statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/watchlist/search
 * @desc    Search movies in watchlist
 * @access  Private
 */
router.get('/search', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { query, genre, watched, sortBy = 'addedAt', sortOrder = 'desc' } = req.query;

    let filteredWatchlist = [...user.watchlist];

    // Filter by search query
    if (query) {
      filteredWatchlist = filteredWatchlist.filter(movie => 
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        (movie.notes && movie.notes.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Filter by genre
    if (genre) {
      filteredWatchlist = filteredWatchlist.filter(movie => 
        movie.genre && movie.genre.includes(genre)
      );
    }

    // Filter by watched status
    if (watched !== undefined) {
      const watchedBool = watched === 'true';
      filteredWatchlist = filteredWatchlist.filter(movie => movie.watched === watchedBool);
    }

    // Sort results
    filteredWatchlist.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'year':
          aValue = a.year || 0;
          bValue = b.year || 0;
          break;
        case 'rating':
          aValue = a.userRating || 0;
          bValue = b.userRating || 0;
          break;
        case 'addedAt':
        default:
          aValue = new Date(a.addedAt);
          bValue = new Date(b.addedAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    res.json({
      success: true,
      data: {
        movies: filteredWatchlist,
        count: filteredWatchlist.length,
        totalCount: user.watchlist.length
      }
    });

  } catch (error) {
    console.error('Search watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search watchlist',
      error: error.message
    });
  }
});

module.exports = router; 