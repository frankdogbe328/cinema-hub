const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Mock data (replace with MongoDB in production)
let reviews = [
  {
    id: 1,
    movieId: '1',
    userId: 1,
    username: 'admin',
    rating: 4.5,
    review: 'Amazing movie with great cinematography!',
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: 5,
    helpful: true
  }
];

let users = [
  {
    id: 1,
    email: 'admin@cinemahub.com',
    username: 'admin'
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
 * @route   GET /api/reviews/movie/:movieId
 * @desc    Get reviews for a specific movie
 * @access  Public
 */
router.get('/movie/:movieId', (req, res) => {
  try {
    const { movieId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let movieReviews = reviews.filter(review => review.movieId === movieId);

    // Sort reviews
    movieReviews.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'likes':
          aValue = a.likes;
          bValue = b.likes;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const totalReviews = movieReviews.length;
    const paginatedReviews = movieReviews.slice(skip, skip + limitNum);

    // Calculate average rating
    const averageRating = movieReviews.length > 0 
      ? (movieReviews.reduce((sum, review) => sum + review.rating, 0) / movieReviews.length).toFixed(1)
      : 0;

    // Rating distribution
    const ratingDistribution = {
      5: movieReviews.filter(review => review.rating === 5).length,
      4: movieReviews.filter(review => review.rating === 4).length,
      3: movieReviews.filter(review => review.rating === 3).length,
      2: movieReviews.filter(review => review.rating === 2).length,
      1: movieReviews.filter(review => review.rating === 1).length
    };

    res.json({
      success: true,
      data: {
        reviews: paginatedReviews,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalReviews / limitNum),
          totalReviews,
          hasNextPage: skip + limitNum < totalReviews,
          hasPrevPage: pageNum > 1
        },
        stats: {
          averageRating: parseFloat(averageRating),
          totalReviews,
          ratingDistribution
        }
      }
    });

  } catch (error) {
    console.error('Get movie reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get movie reviews',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/', [
  authenticateToken,
  body('movieId').notEmpty().withMessage('Movie ID is required'),
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').isLength({ min: 10, max: 1000 }).withMessage('Review must be between 10 and 1000 characters')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { movieId, rating, review } = req.body;
    const userId = req.user.userId;

    // Check if user already reviewed this movie
    const existingReview = reviews.find(r => r.movieId === movieId && r.userId === userId);
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this movie'
      });
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newReview = {
      id: reviews.length + 1,
      movieId,
      userId,
      username: user.username,
      rating: parseFloat(rating),
      review,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      helpful: false
    };

    reviews.push(newReview);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: newReview
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/reviews/:reviewId
 * @desc    Update a review
 * @access  Private
 */
router.put('/:reviewId', [
  authenticateToken,
  body('rating').optional().isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isLength({ min: 10, max: 1000 }).withMessage('Review must be between 10 and 1000 characters')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { reviewId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.userId;

    const reviewToUpdate = reviews.find(r => r.id === parseInt(reviewId));
    
    if (!reviewToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (reviewToUpdate.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    if (rating !== undefined) reviewToUpdate.rating = parseFloat(rating);
    if (review !== undefined) reviewToUpdate.review = review;
    reviewToUpdate.updatedAt = new Date();

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: reviewToUpdate
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Delete a review
 * @access  Private
 */
router.delete('/:reviewId', authenticateToken, (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const reviewIndex = reviews.findIndex(r => r.id === parseInt(reviewId));
    
    if (reviewIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const review = reviews[reviewIndex];
    if (review.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    const deletedReview = reviews.splice(reviewIndex, 1)[0];

    res.json({
      success: true,
      message: 'Review deleted successfully',
      data: deletedReview
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/reviews/:reviewId/like
 * @desc    Like/unlike a review
 * @access  Private
 */
router.post('/:reviewId/like', authenticateToken, (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const review = reviews.find(r => r.id === parseInt(reviewId));
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Toggle like (in a real app, you'd track who liked what)
    review.likes += 1;

    res.json({
      success: true,
      message: 'Review liked successfully',
      data: {
        reviewId: review.id,
        likes: review.likes
      }
    });

  } catch (error) {
    console.error('Like review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like review',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get reviews by a specific user
 * @access  Public
 */
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const userReviews = reviews.filter(review => review.userId === parseInt(userId));
    const totalReviews = userReviews.length;
    const paginatedReviews = userReviews.slice(skip, skip + limitNum);

    // Calculate user stats
    const averageRating = userReviews.length > 0 
      ? (userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length).toFixed(1)
      : 0;

    const totalLikes = userReviews.reduce((sum, review) => sum + review.likes, 0);

    res.json({
      success: true,
      data: {
        reviews: paginatedReviews,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalReviews / limitNum),
          totalReviews,
          hasNextPage: skip + limitNum < totalReviews,
          hasPrevPage: pageNum > 1
        },
        stats: {
          averageRating: parseFloat(averageRating),
          totalReviews,
          totalLikes
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user reviews',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/reviews/recent
 * @desc    Get recent reviews
 * @access  Public
 */
router.get('/recent', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    const recentReviews = reviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limitNum);

    res.json({
      success: true,
      data: {
        reviews: recentReviews,
        count: recentReviews.length
      }
    });

  } catch (error) {
    console.error('Get recent reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent reviews',
      error: error.message
    });
  }
});

module.exports = router; 