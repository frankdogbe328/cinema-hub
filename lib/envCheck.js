function isProd() {
  return process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
}

function validateEnv() {
  const missing = [];
  const required = ['JWT_SECRET', 'MONGODB_URI', 'TMDB_API_KEY'];
  const optional = ['GOOGLE_CLIENT_ID', 'EMAIL_USER', 'EMAIL_PASS'];

  for (const key of required) if (!process.env[key]) missing.push(key);

  if (missing.length) {
    const tag = isProd() ? '❌  MISSING required env vars (set them in your Vercel dashboard)' : '⚠️  Missing env vars';
    console.warn(`${tag}: ${missing.join(', ')}`);
  }

  const skippedOptional = optional.filter((k) => !process.env[k]);
  if (skippedOptional.length) {
    console.log('ℹ️  Optional env vars not set (feature degraded):', skippedOptional.join(', '));
  }

  return { missing, ok: missing.length === 0 };
}

module.exports = { validateEnv, isProd };
