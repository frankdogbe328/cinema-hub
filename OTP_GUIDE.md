# 🔐 OTP Verification Guide

## How OTP Verification Works in CinemaHub

When you sign up for CinemaHub, you need to verify your email address using a 6-digit OTP (One-Time Password) code.

## 📧 Current Setup: Development Mode

Since email is not fully configured yet, the OTP is displayed in the **server console** instead of being sent via email.

### 🔍 How to Find Your OTP:

1. **Start the server** (if not already running):
   ```bash
   npm start
   ```

2. **Register a new account** through the website

3. **Check the server console** (the terminal where you ran `npm start`)

4. **Look for this line**:
   ```
   📧 Development OTP for your-email@example.com: 123456
   ```

5. **Use that 6-digit code** to verify your email

## 🌐 How to Verify Your Email:

### Option 1: Through the Website
1. Go to the login page
2. Click "Verify Email" or "Enter OTP"
3. Enter the 6-digit code from the server console
4. Click "Verify"

### Option 2: Direct API Call
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","otp":"123456"}'
```

## ✅ After Verification:

Once you verify your email:
- Your account will be marked as verified
- You can log in normally
- You'll receive a JWT token for authentication

## 🚀 To Enable Real Email Sending:

Follow the instructions in `EMAIL_SETUP.md` to configure email credentials and enable actual email delivery.

## 🔧 Troubleshooting:

### OTP Not Working?
- Check that you're using the correct email address
- Make sure the OTP hasn't expired (10 minutes)
- Verify you're copying all 6 digits correctly

### Can't Find the OTP?
- Make sure the server is running
- Check the terminal/console where you started the server
- Look for lines starting with "📧 Development OTP"

### Server Not Running?
- Start it with: `npm start`
- Check for any error messages
- Make sure port 3000 is available

## 📱 Example Flow:

1. **Register**: `test@example.com` / `password123`
2. **Server Console Shows**: `📧 Development OTP for test@example.com: 789012`
3. **Verify**: Use `789012` as the OTP
4. **Login**: Now you can log in with `test@example.com` / `password123` 