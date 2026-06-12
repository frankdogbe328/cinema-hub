function isProd() {
  return process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
}

function validateEnv() {
  const missing = [];
  const required = ['JWT_SECRET', 'MONGODB_URI', 'TMDB_API_KEY'];
  const optional = ['GOOGLE_CLIENT_ID', 'EMAIL_USER', 'EMAIL_PASS'];

  for (const key of required) if (!process.env[key]) missing.push(key);

  if (isProd() && missing.length) {
    console.error('❌ Missing required env vars:', missing.join(', '));
    console.error('   Set them in your Vercel project settings before deploying.');
    process.exit(1);
  }

  if (missing.length) {
    console.warn('⚠️  Missing env vars (dev only — features will fall back):', missing.join(', '));
  }

  const skippedOptional = optional.filter((k) => !process.env[k]);
  if (skippedOptional.length) {
    console.log('ℹ️  Optional env vars not set (feature degraded):', skippedOptional.join(', '));
  }
}

module.exports = { validateEnv, isProd };
