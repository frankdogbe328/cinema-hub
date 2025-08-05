const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// Mock user database (replace with MongoDB in production)
let users = [
  {
    id: 1,
    email: 'admin@cinemahub.com',
    username: 'admin',
    password: '$2a$12$dpIEAtZMvuyl117cZvKZdOSa2IvyaPnD92UkbHcq/cE.YuVL4uS8e', // admin123
    isVerified: true,
    createdAt: new Date()
  }
];

// Email configuration (with fallback for development)
let transporter;
console.log('🔍 Checking email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log('✅ Email credentials found, creating transporter...');
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('✅ Email transporter created successfully');
} else {
  console.log('ℹ️ Email not configured - OTP will be logged to console only');
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email, name, password } = req.body;

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      username: name,
      password: hashedPassword,
      isVerified: false,
      createdAt: new Date()
    };

    users.push(newUser);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    newUser.otp = otp;
    newUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Try to send email, but fallback to console log if email fails
    if (transporter) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'CinemaHub <noreply@cinemahub.com>',
          to: email,
          subject: 'CinemaHub - Email Verification',
          html: `
            <h2>Welcome to CinemaHub!</h2>
            <p>Your verification code is: <strong>${otp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't create this account, please ignore this email.</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${email}`);
      } catch (emailError) {
        console.log(`⚠️ Email sending failed for ${email}: ${emailError.message}`);
        console.log(`📧 Development OTP for ${email}: ${otp}`);
        console.log('💡 To enable email sending, update your .env file with valid email credentials');
      }
    } else {
      console.log(`📧 Development OTP for ${email}: ${otp}`);
      console.log('💡 To enable email sending, configure EMAIL_USER and EMAIL_PASS in your .env file');
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify email with OTP
 * @access  Public
 */
router.post('/verify-otp', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email, otp } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.otp !== parseInt(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Mark user as verified
    user.isVerified = true;
    delete user.otp;
    delete user.otpExpiry;

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-for-development';
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP to user's email
 * @access  Public
 */
router.post('/resend-otp', [
  body('email').isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Try to send email, but fallback to console log if email fails
    if (transporter) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'CinemaHub <noreply@cinemahub.com>',
          to: email,
          subject: 'CinemaHub - New Verification Code',
          html: `
            <h2>New Verification Code</h2>
            <p>Your new verification code is: <strong>${otp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ New verification email sent to ${email}`);
      } catch (emailError) {
        console.log(`⚠️ Email sending failed for ${email}: ${emailError.message}`);
        console.log(`📧 Development OTP for ${email}: ${otp}`);
        console.log('💡 To enable email sending, update your .env file with valid email credentials');
      }
    } else {
      console.log(`📧 Development OTP for ${email}: ${otp}`);
      console.log('💡 To enable email sending, configure EMAIL_USER and EMAIL_PASS in your .env file');
    }

    res.json({
      success: true,
      message: 'New OTP sent successfully'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('🔐 Login attempt received:', { email: req.body.email });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log('🔍 Looking for user with email:', email);

    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ User found, checking password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isVerified) {
      console.log('❌ User not verified:', email);
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for user:', email);
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      }
    });

  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'CinemaHub <noreply@cinemahub.com>',
      to: email,
      subject: 'CinemaHub - Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      `
    };

    if (transporter) {
      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${email}`);
      } catch (emailError) {
        console.log(`⚠️ Password reset email failed for ${email}: ${emailError.message}`);
        console.log('💡 To enable email sending, update your .env file with valid email credentials');
        // Still return success to user, but log the error
      }
    } else {
      console.log(`📧 Password reset requested for ${email} (email not configured)`);
      console.log('💡 To enable email sending, configure EMAIL_USER and EMAIL_PASS in your .env file');
    }

    res.json({
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reset email',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);

    if (!user || user.resetToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    if (user.resetTokenExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    user.password = hashedPassword;
    delete user.resetToken;
    delete user.resetTokenExpiry;

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
});

module.exports = router; 