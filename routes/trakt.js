const express = require('express');
const router = express.Router();
const axios = require('axios');

// Trakt API Configuration
const TRAKT_BASE_URL = 'https://api.trakt.tv';
const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID || 'your_trakt_client_id';
const TRAKT_CLIENT_SECRET = process.env.TRAKT_CLIENT_SECRET || 'your_trakt_client_secret';

// Check if we have real Trakt credentials
const hasRealTraktCredentials = TRAKT_CLIENT_ID !== 'your_trakt_client_id' && TRAKT_CLIENT_SECRET !== 'your_trakt_client_secret';

// Mock Trakt data for development
const mockTraktMovies = [
    {
        id: 1,
        title: "The Avengers",
        year: 2012,
        slug: "the-avengers-2012",
        imdb: "tt0848228",
        tmdb: "tt0848228",
        poster: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
        rating: 8.0,
        votes: 1234567,
        overview: "When an unexpected enemy emerges and threatens global safety and security, Nick Fury, director of the international peacekeeping agency known as S.H.I.E.L.D., finds himself in need of a team to pull the world back from the brink of disaster.",
        tagline: "Some assembly required.",
        runtime: 143,
        genres: ["Action", "Adventure", "Sci-Fi"],
        language: "en",
        country: "US",
        released: "2012-04-27",
        source: 'trakt'
    },
    {
        id: 2,
        title: "The Dark Knight",
        year: 2008,
        slug: "the-dark-knight-2008",
        imdb: "tt0468569",
        tmdb: "tt0468569",
        poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        rating: 9.0,
        votes: 2345678,
        overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        tagline: "Why So Serious?",
        runtime: 152,
        genres: ["Action", "Crime", "Drama"],
        language: "en",
        country: "US",
        released: "2008-07-18",
        source: 'trakt'
    },
    {
        id: 3,
        title: "Inception",
        year: 2010,
        slug: "inception-2010",
        imdb: "tt1375666",
        tmdb: "tt1375666",
        poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        rating: 8.8,
        votes: 2109876,
        overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: inception.",
        tagline: "Your mind is the scene of the crime.",
        runtime: 148,
        genres: ["Action", "Adventure", "Sci-Fi"],
        language: "en",
        country: "US",
        released: "2010-07-16",
        source: 'trakt'
    },
    {
        id: 4,
        title: "Interstellar",
        year: 2014,
        slug: "interstellar-2014",
        imdb: "tt0816692",
        tmdb: "tt0816692",
        poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        rating: 8.6,
        votes: 1654321,
        overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
        tagline: "Mankind was born on Earth. It was never meant to die here.",
        runtime: 169,
        genres: ["Adventure", "Drama", "Sci-Fi"],
        language: "en",
        country: "US",
        released: "2014-11-07",
        source: 'trakt'
    },
    {
        id: 5,
        title: "The Matrix",
        year: 1999,
        slug: "the-matrix-1999",
        imdb: "tt0133093",
        tmdb: "tt0133093",
        poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        rating: 8.7,
        votes: 1876543,
        overview: "A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to break free.",
        tagline: "Welcome to the Real World.",
        runtime: 136,
        genres: ["Action", "Sci-Fi"],
        language: "en",
        country: "US",
        released: "1999-03-31",
        source: 'trakt'
    }
];

// Trakt API headers
const getTraktHeaders = (accessToken = null) => {
    const headers = {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': TRAKT_CLIENT_ID
    };
    
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return headers;
};

// Mock search function
const mockSearch = (query) => {
    const searchTerm = query.toLowerCase();
    return mockTraktMovies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.overview.toLowerCase().includes(searchTerm) ||
        movie.genres.some(genre => genre.toLowerCase().includes(searchTerm))
    );
};

/**
 * @route   GET /api/trakt/trending
 * @desc    Get trending movies from Trakt
 * @access  Public
 */
