// Script để test reset password flow
// Chạy: node test-reset-password.js

const testResetPassword = async () => {
  const BASE_URL = 'http://localhost:3000';
  
  console.log('🧪 Testing Reset Password Flow\n');
  
  // Test 1: Request OTP cho số đã đăng ký
  console.log('1️⃣ Test với số điện thoại đã đăng ký...');
  
  const phones = [
    '0912345678',
    '+84912345678',
    '84912345678'
  ];
  
  for (const phone of phones) {
    console.log(`\n📱 Testing phone: ${phone}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/otp/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phone,
          purpose: 'reset_password'
        })
      });
      
      const data = await response.json();
      
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, JSON.stringify(data, null, 2));
      
      if (response.ok) {
        console.log('✅ SUCCESS - OTP sent');
      } else {
        console.log('❌ FAILED -', data.message);
      }
    } catch (error) {
      console.log('❌ ERROR:', error.message);
    }
  }
  
  // Test 2: Check backend health
  console.log('\n\n2️⃣ Testing backend health...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Backend is running:', data);
  } catch (error) {
    console.log('❌ Backend is NOT running:', error.message);
  }
};

testResetPassword();

