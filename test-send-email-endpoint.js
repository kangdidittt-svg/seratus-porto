// Test endpoint /api/send-email using fetch API
async function testSendEmailEndpoint() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🧪 TESTING SEND EMAIL ENDPOINT')
  console.log('='.repeat(50))
  
  try {
    // Test 1: Send email with file link
    console.log('\n📧 Test 1: Send email with file link')
    const response1 = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'kangdidittt@gmail.com',
        subject: 'Test Email dengan File Link',
        fileLink: 'https://drive.google.com/file/d/1234567890abcdef/view?usp=sharing'
      })
    })
    
    const data1 = await response1.json()
    console.log('✅ Response Status:', response1.status)
    console.log('📄 Response Data:', JSON.stringify(data1, null, 2))
    
  } catch (error1) {
    console.log('❌ Test 1 Error:', error1.message)
  }
  
  try {
    // Test 2: Send email without file link
    console.log('\n📧 Test 2: Send email without file link')
    const response2 = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'kangdidittt@gmail.com',
        subject: 'Test Email tanpa File Link'
      })
    })
    
    const data2 = await response2.json()
    console.log('✅ Response Status:', response2.status)
    console.log('📄 Response Data:', JSON.stringify(data2, null, 2))
    
  } catch (error2) {
    console.log('❌ Test 2 Error:', error2.message)
  }
  
  try {
    // Test 3: Send email with default subject
    console.log('\n📧 Test 3: Send email with default subject')
    const response3 = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'kangdidittt@gmail.com',
        fileLink: 'https://drive.google.com/file/d/test987654321/view?usp=sharing'
      })
    })
    
    const data3 = await response3.json()
    console.log('✅ Response Status:', response3.status)
    console.log('📄 Response Data:', JSON.stringify(data3, null, 2))
    
  } catch (error3) {
    console.log('❌ Test 3 Error:', error3.message)
  }
  
  try {
    // Test 4: Invalid email format
    console.log('\n📧 Test 4: Invalid email format (should fail)')
    const response4 = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'invalid-email-format',
        subject: 'Test Invalid Email'
      })
    })
    
    const data4 = await response4.json()
    console.log('✅ Response Status:', response4.status)
    console.log('📄 Response Data:', JSON.stringify(data4, null, 2))
    
  } catch (error4) {
    console.log('❌ Test 4 Error (Expected):', error4.message)
  }
  
  try {
    // Test 5: Missing required field 'to'
    console.log('\n📧 Test 5: Missing required field \'to\' (should fail)')
    const response5 = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: 'Test Missing To Field',
        fileLink: 'https://drive.google.com/file/d/test123/view?usp=sharing'
      })
    })
    
    const data5 = await response5.json()
    console.log('✅ Response Status:', response5.status)
    console.log('📄 Response Data:', JSON.stringify(data5, null, 2))
    
  } catch (error5) {
    console.log('❌ Test 5 Error (Expected):', error5.message)
  }
  
  console.log('\n🏁 TESTING COMPLETED')
  console.log('='.repeat(50))
}

// Run the test
testSendEmailEndpoint().catch(console.error)