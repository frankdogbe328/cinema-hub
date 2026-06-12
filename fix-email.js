const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 CinemaHub Email Fix\n');

rl.question('Enter your Gmail address: ', (email) => {
  rl.question('Enter your 16-character App Password: ', (appPassword) => {
    const envContent = `# CinemaHub Environment Variables
JWT_SECRET=cinemahub-dev-secret-key-2024-change-in-production

# Email Configuration - Gmail Setup
EMAIL_USER=${email}
EMAIL_PASS=${appPassword}
EMAIL_FROM=${email}

# YouTube API (Optional)
YOUTUBE_API_KEY=your-youtube-api-key

# Trakt API (Optional)
TRAKT_CLIENT_ID=your_trakt_client_id
TRAKT_CLIENT_SECRET=your_trakt_client_secret`;

    fs.writeFileSync('.env', envContent);
    console.log('\n✅ Email configuration updated!');
    console.log('📧 Testing email delivery...');
    
    // Test email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: appPassword
      }
    });

    const mailOptions = {
      from: email,
      to: email,
      subject: 'CinemaHub OTP Test',
      text: 'This is a test email from CinemaHub. If you receive this, your email configuration is working!'
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('❌ Email test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure you have 2-Factor Authentication enabled on Gmail');
        console.log('2. Generate a new App Password: https://myaccount.google.com/apppasswords');
        console.log('3. Use the 16-character password (no spaces)');
      } else {
        console.log('✅ Email test successful!');
        console.log('📧 Check your inbox for the test email');
        console.log('\n🎉 Your OTP system should now work!');
      }
      rl.close();
    });
  });
});
