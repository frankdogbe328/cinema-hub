#!/usr/bin/env node

const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('📧 Testing Email Configuration');
console.log('===============================\n');

// Check if email credentials are set
console.log('🔍 Checking email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('\n❌ Email credentials not configured!');
  console.log('💡 Run: node configure-email.js');
  process.exit(1);
}

// Create transporter
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('\n✅ Email transporter created successfully');
} catch (error) {
  console.log('\n❌ Error creating email transporter:', error.message);
  process.exit(1);
}

// Test email sending
async function testEmailSending() {
  console.log('\n📤 Testing email sending...');
  
  const testEmail = process.env.EMAIL_USER; // Send to yourself
  const testOTP = Math.floor(100000 + Math.random() * 900000);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'CinemaHub <noreply@cinemahub.com>',
    to: testEmail,
    subject: 'CinemaHub - Email Test',
    html: `
      <h2>🎬 CinemaHub Email Test</h2>
      <p>This is a test email to verify your email configuration is working.</p>
      <p><strong>Test OTP Code:</strong> ${testOTP}</p>
      <p>If you received this email, your email configuration is working correctly!</p>
      <p>You can now use real email OTP functionality in CinemaHub.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Check your inbox: ${testEmail}`);
    console.log(`🔢 Test OTP: ${testOTP}`);
    
    console.log('\n🎉 Email configuration is working!');
    console.log('💡 You can now start the server and test real OTP functionality.');
    
  } catch (error) {
    console.log('❌ Failed to send test email:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Common solutions:');
      console.log('1. Make sure you\'re using an App Password, not your regular Gmail password');
      console.log('2. Ensure 2-Factor Authentication is enabled on your Gmail account');
      console.log('3. Check that the App Password is correct (16 characters)');
    } else if (error.message.includes('Less secure app access')) {
      console.log('\n💡 Enable "Less secure app access" in your Google Account settings');
    }
  }
}

// Run the test
testEmailSending();
