@echo off
echo 🌐 CinemaHub Deployment Helper
echo ==============================
echo.
echo This will help you deploy CinemaHub to the internet!
echo.
echo Choose your hosting platform:
echo 1. Vercel (Recommended - Free)
echo 2. Netlify (Free)
echo 3. Heroku (Paid - $7/month)
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto vercel
if "%choice%"=="2" goto netlify
if "%choice%"=="3" goto heroku
goto end

:vercel
echo.
echo 🚀 Deploying to Vercel...
echo.
echo Steps:
echo 1. Go to: https://vercel.com
echo 2. Sign up with GitHub
echo 3. Click "New Project"
echo 4. Import your CinemaHub repository
echo 5. Add these environment variables:
echo    - EMAIL_USER: your-gmail@gmail.com
echo    - EMAIL_PASS: your-app-password
echo    - EMAIL_FROM: CinemaHub ^<your-gmail@gmail.com^>
echo    - JWT_SECRET: your-secret-key
echo 6. Click "Deploy"
echo.
echo Your CinemaHub will be live at: https://your-project.vercel.app
goto end

:netlify
echo.
echo 🚀 Deploying to Netlify...
echo.
echo Steps:
echo 1. Go to: https://netlify.com
echo 2. Sign up for free
echo 3. Drag and drop your project folder
echo 4. Configure environment variables
echo 5. Deploy!
echo.
echo Your CinemaHub will be live at: https://your-project.netlify.app
goto end

:heroku
echo.
echo 🚀 Deploying to Heroku...
echo.
echo Steps:
echo 1. Go to: https://heroku.com
echo 2. Create new app
echo 3. Connect GitHub repository
echo 4. Add environment variables
echo 5. Deploy!
echo.
echo Your CinemaHub will be live at: https://your-app.herokuapp.com
goto end

:end
echo.
echo 📋 Before deploying, make sure:
echo ✅ Your .env file has correct email settings
echo ✅ You've tested locally
echo ✅ All files are committed to Git
echo.
echo 🎉 Good luck with your deployment!
pause
