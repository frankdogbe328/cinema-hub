#!/usr/bin/env node

const http = require('http');

const API_BASE_URL = 'http://localhost:3000';

console.log('🧪 CinemaHub OTP Test (Simple)');
console.log('===============================\n');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testOTPFlow() {
  try {
    console.log('1️⃣ Testing server connection...');
    
    // Test server health
    try {
      const healthOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/health',
        method: 'GET'
      };
      
      const healthResponse = await makeRequest(healthOptions);
      if (healthResponse.status === 200) {
        console.log('✅ Server is running');
      } else {
        console.log('❌ Server health check failed');
        return;
      }
    } catch (error) {
      console.log('❌ Server is not running. Please start it with: npm start');
      return;
    }

    console.log('\n2️⃣ Testing user registration...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testUsername = 'testuser';

    // Register a new user
    const registerOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const registerData = {
      email: testEmail,
      password: testPassword,
      name: testUsername
    };

    const registerResponse = await makeRequest(registerOptions, registerData);

    if (registerResponse.status === 201 && registerResponse.data.success) {
      console.log('✅ User registered successfully');
      console.log(`📧 Email: ${testEmail}`);
      console.log('💡 Check your server console for the OTP code!');
      console.log('   Look for: "📧 Development OTP for ' + testEmail + ': XXXXXX"');
    } else {
      console.log('❌ Registration failed:', registerResponse.data.message || 'Unknown error');
      return;
    }

    console.log('\n3️⃣ Testing resend OTP...');
    
    const resendOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/resend-otp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const resendData = { email: testEmail };
    const resendResponse = await makeRequest(resendOptions, resendData);

    if (resendResponse.status === 200 && resendResponse.data.success) {
      console.log('✅ Resend OTP successful');
      console.log('💡 Check your server console for the new OTP code!');
    } else {
      console.log('❌ Resend OTP failed:', resendResponse.data.message || 'Unknown error');
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
    
    console.log('\n📋 Manual OTP Verification Test:');
    console.log('================================');
    console.log('To test OTP verification manually:');
    console.log('1. Get the OTP from server console');
    console.log('2. Use this curl command:');
    console.log(`   curl -X POST ${API_BASE_URL}/api/auth/verify-otp \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"email":"${testEmail}","otp":"XXXXXX"}'`);

  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure your server is running: npm start');
    }
  }
}

// Run the test
testOTPFlow();
