require('dotenv').config({ path: '.env.local' })
// Using built-in fetch (Node.js 18+)

async function confirmOrder() {
  try {
    // Step 1: Login as admin
    console.log('🔐 Logging in as admin...')
    const loginResponse = await fetch('http://localhost:3000/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    })
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`)
    }
    
    const loginData = await loginResponse.json()
    const token = loginData.token
    console.log('✅ Admin login successful')
    
    // Step 2: Get pending orders
    console.log('📋 Fetching pending orders...')
    const ordersResponse = await fetch('http://localhost:3000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!ordersResponse.ok) {
      throw new Error(`Failed to fetch orders: ${ordersResponse.status}`)
    }
    
    const ordersData = await ordersResponse.json()
    console.log(`📦 Found ${ordersData.orders.length} orders`)
    
    // Find the test order
    const testOrder = ordersData.orders.find(order => 
      order.order_id.startsWith('ORD-1755506840353') && 
      order.order_status === 'pending'
    )
    
    if (!testOrder) {
      console.log('❌ Test order not found or already processed')
      console.log('Available orders:')
      ordersData.orders.forEach(order => {
        console.log(`- ${order.order_id} (${order.order_status}) - ${order.customer_email}`)
      })
      return
    }
    
    console.log('🎯 Found test order:')
    console.log(`   Order ID: ${testOrder.order_id}`)
    console.log(`   Customer: ${testOrder.customer_name} (${testOrder.customer_email})`)
    console.log(`   Product: ${testOrder.products[0].title}`)
    console.log(`   Total: Rp ${testOrder.total_amount.toLocaleString('id-ID')}`)
    console.log(`   Status: ${testOrder.order_status}`)
    
    // Step 3: Confirm the order
    console.log('\n✅ Confirming order...')
    const confirmResponse = await fetch('http://localhost:3000/api/orders', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: testOrder._id,
        payment_status: 'paid',
        delivery_status: 'delivered',
        download_link: `http://localhost:3000/download/${testOrder.product_id}-${testOrder._id}`
      })
    })
    
    if (!confirmResponse.ok) {
      const errorText = await confirmResponse.text()
      throw new Error(`Failed to confirm order: ${confirmResponse.status} - ${errorText}`)
    }
    
    const confirmData = await confirmResponse.json()
    console.log('🎉 Order confirmed successfully!')
    console.log('📧 Email notification should be sent to customer')
    console.log('\n📋 Order Details:')
    console.log(`   Order ID: ${confirmData.order.order_id}`)
    console.log(`   Status: ${confirmData.order.order_status}`)
    console.log(`   Download Link: ${confirmData.order.download_links[0]}`)
    console.log(`   Customer Email: ${confirmData.order.customer_email}`)
    
    console.log('\n✨ Next step: Check Gmail for email notification!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

confirmOrder()