router.get('/trending', async (req, res) => {
    try {
        if (!hasRealTraktCredentials) {
            // Use mock data
            console.log('Using mock Trakt trending data (no API credentials)');
            res.json({
                success: true,
                data: mockTraktMovies.slice(0, 5),
                pagination: {
                    page: 1,
                    limit: 5,
                    total: 5
                }
            });
            return;
        }

        const { limit = 20, page = 1 } = req.query;
        
        const response = await axios.get(`${TRAKT_BASE_URL}/movies/trending`, {
            headers: getTraktHeaders(),
            params: { limit, page }
        });
        
        // Transform Trakt data to match our format
        const movies = response.data.map(item => ({
            id: item.movie.ids.trakt,
            title: item.movie.title,
            year: item.movie.year,
            slug: item.movie.ids.slug,
            imdb: item.movie.ids.imdb,
            tmdb: item.movie.ids.tmdb,
            poster: item.movie.ids.tmdb ? `https://image.tmdb.org/t/p/w500${item.movie.ids.tmdb}` : null,
            backdrop: item.movie.ids.tmdb ? `https://image.tmdb.org/t/p/original${item.movie.ids.tmdb}` : null,
            watchers: item.watchers,
            rating: item.movie.rating,
            votes: item.movie.votes,
            overview: item.movie.overview,
            tagline: item.movie.tagline,
            runtime: item.movie.runtime,
            genres: item.movie.genres,
            language: item.movie.language,
            country: item.movie.country,
            released: item.movie.released,
            updated_at: item.movie.updated_at,
            source: 'trakt'
        }));
        
        res.json({
            success: true,
            data: movies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: response.data.length
            }
        });
        
    } catch (error) {
        console.error('Trakt trending error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trending movies',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/trakt/popular
 * @desc    Get popular movies from Trakt
 * @access  Public
 */
router.get('/popular', async (req, res) => {
    try {
        if (!hasRealTraktCredentials) {
            // Use mock data
            console.log('Using mock Trakt popular data (no API credentials)');
            res.json({
                success: true,
                data: mockTraktMovies.slice(0, 5),
                pagination: {
                    page: 1,
                    limit: 5,
                    total: 5
                }
            });
            return;
        }

        const { limit = 20, page = 1 } = req.query;
        
        const response = await axios.get(`${TRAKT_BASE_URL}/movies/popular`, {
            headers: getTraktHeaders(),
            params: { limit, page }
        });
        
        const movies = response.data.map(movie => ({
            id: movie.ids.trakt,
            title: movie.title,
            year: movie.year,
            slug: movie.ids.slug,
            imdb: movie.ids.imdb,
            tmdb: movie.ids.tmdb,
            poster: item.movie.ids.tmdb ? `https://image.tmdb.org/t/p/w500${item.movie.ids.tmdb}` : null,
            backdrop: item.movie.ids.tmdb ? `https://image.tmdb.org/t/p/original${item.movie.ids.tmdb}` : null,
            rating: movie.rating,
            votes: movie.votes,
            overview: movie.overview,
            tagline: movie.tagline,
            runtime: movie.runtime,
            genres: movie.genres,
            language: movie.language,
            country: movie.country,
            released: movie.released,
            updated_at: movie.updated_at,
            source: 'trakt'
        }));
        
        res.json({
            success: true,
            data: movies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: response.data.length
            }
        });
        
    } catch (error) {
        console.error('Trakt popular error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch popular movies',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/trakt/search
 * @desc    Search movies on Trakt
 * @access  Public
 */
router.get('/search', async (req, res) => {
    try {
        const { query, type = 'movie', limit = 20, page = 1 } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        if (!hasRealTraktCredentials) {
            // Use mock search
            console.log(`Using mock Trakt search for: "${query}" (no API credentials)`);
            const mockResults = mockSearch(query);
            
            res.json({
                success: true,
                data: mockResults.map(movie => ({
                    type: 'movie',
                    score: 1.0,
                    movie: movie
                })),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: mockResults.length
                }
            });
            return;
        }
        
        const response = await axios.get(`${TRAKT_BASE_URL}/search/${type}`, {
            headers: getTraktHeaders(),
            params: { query, limit, page }
        });
        
        const results = response.data.map(item => ({
            type: item.type,
            score: item.score,
            movie: item.movie ? {
                id: item.movie.ids.trakt,
                title: item.movie.title,
                year: item.movie.year,
                slug: item.movie.ids.slug,
                imdb: item.movie.ids.imdb,
                tmdb: item.movie.ids.tmdb,
                poster: item.movie.ids.tmdb ? `https://image.tmdb.org/t/p/w500${item.movie.ids.tmdb}` : null,
                backdrop: item.movie.ids.tmdb ? `https://image.tmdb.org/t/p/original${item.movie.ids.tmdb}` : null,
                rating: item.movie.rating,
                votes: item.movie.votes,
                overview: item.movie.overview,
                tagline: item.movie.tagline,
                runtime: item.movie.runtime,
                genres: item.movie.genres,
                language: item.movie.language,
                country: item.movie.country,
                released: item.movie.released,
                updated_at: item.movie.updated_at,
                source: 'trakt'
            } : null,
            show: item.show ? {
                id: item.show.ids.trakt,
                title: item.show.title,
                year: item.show.year,
                slug: item.show.ids.slug,
                imdb: item.show.ids.imdb,
                tmdb: item.show.ids.tmdb,
                poster: item.show.ids.tmdb ? `https://image.tmdb.org/t/p/w500${item.show.ids.tmdb}` : null,
                backdrop: item.show.ids.tmdb ? `https://image.tmdb.org/t/p/original${item.show.ids.tmdb}` : null,
                rating: item.show.rating,
                votes: item.show.votes,
                overview: item.show.overview,
                tagline: item.show.tagline,
                runtime: item.show.runtime,
                genres: item.show.genres,
                language: item.show.language,
                country: item.show.country,
                released: item.show.released,
                updated_at: item.show.updated_at,
                source: 'trakt'
            } : null
        }));
        
        res.json({
            success: true,
            data: results,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: results.length
            }
        });
        
    } catch (error) {
        console.error('Trakt search error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to search Trakt',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/trakt/movie/:id
 * @desc    Get detailed movie information from Trakt
 * @access  Public
 */
router.get('/movie/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { extended = 'full' } = req.query;
        
        const response = await axios.get(`${TRAKT_BASE_URL}/movies/${id}`, {
            headers: getTraktHeaders(),
            params: { extended }
        });
        
        const movie = {
            id: response.data.ids.trakt,
            title: response.data.title,
            year: response.data.year,
            slug: response.data.ids.slug,
            imdb: response.data.ids.imdb,
            tmdb: response.data.ids.tmdb,
            poster: response.data.ids.tmdb ? `https://image.tmdb.org/t/p/w500${response.data.ids.tmdb}` : null,
            backdrop: response.data.ids.tmdb ? `https://image.tmdb.org/t/p/original${response.data.ids.tmdb}` : null,
            rating: response.data.rating,
            votes: response.data.votes,
            overview: response.data.overview,
            tagline: response.data.tagline,
            runtime: response.data.runtime,
            genres: response.data.genres,
            language: response.data.language,
            country: response.data.country,
            released: response.data.released,
            updated_at: response.data.updated_at,
            certification: response.data.certification,
            trailer: response.data.trailer,
            homepage: response.data.homepage,
            status: response.data.status,
            source: 'trakt'
        };
        
        res.json({
            success: true,
            data: movie
        });
        
    } catch (error) {
        console.error('Trakt movie detail error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch movie details',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/trakt/recommendations
 * @desc    Get movie recommendations from Trakt
 * @access  Public
 */
router.get('/recommendations', async (req, res) => {
    try {
        const { limit = 20, page = 1 } = req.query;
        
        const response = await axios.get(`${TRAKT_BASE_URL}/recommendations/movies`, {
            headers: getTraktHeaders(),
            params: { limit, page }
        });
        
        const movies = response.data.map(item => ({
            id: item.movie.ids.trakt,
            title: item.movie.title,
            year: item.movie.year,
            slug: item.movie.ids.slug,
            imdb: item.movie.ids.imdb,
            tmdb: item.movie.ids.tmdb,
            poster: item.movie.ids.tmdb ? `https://image.tmdb.org/t/p/w500${item.movie.ids.tmdb}` : null,
            backdrop: item.movie.ids.tmdb ? `https://image.tmdb.org/t/p/original${item.movie.ids.tmdb}` : null,
            rating: item.movie.rating,
            votes: item.movie.votes,
            overview: item.movie.overview,
            tagline: item.movie.tagline,
            runtime: item.movie.runtime,
            genres: item.movie.genres,
            language: item.movie.language,
            country: item.movie.country,
            released: item.movie.released,
            updated_at: item.movie.updated_at,
            source: 'trakt'
        }));
        
        res.json({
            success: true,
            data: movies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: response.data.length
            }
        });
        
    } catch (error) {
        console.error('Trakt recommendations error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recommendations',
            error: error.message
        });
    }
});

module.exports = router; 