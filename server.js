const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Set JWT_SECRET if not provided (for development only)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'cinemahub-dev-secret-key-2024-change-in-production';
  console.log('⚠️ JWT_SECRET not found in environment variables. Using development fallback.');
  console.log('💡 For production, set JWT_SECRET in your .env file');
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https:"],
      mediaSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'", "https:"],
      workerSrc: ["'self'", "blob:"],
      frameAncestors: ["'self'"]
    }
  }
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// Database connection (optional for development)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('⚠️ MongoDB connection failed (using mock data):', err.message));
} else {
  console.log('ℹ️ MongoDB not configured - using mock data for development');
}

// Import routes
const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/google-auth');
const movieRoutes = require('./routes/movies');
const userRoutes = require('./routes/users');
const watchlistRoutes = require('./routes/watchlist');
const reviewRoutes = require('./routes/reviews');
const youtubeRoutes = require('./routes/youtube');
const traktRoutes = require('./routes/trakt');


// API routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/users', userRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/trakt', traktRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CinemaHub API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Authentication middleware for protected routes
const requireAuth = (req, res, next) => {
  // For HTML routes, we'll let the client-side handle authentication
  // This is just a basic check for API routes that might need protection
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token && req.path.startsWith('/api/') && !req.path.startsWith('/api/auth/')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  next();
};

// Apply authentication middleware to API routes
app.use('/api/', requireAuth);

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/watchlist', (req, res) => {
  res.sendFile(path.join(__dirname, 'watchlist.html'));
});

app.get('/movie/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'cinemafile.html'));
});

// Google OAuth callback route (for traditional OAuth flow)
app.get('/auth/google/callback', (req, res) => {
  // This is for traditional OAuth flow, not needed for Google Identity Services
  res.redirect('/login?message=google_oauth_configured');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access CinemaHub`);
});

module.exports = app; 