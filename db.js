const mongoose = require('mongoose');

let connecting = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connecting) return connecting;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error('MONGODB_URI is required in production');
    }
    console.log('⚠️  MONGODB_URI not set — persistence disabled (dev only)');
    return null;
  }

  connecting = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 10000,
      dbName: process.env.MONGODB_DB_NAME || 'cinemahub',
    })
    .then((conn) => {
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return conn.connection;
    })
    .catch((err) => {
      connecting = null;
      console.error('❌ MongoDB connection error:', err.message);
      throw err;
    });

  return connecting;
}

function requireDB(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database unavailable. Set MONGODB_URI.' });
  }
  next();
}

module.exports = { connectDB, requireDB };
