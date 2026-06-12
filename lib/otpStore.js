const otps = new Map();

const TTL_MS = 10 * 60 * 1000;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function setOtp(email, otp) {
  otps.set(email.toLowerCase(), { otp, expiresAt: Date.now() + TTL_MS });
}

function verifyOtp(email, otp) {
  const entry = otps.get(email.toLowerCase());
  if (!entry) return { ok: false, reason: 'No code requested. Please resend.' };
  if (Date.now() > entry.expiresAt) {
    otps.delete(email.toLowerCase());
    return { ok: false, reason: 'Code expired. Please resend.' };
  }
  if (entry.otp !== String(otp)) return { ok: false, reason: 'Invalid code.' };
  otps.delete(email.toLowerCase());
  return { ok: true };
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of otps.entries()) if (v.expiresAt < now) otps.delete(k);
}, 60 * 1000).unref?.();

module.exports = { generateOtp, setOtp, verifyOtp };
