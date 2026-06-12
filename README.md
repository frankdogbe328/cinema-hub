# CinemaHub - Movie Discovery Platform

A comprehensive movie discovery and streaming platform built with Node.js, Express, and modern web technologies.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```

### Starting the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

### Testing Authentication
1. Start the server using one of the commands above
2. Open `http://localhost:3000` in your browser
3. You'll be redirected to the login page
4. Use these test credentials:
   - **Email:** `admin@cinemahub.com`
   - **Password:** `admin123`

### Offline Mode
If the server is not running, the application will automatically switch to offline mode and use local authentication.

## 🔧 Features

- **Authentication System**: Secure login with JWT tokens
- **Movie Search**: Search across multiple sources (Local, YouTube, Google)
- **Watchlist Management**: Save and manage your favorite movies
- **User Reviews**: Rate and review movies
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Technical Stack

- **Backend**: Node.js, Express.js
- **Authentication**: JWT, bcryptjs
- **Database**: MongoDB (optional, with mock data fallback)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Email**: Nodemailer (optional)

## 📁 Project Structure

```
movie/
├── server.js              # Main server file
├── index.html             # Main application page
├── login.html             # Authentication page
├── watchlist.html         # Watchlist management
├── cinemafile.html        # Movie details page
├── test.html              # Testing page
├── routes/                # API routes
│   ├── auth.js           # Authentication routes
│   ├── movies.js         # Movie management
│   ├── watchlist.js      # Watchlist operations
│   └── ...
└── package.json          # Dependencies and scripts
```

## 🔐 Authentication

The application uses a robust authentication system with:
- JWT token-based authentication
- Password hashing with bcrypt
- Fallback authentication for offline mode
- Automatic session management

## 🎯 Testing

1. **Server Health Check**: Visit `http://localhost:3000/api/health`
2. **Authentication Test**: Use the test page at `http://localhost:3000/test.html`
3. **Manual Testing**: Follow the login flow with test credentials

## 🚨 Troubleshooting

### "Failed to fetch" Error
1. Ensure the server is running (`npm start` or `npm run dev`)
2. Check if port 3000 is available
3. The app will automatically use offline mode if server is unavailable

### Login Issues
1. Verify you're using the correct test credentials
2. Check browser console for error messages
3. Ensure all dependencies are installed (`npm install`)

## 📝 Environment Variables

Create a `.env` file for production:
```
JWT_SECRET=your-secret-key
MONGODB_URI=your-mongodb-connection-string
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
YOUTUBE_API_KEY=your-youtube-api-key
TRAKT_CLIENT_ID=your_trakt_client_id
TRAKT_CLIENT_SECRET=your_trakt_client_secret
```

### 🎬 Trakt API Setup

To enable Trakt integration:

1. **Register for Trakt API:**
   - Go to https://trakt.tv/oauth/applications
   - Create a new application
   - Set redirect URI to: `http://localhost:3000/auth/trakt/callback`

2. **Get API Credentials:**
   - Copy the Client ID and Client Secret
   - Add them to your `.env` file

3. **Test Trakt Integration:**
   - Start the server: `npm start`
   - Search for movies using the Trakt source
   - View trending and popular movies from Trakt

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details 