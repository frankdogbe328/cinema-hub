# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### ❌ "Network Error - Please try again"

**Problem**: Frontend can't connect to backend API

**Solutions**:

1. **Check if server is running**:
   ```bash
   npm start
   # or
   node server.js
   ```

2. **Verify server is accessible**:
   ```bash
   curl http://localhost:3000
   # Should return HTML content
   ```

3. **Check port availability**:
   - Make sure port 3000 is not used by another application
   - Try a different port by updating `.env` file

4. **Check CORS settings**:
   - The server is configured to accept requests from:
     - `http://localhost:3000`
     - `http://127.0.0.1:5500`
     - `http://localhost:5500`

### ❌ "MongoDB connection error"

**Problem**: Server fails to start due to MongoDB connection

**Solution**: 
- MongoDB is now optional for development
- The server will use mock data if MongoDB is not available
- To use MongoDB, set `MONGODB_URI` in your `.env` file

### ❌ "Email sending failed"

**Problem**: OTP emails are not being sent

**Solutions**:

1. **Development Mode** (Current Setup):
   - OTP is logged to server console
   - Check terminal for: `📧 Development OTP for email@example.com: 123456`

2. **Enable Real Email**:
   - Follow instructions in `EMAIL_SETUP.md`
   - Configure `EMAIL_USER` and `EMAIL_PASS` in `.env`

### ❌ "Invalid credentials"

**Problem**: Login fails even with correct password

**Solutions**:

1. **Email not verified**:
   - Complete OTP verification first
   - Check server console for OTP code

2. **Wrong email/password**:
   - Verify you're using the correct credentials
   - Try registering a new account

### ❌ "OTP not working"

**Problem**: OTP verification fails

**Solutions**:

1. **Check OTP source**:
   - Use the OTP from server console (not email)
   - Make sure you're copying all 6 digits

2. **Check expiration**:
   - OTP expires after 10 minutes
   - Register again if expired

3. **Check email address**:
   - Use the exact email used during registration

## 🚀 Quick Fix Commands

### Restart Server
```bash
# Stop all Node processes
taskkill /F /IM node.exe

# Start server
npm start
```

### Test API Endpoints
```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Check Server Status
```bash
# Check if server is running
netstat -an | findstr :3000

# Test server response
curl http://localhost:3000
```

## 📱 Frontend Issues

### Browser Console Errors
1. **CORS errors**: Server is configured to handle CORS
2. **Network errors**: Check if server is running on port 3000
3. **API errors**: Verify API endpoints are correct

### Local Development
1. **Use Live Server**: Open HTML files with Live Server extension
2. **Check API URL**: Make sure `API_BASE_URL` points to `http://localhost:3000`
3. **Clear cache**: Hard refresh browser (Ctrl+F5)

## 🔍 Debug Mode

Enable debug logging by setting in `.env`:
```
NODE_ENV=development
DEBUG=true
```

This will show detailed server logs and API responses.

## 📞 Getting Help

If you're still experiencing issues:

1. **Check server logs** for error messages
2. **Verify all files** are in the correct locations
3. **Test with provided scripts**:
   - `node test-complete-flow.js`
   - `node test-api.js`
4. **Check file permissions** and ensure Node.js is installed 