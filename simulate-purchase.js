require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

// Schemas
const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  discount: Number,
  category: String,
  file_url: String,
  watermark_url: String,
  preview_images: [String],
  downloads: Number,
  active: Boolean
}, { timestamps: true })

const OrderSchema = new mongoose.Schema({
  order_id: { type: String, unique: true },
  customer_name: String,
  customer_email: String,
  customer_phone: String,
  products: [{
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    price: Number,
    discount: Number,
    final_price: Number
  }],
  total_amount: Number,
  payment_method: String,
  payment_status: { type: String, default: 'pending' },
  order_status: { type: String, default: 'pending' },
  download_links: [String],
  notes: String
}, { timestamps: true })

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)

async function simulatePurchase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Find the 'test' product
    const testProduct = await Product.findOne({ title: 'test', active: true })
    
    if (!testProduct) {
      console.log('❌ Product "test" not found or not active')
      return
    }
    
    console.log('📦 Found product:')
    console.log(`   Title: ${testProduct.title}`)
    console.log(`   Category: ${testProduct.category}`)
    console.log(`   Price: Rp ${testProduct.price.toLocaleString('id-ID')}`)
    console.log(`   Discount: ${testProduct.discount || 0}%`)
    
    // Calculate final price
    const finalPrice = testProduct.discount > 0 
      ? testProduct.price * (1 - testProduct.discount / 100)
      : testProduct.price
    
    console.log(`   Final Price: Rp ${Math.round(finalPrice).toLocaleString('id-ID')}`)
    
    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Create order as a customer
    const newOrder = new Order({
      order_id: orderId,
      customer_name: 'Test Customer',
      customer_email: 'kangdidittt@gmail.com', // Using your real email for testing
      customer_phone: '+62812345678',
      products: [{
        product_id: testProduct._id,
        title: testProduct.title,
        price: testProduct.price,
        discount: testProduct.discount || 0,
        final_price: Math.round(finalPrice)
      }],
      total_amount: Math.round(finalPrice),
      payment_method: 'bank_transfer',
      payment_status: 'completed', // Simulate successful payment
      order_status: 'pending', // Waiting for admin confirmation
      download_links: [],
      notes: 'Simulasi pembelian untuk testing sistem notifikasi email'
    })
    
    await newOrder.save()
    
    console.log('\n🛒 Order created successfully!')
    console.log('=' .repeat(50))
    console.log(`Order ID: ${orderId}`)
    console.log(`Customer: ${newOrder.customer_name}`)
    console.log(`Email: ${newOrder.customer_email}`)
    console.log(`Product: ${testProduct.title}`)
    console.log(`Total: Rp ${newOrder.total_amount.toLocaleString('id-ID')}`)
    console.log(`Payment Status: ${newOrder.payment_status}`)
    console.log(`Order Status: ${newOrder.order_status}`)
    console.log('\n📧 Order is ready for admin confirmation!')
    console.log('Next step: Login to admin dashboard and confirm this order')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code === 11000) {
      console.log('💡 Order ID already exists, trying again...')
    }
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
  }
}

simulatePurchase()