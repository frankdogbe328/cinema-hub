// Vercel serverless entry. Re-exports the Express app from server.js so all
// /api/* requests are handled by the same routes used in local dev.
module.exports = require('../server.js');
