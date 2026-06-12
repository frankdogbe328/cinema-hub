#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📧 CinemaHub Email Setup Wizard');
console.log('================================\n');

console.log('This will help you configure email OTP functionality.\n');

console.log('📋 You have two options:');
console.log('1. Use Gmail (Recommended)');
console.log('2. Use other email provider');
console.log('3. Skip email setup (continue with console OTP)\n');

rl.question('Choose an option (1-3): ', (choice) => {
  switch(choice) {
    case '1':
      setupGmail();
      break;
    case '2':
      setupOtherEmail();
      break;
    case '3':
      console.log('\n✅ Skipping email setup. OTP will continue to work via console logs.');
      console.log('💡 You can run this setup again later with: node setup-email.js');
      rl.close();
      break;
    default:
      console.log('\n❌ Invalid choice. Please run the script again.');
      rl.close();
  }
});

function setupGmail() {
  console.log('\n📧 Gmail Setup');
  console.log('==============\n');
  
  console.log('To use Gmail, you need to:');
  console.log('1. Enable 2-Factor Authentication on your Google account');
  console.log('2. Generate an App Password for "Mail"');
  console.log('3. Use that App Password (not your regular password)\n');
  
  console.log('📖 Step-by-step guide:');
  console.log('1. Go to: https://myaccount.google.com/');
  console.log('2. Security → 2-Step Verification (enable if not already)');
  console.log('3. Security → App passwords');
  console.log('4. Generate new app password for "Mail"');
  console.log('5. Copy the 16-character password\n');
  
  rl.question('Enter your Gmail address: ', (email) => {
    rl.question('Enter your 16-character App Password: ', (password) => {
      createEnvFile(email, password, 'gmail');
    });
  });
}

function setupOtherEmail() {
  console.log('\n📧 Other Email Provider Setup');
  console.log('==============================\n');
  
  rl.question('Enter your email address: ', (email) => {
    rl.question('Enter your email password: ', (password) => {
      rl.question('Enter SMTP host (e.g., smtp.gmail.com): ', (host) => {
        rl.question('Enter SMTP port (e.g., 587): ', (port) => {
          createEnvFile(email, password, 'other', host, port);
        });
      });
    });
  });
}

function createEnvFile(email, password, provider, host = 'smtp.gmail.com', port = '587') {
  const envContent = `# CinemaHub Environment Variables
JWT_SECRET=cinemahub-dev-secret-key-2024-change-in-production
MONGODB_URI=mongodb://localhost:27017/cinemahub

# Email Configuration
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
    console.log(`🔧 Provider: ${provider}`);
    
    if (provider === 'other') {
      console.log(`🌐 SMTP Host: ${host}:${port}`);
    }
    
    console.log('\n🚀 Next steps:');
    console.log('1. Restart your server: npm start');
    console.log('2. Test registration with a real email address');
    console.log('3. Check your email inbox for OTP codes');
    
  } catch (error) {
    console.log('\n❌ Error creating .env file:', error.message);
    console.log('💡 You can manually create a .env file with the email credentials.');
  }
  
  rl.close();
}

// Handle Ctrl+C
rl.on('SIGINT', () => {
  console.log('\n\n👋 Setup cancelled. You can run this again anytime with: node setup-email.js');
  rl.close();
});
