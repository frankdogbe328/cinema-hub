# Email Setup Guide for CinemaHub OTP

## Current Status

**Right now, OTP emails are NOT being sent to actual email addresses.** Instead, the OTP codes are being logged to the server console for development purposes.

## How to Enable Real Email Sending

### Step 1: Get Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already enabled)
3. Go to **Security** → **App passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### Step 2: Update Environment Variables

Edit your `.env` file and replace the placeholder values:

```env
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=CinemaHub <your-actual-gmail@gmail.com>
```

### Step 3: Restart the Server

```bash
# Stop the current server
Get-Process -Name "node" | Stop-Process -Force

# Start the server again
node server.js
```

### Step 4: Test Email Functionality

1. Go to your CinemaHub website
2. Try to register a new user with a real email address
3. Check the email inbox for the OTP code
4. Use the OTP code to verify the account

## Current Behavior (Development Mode)

When email credentials are not configured:

✅ **Registration works** - Users can register successfully  
✅ **OTP is generated** - A 6-digit code is created  
✅ **OTP is logged** - Check server console for the code  
❌ **Email not sent** - No actual email is delivered  

## Server Console Output

When you register, you'll see output like this in the server console:

```
📧 Development OTP for test@example.com: 123456
💡 To enable email sending, configure EMAIL_USER and EMAIL_PASS in your .env file
```

## Troubleshooting

### "Network Error" when registering
- Make sure the server is running (`node server.js`)
- Check that the API URL in `login.html` is correct (`http://localhost:3000`)

### OTP not received in email
- Verify your Gmail app password is correct
- Check that 2-Step Verification is enabled on your Google account
- Make sure you're using the app password, not your regular Gmail password

### Server won't start
- Check that all required packages are installed (`npm install`)
- Verify the `.env` file exists and has the correct format

## Security Notes

- Never commit your `.env` file to version control
- Use app passwords, not your main Gmail password
- The JWT_SECRET should be a strong, random string in production 