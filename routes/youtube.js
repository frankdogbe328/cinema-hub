const express = require('express');
const router = express.Router();
const axios = require('axios');

// YouTube API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'demo-key';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Search YouTube videos
router.get('/search', async (req, res) => {
    try {
        const { q: query, pageToken = '', maxResults = 12 } = req.query;

        if (!query) {
            return res.status(400).json({ 
                error: 'Search query is required',
                message: 'Please provide a search term'
            });
        }

        // If using demo key, return mock data
        if (YOUTUBE_API_KEY === 'demo-key') {
            const mockResults = generateMockYouTubeResults(query, pageToken, maxResults);
            return res.json(mockResults);
        }

        // Real YouTube API call
        const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
            params: {
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults: maxResults,
                pageToken: pageToken,
                key: YOUTUBE_API_KEY,
                videoEmbeddable: true,
                relevanceLanguage: 'en'
            }
        });

        // Get video details for duration
        const videoIds = response.data.items.map(item => item.id.videoId).join(',');
        const videoDetailsResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
            params: {
                part: 'contentDetails',
                id: videoIds,
                key: YOUTUBE_API_KEY
            }
        });

        // Combine search results with video details
        const videosWithDetails = response.data.items.map((item, index) => ({
            ...item,
            contentDetails: videoDetailsResponse.data.items[index]?.contentDetails || { duration: 'PT2M30S' }
        }));

        res.json({
            items: videosWithDetails,
            nextPageToken: response.data.nextPageToken,
            pageInfo: response.data.pageInfo
        });

    } catch (error) {
        console.error('YouTube API Error:', error.response?.data || error.message);
        
        // Return mock data on error for demo purposes
        const mockResults = generateMockYouTubeResults(req.query.q || 'movie', req.query.pageToken, req.query.maxResults);
        res.json(mockResults);
    }
});

// Get video details
router.get('/video/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;

        if (YOUTUBE_API_KEY === 'demo-key') {
            const mockVideo = generateMockVideoDetails(videoId);
            return res.json(mockVideo);
        }

        const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
            params: {
                part: 'snippet,contentDetails,statistics',
                id: videoId,
                key: YOUTUBE_API_KEY
            }
        });

        res.json(response.data);

    } catch (error) {
        console.error('YouTube Video Details Error:', error.response?.data || error.message);
        const mockVideo = generateMockVideoDetails(req.params.videoId);
        res.json({ items: [mockVideo] });
    }
});

// Generate mock YouTube search results
function generateMockYouTubeResults(query, pageToken = '', maxResults = 12) {
    const mockVideos = [];
    const videoTypes = ['Official Trailer', 'Movie Review', 'Behind the Scenes', 'Cast Interview', 'Movie Analysis', 'Teaser Trailer'];
    const channels = ['Movie Trailers', 'Cinema Reviews', 'Movie Making', 'Movie Interviews', 'Film Analysis', 'Hollywood News'];
    
    for (let i = 0; i < Math.min(maxResults, 8); i++) {
        const videoType = videoTypes[i % videoTypes.length];
        const channel = channels[i % channels.length];
        const videoId = `mock_${Date.now()}_${i}`;
        
        mockVideos.push({
            id: { videoId: videoId },
            snippet: {
                title: `${query} - ${videoType}`,
                description: `Watch the latest ${videoType.toLowerCase()} for ${query}. Don't miss this amazing content!`,
                channelTitle: channel,
                publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                thumbnails: {
                    default: { url: `https://via.placeholder.com/120x90/DC2626/FFFFFF?text=${videoType.split(' ')[0]}` },
                    medium: { url: `https://via.placeholder.com/320x180/DC2626/FFFFFF?text=${videoType.split(' ')[0]}` },
                    high: { url: `https://via.placeholder.com/480x360/DC2626/FFFFFF?text=${videoType.split(' ')[0]}` }
                }
            },
            contentDetails: { 
                duration: generateRandomDuration() 
            }
        });
    }

    return {
        items: mockVideos,
        nextPageToken: pageToken ? null : `mock_next_page_${Date.now()}`,
        pageInfo: {
            totalResults: 100,
            resultsPerPage: maxResults
        }
    };
}

// Generate mock video details
function generateMockVideoDetails(videoId) {
    return {
        id: videoId,
        snippet: {
            title: `Movie Trailer - ${videoId}`,
            description: 'This is a mock video description for demonstration purposes.',
            channelTitle: 'Movie Channel',
            publishedAt: new Date().toISOString(),
            thumbnails: {
                default: { url: 'https://via.placeholder.com/120x90/DC2626/FFFFFF?text=Video' },
                medium: { url: 'https://via.placeholder.com/320x180/DC2626/FFFFFF?text=Video' },
                high: { url: 'https://via.placeholder.com/480x360/DC2626/FFFFFF?text=Video' }
            }
        },
        contentDetails: {
            duration: generateRandomDuration()
        },
        statistics: {
            viewCount: Math.floor(Math.random() * 1000000),
            likeCount: Math.floor(Math.random() * 10000),
            commentCount: Math.floor(Math.random() * 1000)
        }
    };
}

// Generate random video duration
function generateRandomDuration() {
    const hours = Math.floor(Math.random() * 2);
    const minutes = Math.floor(Math.random() * 60);
    const seconds = Math.floor(Math.random() * 60);
    
    let duration = 'PT';
    if (hours > 0) duration += `${hours}H`;
    if (minutes > 0) duration += `${minutes}M`;
    if (seconds > 0) duration += `${seconds}S`;
    
    return duration;
}

module.exports = router; 