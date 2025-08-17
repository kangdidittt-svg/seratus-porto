const mongoose = require('mongoose')

// Define Order schema directly in the script
const OrderSchema = new mongoose.Schema({
  customer_name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  customer_email: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  total_amount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  delivery_status: {
    type: String,
    enum: ['pending', 'processing', 'delivered', 'failed'],
    default: 'pending'
  },
  download_link: {
    type: String,
    default: null
  },
  download_expires: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Define Product schema directly in the script
const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['logo', 'branding', 'illustration', 'template', 'mockup', 'icon', 'other']
  },
  file_url: {
    type: String,
    required: [true, 'File URL is required']
  },
  watermark_url: {
    type: String,
    required: [true, 'Watermark URL is required']
  },
  preview_images: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  downloads: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

// Sample order data
const sampleOrders = [
  {
    customer_name: 'Ahmad Rizki',
    customer_email: 'ahmad.rizki@email.com',
    quantity: 1,
    total_amount: 150000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Terima kasih untuk desain logonya yang keren!'
  },
  {
    customer_name: 'Sari Dewi',
    customer_email: 'sari.dewi@gmail.com',
    quantity: 2,
    total_amount: 300000,
    payment_status: 'paid',
    delivery_status: 'processing',
    notes: 'Mohon dikirim dalam format AI dan PNG'
  },
  {
    customer_name: 'Budi Santoso',
    customer_email: 'budi.santoso@yahoo.com',
    quantity: 1,
    total_amount: 200000,
    payment_status: 'pending',
    delivery_status: 'pending',
    notes: 'Akan transfer setelah melihat preview final'
  },
  {
    customer_name: 'Maya Putri',
    customer_email: 'maya.putri@outlook.com',
    quantity: 3,
    total_amount: 450000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Sangat puas dengan hasilnya, akan order lagi!'
  },
  {
    customer_name: 'Andi Wijaya',
    customer_email: 'andi.wijaya@email.com',
    quantity: 1,
    total_amount: 175000,
    payment_status: 'failed',
    delivery_status: 'pending',
    notes: 'Pembayaran gagal, mohon info cara pembayaran lain'
  },
  {
    customer_name: 'Rina Sari',
    customer_email: 'rina.sari@gmail.com',
    quantity: 2,
    total_amount: 350000,
    payment_status: 'paid',
    delivery_status: 'processing',
    notes: 'Butuh revisi minor pada warna logo'
  },
  {
    customer_name: 'Doni Pratama',
    customer_email: 'doni.pratama@email.com',
    quantity: 1,
    total_amount: 125000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Perfect! Sesuai dengan brief yang diberikan'
  },
  {
    customer_name: 'Lisa Anggraini',
    customer_email: 'lisa.anggraini@yahoo.com',
    quantity: 4,
    total_amount: 600000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Order untuk 4 varian logo, semua sudah sesuai'
  },
  {
    customer_name: 'Rudi Hermawan',
    customer_email: 'rudi.hermawan@gmail.com',
    quantity: 1,
    total_amount: 180000,
    payment_status: 'pending',
    delivery_status: 'pending',
    notes: 'Menunggu konfirmasi final dari tim'
  },
  {
    customer_name: 'Fitri Handayani',
    customer_email: 'fitri.handayani@email.com',
    quantity: 2,
    total_amount: 320000,
    payment_status: 'paid',
    delivery_status: 'processing',
    notes: 'Mohon dipercepat karena ada deadline project'
  }
]

async function seedOrders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/seratus-porto')
    console.log('Connected to MongoDB')

    // Get existing products to assign to orders
    const products = await Product.find({ active: true }).limit(10)
    
    if (products.length === 0) {
      console.log('No products found. Please seed products first.')
      return
    }

    // Clear existing orders (optional)
    await Order.deleteMany({})
    console.log('Cleared existing orders')

    // Create orders with random products
    const ordersToCreate = sampleOrders.map((orderData, index) => {
      const randomProduct = products[index % products.length]
      return {
        ...orderData,
        product_id: randomProduct._id,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      }
    })

    // Insert orders
    const createdOrders = await Order.insertMany(ordersToCreate)
    console.log(`Successfully created ${createdOrders.length} sample orders`)

    // Display summary
    const orderStats = {
      total: createdOrders.length,
      paid: createdOrders.filter(o => o.payment_status === 'paid').length,
      pending: createdOrders.filter(o => o.payment_status === 'pending').length,
      failed: createdOrders.filter(o => o.payment_status === 'failed').length,
      delivered: createdOrders.filter(o => o.delivery_status === 'delivered').length,
      processing: createdOrders.filter(o => o.delivery_status === 'processing').length,
      totalRevenue: createdOrders
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + o.total_amount, 0)
    }

    console.log('\nOrder Statistics:')
    console.log(`Total Orders: ${orderStats.total}`)
    console.log(`Paid: ${orderStats.paid}, Pending: ${orderStats.pending}, Failed: ${orderStats.failed}`)
    console.log(`Delivered: ${orderStats.delivered}, Processing: ${orderStats.processing}`)
    console.log(`Total Revenue: Rp ${orderStats.totalRevenue.toLocaleString('id-ID')}`)

  } catch (error) {
    console.error('Error seeding orders:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the seed function
if (require.main === module) {
  seedOrders()
}

module.exports = seedOrders