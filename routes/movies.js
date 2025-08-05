const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, query, validationResult } = require('express-validator');

// YouTube API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'YOUR_YOUTUBE_API_KEY';
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * @route   GET /api/movies/trailer
 * @desc    Get movie trailer from YouTube
 * @access  Public
 */
router.get('/trailer', [
  query('movieTitle').notEmpty().withMessage('Movie title is required'),
  query('year').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Invalid year')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { movieTitle, year } = req.query;
    
    if (!movieTitle) {
      return res.status(400).json({
        success: false,
        message: 'Movie title is required'
      });
    }

    // Construct search query
    let searchQuery = `${movieTitle} official trailer`;
    if (year) {
      searchQuery += ` ${year}`;
    }

    // Search for trailer on YouTube
    const searchResponse = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        videoCategoryId: '1', // Film & Animation
        maxResults: 5,
        key: YOUTUBE_API_KEY
      }
    });

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No trailer found for this movie'
      });
    }

    // Get video details for the first result
    const videoId = searchResponse.data.items[0].id.videoId;
    const videoResponse = await axios.get(`${YOUTUBE_BASE_URL}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: videoId,
        key: YOUTUBE_API_KEY
      }
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video details not found'
      });
    }

    const video = videoResponse.data.items[0];
    const trailerData = {
      videoId: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high.url,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      publishedAt: video.snippet.publishedAt,
      channelTitle: video.snippet.channelTitle,
      embedUrl: `https://www.youtube.com/embed/${video.id}`,
      watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
      searchQuery: searchQuery
    };

    res.json({
      success: true,
      message: 'Trailer found successfully',
      data: trailerData
    });

  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      return res.status(500).json({
        success: false,
        message: 'YouTube API quota exceeded or invalid API key',
        error: 'Please check your YouTube API key and quota'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch trailer',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/movies/trailer/:movieId
 * @desc    Get trailer for a specific movie by ID
 * @access  Public
 */
router.get('/trailer/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    
    // This would typically fetch movie details from your database
    // For now, we'll use a placeholder approach
    const movieTitle = req.query.title || 'Movie';
    
    // Search for trailer
    const searchResponse = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: `${movieTitle} official trailer`,
        type: 'video',
        videoCategoryId: '1',
        maxResults: 1,
        key: YOUTUBE_API_KEY
      }
    });

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No trailer found for this movie'
      });
    }

    const videoId = searchResponse.data.items[0].id.videoId;
    const video = searchResponse.data.items[0];

    const trailerData = {
      movieId: movieId,
      videoId: videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.high.url,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      publishedAt: video.snippet.publishedAt
    };

    res.json({
      success: true,
      message: 'Trailer found successfully',
      data: trailerData
    });

  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trailer',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/movies/search-trailers
 * @desc    Search for multiple trailers
 * @access  Public
 */
router.get('/search-trailers', [
  body('query').notEmpty().withMessage('Search query is required'),
  body('maxResults').optional().isInt({ min: 1, max: 20 }).withMessage('Max results must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { query, maxResults = 10 } = req.query;
    
    const searchResponse = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: `${query} trailer`,
        type: 'video',
        videoCategoryId: '1',
        maxResults: Math.min(maxResults, 20),
        key: YOUTUBE_API_KEY
      }
    });

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No trailers found for this search'
      });
    }

    const trailers = searchResponse.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    res.json({
      success: true,
      message: 'Trailers found successfully',
      data: {
        trailers,
        totalResults: searchResponse.data.pageInfo.totalResults,
        resultsPerPage: searchResponse.data.pageInfo.resultsPerPage
      }
    });

  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to search trailers',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/movies/trailer-info/:videoId
 * @desc    Get detailed information about a specific YouTube video
 * @access  Public
 */
router.get('/trailer-info/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    const videoResponse = await axios.get(`${YOUTUBE_BASE_URL}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: videoId,
        key: YOUTUBE_API_KEY
      }
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const video = videoResponse.data.items[0];
    
    // Parse duration (ISO 8601 format)
    const duration = video.contentDetails.duration;
    const durationRegex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(durationRegex);
    const hours = parseInt(matches[1]) || 0;
    const minutes = parseInt(matches[2]) || 0;
    const seconds = parseInt(matches[3]) || 0;
    const formattedDuration = `${hours > 0 ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const videoInfo = {
      videoId: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high.url,
      duration: {
        iso: duration,
        formatted: formattedDuration,
        seconds: hours * 3600 + minutes * 60 + seconds
      },
      statistics: {
        viewCount: parseInt(video.statistics.viewCount) || 0,
        likeCount: parseInt(video.statistics.likeCount) || 0,
        commentCount: parseInt(video.statistics.commentCount) || 0
      },
      publishedAt: video.snippet.publishedAt,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      tags: video.snippet.tags || [],
      categoryId: video.snippet.categoryId,
      embedUrl: `https://www.youtube.com/embed/${video.id}`,
      watchUrl: `https://www.youtube.com/watch?v=${video.id}`
    };

    res.json({
      success: true,
      message: 'Video information retrieved successfully',
      data: videoInfo
    });

  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get video information',
      error: error.message
    });
  }
});

module.exports = router; 