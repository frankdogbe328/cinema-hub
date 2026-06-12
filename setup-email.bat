@echo off
echo 📧 CinemaHub Email Setup
echo ========================
echo.
echo This will help you set up real email OTP functionality.
echo.
echo You need:
echo 1. A Gmail account
echo 2. 2-Factor Authentication enabled
echo 3. An App Password for "Mail"
echo.
echo Gmail Setup Steps:
echo 1. Go to: https://myaccount.google.com/
echo 2. Security → 2-Step Verification
echo 3. Security → App passwords
echo 4. Generate new app password for "Mail"
echo 5. Copy the 16-character password
echo.
set /p EMAIL="Enter your Gmail address: "
set /p PASSWORD="Enter your 16-character App Password: "

echo.
echo Creating .env file...

(
echo # CinemaHub Environment Variables
echo JWT_SECRET=cinemahub-dev-secret-key-2024-change-in-production
echo MONGODB_URI=mongodb://localhost:27017/cinemahub
echo.
echo # Email Configuration - Gmail Setup
echo EMAIL_USER=%EMAIL%
echo EMAIL_PASS=%PASSWORD%
echo EMAIL_FROM=CinemaHub ^<%EMAIL%^>
echo.
echo # YouTube API ^(Optional^)
echo YOUTUBE_API_KEY=your-youtube-api-key
echo.
echo # Trakt API ^(Optional^)
echo TRAKT_CLIENT_ID=your_trakt_client_id
echo TRAKT_CLIENT_SECRET=your_trakt_client_secret
) > .env

echo ✅ .env file created successfully!
echo 📧 Email configured: %EMAIL%
echo.
echo 🚀 Next steps:
echo 1. Start the server: npm start
echo 2. Test registration with a real email address
echo 3. Check your email inbox for OTP codes
echo.
echo 📋 Test the OTP functionality:
echo 1. Go to: http://localhost:3000
echo 2. Click "Sign up"
echo 3. Enter a real email address
echo 4. Check your email for the OTP code
echo 5. Enter the OTP to verify your account
echo.
pause
