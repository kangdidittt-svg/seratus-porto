// Test admin login and email notification function
async function testAdminLoginAndEmail() {
  try {
    console.log('🔐 Testing admin login...');
    
    // Step 1: Login as admin to get valid token
    const loginResponse = await fetch('http://localhost:3000/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const loginResult = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ Admin login failed:', loginResult);
      return;
    }
    
    console.log('✅ Admin login successful!');
    console.log('👤 Admin user:', loginResult.user);
    
    // Step 2: Test email notification with valid admin token
    console.log('\n📧 Testing email notification...');
    
    const emailResponse = await fetch('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginResult.token}`
      },
      body: JSON.stringify({
        to: 'kangdidittt@gmail.com',
        subject: 'Test Email - Pesanan Dikonfirmasi',
        message: 'Halo,\n\nIni adalah test email notification dari Seratus Studio.\n\nPesanan Anda telah dikonfirmasi dan siap untuk diunduh.\n\nTerima kasih!',
        downloadLink: 'http://localhost:3000/download/test-order-123'
      })
    });
    
    const emailResult = await emailResponse.json();
    
    if (emailResponse.ok) {
      console.log('✅ Email test successful!');
      console.log('📧 Email details:', emailResult);
    } else {
      console.log('❌ Email test failed:', emailResult);
      console.log('📊 Response status:', emailResponse.status);
    }
    
  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }
}

// Run the test
testAdminLoginAndEmail();