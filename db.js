const mongoose = require('mongoose');

// Cache the connection across serverless invocations (Vercel reuses the module).
let cached = global.__mongooseConn;
if (!cached) cached = global.__mongooseConn = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      console.error('❌  MONGODB_URI not set — DB-dependent routes will return 503.');
    } else {
      console.log('⚠️  MONGODB_URI not set — persistence disabled (dev only)');
    }
    return null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 8000,
        dbName: process.env.MONGODB_DB_NAME || 'cinemahub',
      })
      .then((conn) => {
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        return conn.connection;
      })
      .catch((err) => {
        cached.promise = null;
        console.error('❌ MongoDB connection error:', err.message);
        return null;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

function requireDB(req, res, next) {
  if (mongoose.connection.readyState === 1) return next();
  // Try to (re)connect on demand so a cold start can still serve DB routes.
  connectDB()
    .then(() => {
      if (mongoose.connection.readyState === 1) return next();
      res.status(503).json({ message: 'Database unavailable. Check MONGODB_URI.' });
    })
    .catch(() => res.status(503).json({ message: 'Database unavailable.' }));
}

module.exports = { connectDB, requireDB };
