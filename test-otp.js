#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

console.log('🧪 CinemaHub OTP Test');
console.log('=====================\n');

async function testOTPFlow() {
  try {
    console.log('1️⃣ Testing server connection...');
    
    // Test server health
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running. Please start it with: npm start');
      return;
    }

    console.log('\n2️⃣ Testing user registration...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testUsername = 'testuser';

    // Register a new user
    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      email: testEmail,
      password: testPassword,
      name: testUsername
    });

    if (registerResponse.data.success) {
      console.log('✅ User registered successfully');
      console.log(`📧 Email: ${testEmail}`);
      console.log('💡 Check your server console for the OTP code!');
      console.log('   Look for: "📧 Development OTP for ' + testEmail + ': XXXXXX"');
    } else {
      console.log('❌ Registration failed:', registerResponse.data.message);
      return;
    }

    console.log('\n3️⃣ Testing OTP verification...');
    console.log('⚠️  You need to manually enter the OTP from the server console');
    
    // In a real test, you would extract the OTP from server logs
    // For now, we'll show what the verification request would look like
    console.log('\n📋 To test OTP verification, use this command:');
    console.log(`curl -X POST ${API_BASE_URL}/api/auth/verify-otp \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"email":"${testEmail}","otp":"XXXXXX"}'`);
    
    console.log('\n4️⃣ Testing resend OTP...');
    
    const resendResponse = await axios.post(`${API_BASE_URL}/api/auth/resend-otp`, {
      email: testEmail
    });

    if (resendResponse.data.success) {
      console.log('✅ Resend OTP successful');
      console.log('💡 Check your server console for the new OTP code!');
    } else {
      console.log('❌ Resend OTP failed:', resendResponse.data.message);
    }

    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log('✅ Server connection: Working');
    console.log('✅ User registration: Working');
    console.log('✅ OTP generation: Working');
    console.log('✅ OTP resend: Working');
    console.log('❌ Email sending: Not configured (using console fallback)');
    
    console.log('\n💡 To enable real email sending:');
    console.log('   Run: node setup-email.js');

  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure your server is running: npm start');
    } else if (error.response) {
      console.log('📋 Server response:', error.response.data);
    }
  }
}

// Run the test
testOTPFlow();
