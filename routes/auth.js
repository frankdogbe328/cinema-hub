const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { signToken } = require('../middleware/auth');
const { sendOtp, sendPasswordReset } = require('../lib/email');
const otpStore = require('../lib/otpStore');
const { requireDB } = require('../db');

function fail(res, status, message, extra) {
  return res.status(status).json({ message, ...(extra || {}) });
}

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
}

router.post(
  '/register',
  requireDB,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    const v = handleValidation(req, res); if (v) return v;
    try {
      const { email, username, password } = req.body;
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && existing.isVerified) return fail(res, 409, 'Email is already registered');

      const passwordHash = await bcrypt.hash(password, 12);
      const user =
        existing ||
        new User({ email: email.toLowerCase(), username, isVerified: false });
      user.username = username;
      user.passwordHash = passwordHash;
      user.authProvider = 'email';
      await user.save();

      const otp = otpStore.generateOtp();
      otpStore.setOtp(user.email, otp);
      if (!(await sendOtp(user.email, otp))) {
        console.log(`📧 [dev] OTP for ${user.email}: ${otp}`);
      }

      res.status(201).json({ message: 'Verification code sent to your email' });
    } catch (err) {
      console.error('register error', err);
      fail(res, 500, 'Registration failed');
    }
  }
);

router.post(
  '/verify-otp',
  requireDB,
  [body('email').isEmail(), body('otp').isLength({ min: 6, max: 6 })],
  async (req, res) => {
    const v = handleValidation(req, res); if (v) return v;
    try {
      const { email, otp } = req.body;
      const result = otpStore.verifyOtp(email, otp);
      if (!result.ok) return fail(res, 400, result.reason);

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return fail(res, 404, 'User not found');

      user.isVerified = true;
      await user.save();

      const token = signToken(user);
      res.json({ token, user: user.toPublic() });
    } catch (err) {
      console.error('verify-otp error', err);
      fail(res, 500, 'Verification failed');
    }
  }
);

router.post(
  '/resend-otp',
  requireDB,
  [body('email').isEmail()],
  async (req, res) => {
    const v = handleValidation(req, res); if (v) return v;
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return fail(res, 404, 'User not found');

      const otp = otpStore.generateOtp();
      otpStore.setOtp(user.email, otp);
      if (!(await sendOtp(user.email, otp))) {
        console.log(`📧 [dev] OTP for ${user.email}: ${otp}`);
      }
      res.json({ message: 'New code sent' });
    } catch (err) {
      console.error('resend-otp error', err);
      fail(res, 500, 'Could not resend code');
    }
  }
);

router.post(
  '/login',
  requireDB,
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const v = handleValidation(req, res); if (v) return v;
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !user.passwordHash) return fail(res, 400, 'Invalid email or password');

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return fail(res, 400, 'Invalid email or password');
      if (!user.isVerified) return fail(res, 403, 'Please verify your email first');

      const token = signToken(user);
      res.json({ token, user: user.toPublic() });
    } catch (err) {
      console.error('login error', err);
      fail(res, 500, 'Login failed');
    }
  }
);

router.post(
  '/forgot-password',
  requireDB,
  [body('email').isEmail()],
  async (req, res) => {
    const v = handleValidation(req, res); if (v) return v;
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        const resetToken = jwt.sign({ userId: user._id.toString(), type: 'pwd-reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
        await sendPasswordReset(email, resetUrl);
      }
      res.json({ message: 'If an account exists, a reset link was sent.' });
    } catch (err) {
      console.error('forgot-password error', err);
      fail(res, 500, 'Could not send reset email');
    }
  }
);

router.post(
  '/reset-password',
  requireDB,
  [body('token').notEmpty(), body('password').isLength({ min: 8 })],
  async (req, res) => {
    const v = handleValidation(req, res); if (v) return v;
    try {
      const { token, password } = req.body;
      let decoded;
      try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
      catch { return fail(res, 400, 'Invalid or expired reset token'); }
      if (decoded.type !== 'pwd-reset') return fail(res, 400, 'Invalid reset token');

      const user = await User.findById(decoded.userId);
      if (!user) return fail(res, 404, 'User not found');

      user.passwordHash = await bcrypt.hash(password, 12);
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error('reset-password error', err);
      fail(res, 500, 'Password reset failed');
    }
  }
);

module.exports = router;
