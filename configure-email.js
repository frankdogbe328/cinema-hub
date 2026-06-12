#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📧 CinemaHub Email Configuration');
console.log('=================================\n');

console.log('This will help you set up real email OTP functionality.\n');

console.log('📋 You need:');
console.log('1. A Gmail account');
console.log('2. 2-Factor Authentication enabled on Gmail');
console.log('3. An App Password for "Mail"\n');

console.log('🔧 Gmail Setup Steps:');
console.log('1. Go to: https://myaccount.google.com/');
console.log('2. Security → 2-Step Verification (enable if not already)');
console.log('3. Security → App passwords');
console.log('4. Generate new app password for "Mail"');
console.log('5. Copy the 16-character password\n');

rl.question('Enter your Gmail address: ', (email) => {
  rl.question('Enter your 16-character App Password: ', (password) => {
    
    const envContent = `# CinemaHub Environment Variables
JWT_SECRET=cinemahub-dev-secret-key-2024-change-in-production
MONGODB_URI=mongodb://localhost:27017/cinemahub

# Email Configuration - Gmail Setup
EMAIL_USER=${email}
EMAIL_PASS=${password}
EMAIL_FROM=CinemaHub <${email}>

# YouTube API (Optional)
YOUTUBE_API_KEY=your-youtube-api-key

# Trakt API (Optional)
TRAKT_CLIENT_ID=your_trakt_client_id
TRAKT_CLIENT_SECRET=your_trakt_client_secret
`;

    const envPath = path.join(__dirname, '.env');
    
    try {
      fs.writeFileSync(envPath, envContent);
      console.log('\n✅ .env file created successfully!');
      console.log(`📧 Email configured: ${email}`);
      
      console.log('\n🚀 Next steps:');
      console.log('1. Start the server: npm start');
      console.log('2. Test registration with a real email address');
      console.log('3. Check your email inbox for OTP codes');
      
      console.log('\n📋 Test the OTP functionality:');
      console.log('1. Go to: http://localhost:3000');
      console.log('2. Click "Sign up"');
      console.log('3. Enter a real email address');
      console.log('4. Check your email for the OTP code');
      console.log('5. Enter the OTP to verify your account');
      
    } catch (error) {
      console.log('\n❌ Error creating .env file:', error.message);
      console.log('💡 You can manually create a .env file with the email credentials.');
      console.log('\n📝 Manual .env file content:');
      console.log('============================');
      console.log(envContent);
    }
    
    rl.close();
  });
});

// Handle Ctrl+C
rl.on('SIGINT', () => {
  console.log('\n\n👋 Configuration cancelled.');
  rl.close();
});
