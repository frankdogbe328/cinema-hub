const mongoose = require('mongoose');

// Cache the connection across serverless invocations (Vercel reuses the module).
let cached = global.__mongooseConn;
if (!cached) cached = global.__mongooseConn = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  // Strip whitespace — Vercel env paste sometimes injects newlines mid-value.
  // The Mongo connection string has no whitespace, so this is lossless.
  const uri = (process.env.MONGODB_URI || '').replace(/\s+/g, '');
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
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 30000,
        dbName: (process.env.MONGODB_DB_NAME || 'cinemahub').replace(/\s+/g, ''),
      })
      .then((conn) => {
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        return conn.connection;
      })
      .catch((err) => {
        cached.promise = null;
        cached.lastError = err;
        console.error('❌ MongoDB connection error:', err.name, '-', err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.lastError = err;
    return null;
  }
}

function lastDBError() {
  return cached.lastError || null;
}

function requireDB(req, res, next) {
  if (mongoose.connection.readyState === 1) return next();
  // Try to (re)connect on demand so a cold start can still serve DB routes.
  connectDB()
    .then(() => {
      if (mongoose.connection.readyState === 1) return next();
      const e = lastDBError();
      res.status(503).json({
        message: 'Database unavailable. Check MONGODB_URI and Atlas Network Access (allow 0.0.0.0/0).',
        cause: e ? `${e.name}: ${e.message}` : null,
      });
    })
    .catch((err) => res.status(503).json({
      message: 'Database unavailable.',
      cause: err ? `${err.name}: ${err.message}` : null,
    }));
}

module.exports = { connectDB, requireDB, lastDBError };
