const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path')

// Configure dotenv
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

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

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// Extended order data with various statuses and realistic scenarios
const extendedOrdersData = [
  // PAID & DELIVERED ORDERS (Successful transactions)
  {
    customer_name: 'Ahmad Rizki Pratama',
    customer_email: 'ahmad.rizki@gmail.com',
    quantity: 1,
    total_amount: 150000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Terima kasih untuk desain logonya yang sangat keren! Akan order lagi untuk project selanjutnya.'
  },
  {
    customer_name: 'Sari Dewi Lestari',
    customer_email: 'sari.dewi@outlook.com',
    quantity: 2,
    total_amount: 300000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Perfect! Sesuai dengan brief yang diberikan. File sudah diterima dengan baik.'
  },
  {
    customer_name: 'Maya Putri Handayani',
    customer_email: 'maya.putri@yahoo.com',
    quantity: 3,
    total_amount: 450000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Sangat puas dengan hasilnya! Kualitas premium dan pengerjaan cepat. Recommended!'
  },
  {
    customer_name: 'Doni Pratama Wijaya',
    customer_email: 'doni.pratama@email.com',
    quantity: 1,
    total_amount: 125000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Hasil memuaskan, sesuai ekspektasi. Terima kasih atas pelayanan yang profesional.'
  },
  {
    customer_name: 'Lisa Anggraini',
    customer_email: 'lisa.anggraini@gmail.com',
    quantity: 4,
    total_amount: 600000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Order untuk 4 varian logo perusahaan, semua sudah sesuai dengan brand guideline kami.'
  },
  {
    customer_name: 'Rudi Hermawan',
    customer_email: 'rudi.hermawan@company.co.id',
    quantity: 2,
    total_amount: 280000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Branding package lengkap untuk startup kami. Hasil sangat memuaskan dan profesional.'
  },
  {
    customer_name: 'Fitri Handayani',
    customer_email: 'fitri.handayani@studio.com',
    quantity: 1,
    total_amount: 200000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Template website yang dibeli sangat membantu project client kami. Kualitas top!'
  },
  {
    customer_name: 'Andi Wijaya Kusuma',
    customer_email: 'andi.wijaya@creative.id',
    quantity: 5,
    total_amount: 750000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Bulk order untuk beberapa client. Semua file sudah diterima dan client sangat puas.'
  },

  // PAID & PROCESSING ORDERS (In progress)
  {
    customer_name: 'Budi Santoso',
    customer_email: 'budi.santoso@startup.co.id',
    quantity: 1,
    total_amount: 320000,
    payment_status: 'paid',
    delivery_status: 'processing',
    notes: 'Mohon dipercepat karena ada deadline project minggu depan. Terima kasih!'
  },
  {
    customer_name: 'Rina Sari Dewi',
    customer_email: 'rina.sari@fashion.com',
    quantity: 2,
    total_amount: 380000,
    payment_status: 'paid',
    delivery_status: 'processing',
    notes: 'Fashion branding package untuk boutique baru. Mohon include social media template juga.'
  },
  {
    customer_name: 'Agus Setiawan',
    customer_email: 'agus.setiawan@restaurant.id',
    quantity: 1,
    total_amount: 450000,
    payment_status: 'paid',
    delivery_status: 'processing',
    notes: 'Complete restaurant branding. Butuh revisi minor pada warna logo sesuai diskusi kemarin.'
  },
  {
    customer_name: 'Diana Permata',
    customer_email: 'diana.permata@agency.com',
    quantity: 3,
    total_amount: 540000,
    payment_status: 'paid',
    delivery_status: 'processing',
    notes: 'Order untuk 3 client berbeda. Mohon kirim satu per satu setelah selesai.'
  },
  {
    customer_name: 'Hendra Gunawan',
    customer_email: 'hendra.gunawan@tech.co.id',
    quantity: 1,
    total_amount: 250000,
    payment_status: 'paid',
    delivery_status: 'processing',
    notes: 'Tech startup logo dengan konsep futuristik. Mohon include file AI dan PNG.'
  },

  // PENDING PAYMENT ORDERS (Waiting for payment)
  {
    customer_name: 'Sinta Maharani',
    customer_email: 'sinta.maharani@email.com',
    quantity: 1,
    total_amount: 180000,
    payment_status: 'pending',
    delivery_status: 'pending',
    notes: 'Akan transfer setelah melihat preview final. Mohon kirim preview terlebih dahulu.'
  },
  {
    customer_name: 'Bayu Adi Nugroho',
    customer_email: 'bayu.adi@company.com',
    quantity: 2,
    total_amount: 360000,
    payment_status: 'pending',
    delivery_status: 'pending',
    notes: 'Menunggu approval dari atasan untuk budget. Estimasi konfirmasi 2-3 hari kerja.'
  },
  {
    customer_name: 'Citra Dewi Sari',
    customer_email: 'citra.dewi@business.id',
    quantity: 1,
    total_amount: 200000,
    payment_status: 'pending',
    delivery_status: 'pending',
    notes: 'Sedang proses transfer via bank. Mohon tunggu konfirmasi pembayaran.'
  },
  {
    customer_name: 'Fajar Ramadhan',
    customer_email: 'fajar.ramadhan@startup.com',
    quantity: 3,
    total_amount: 480000,
    payment_status: 'pending',
    delivery_status: 'pending',
    notes: 'Bulk order untuk 3 produk berbeda. Akan bayar sekaligus setelah konfirmasi final.'
  },
  {
    customer_name: 'Indira Putri',
    customer_email: 'indira.putri@creative.studio',
    quantity: 1,
    total_amount: 150000,
    payment_status: 'pending',
    delivery_status: 'pending',
    notes: 'Client baru, sedang proses setup payment method. Mohon hold order sampai konfirmasi.'
  },

  // FAILED PAYMENT ORDERS (Payment issues)
  {
    customer_name: 'Eko Prasetyo',
    customer_email: 'eko.prasetyo@email.com',
    quantity: 1,
    total_amount: 175000,
    payment_status: 'failed',
    delivery_status: 'pending',
    notes: 'Pembayaran gagal karena limit kartu kredit. Mohon info cara pembayaran alternatif.'
  },
  {
    customer_name: 'Gita Savitri',
    customer_email: 'gita.savitri@company.co.id',
    quantity: 2,
    total_amount: 320000,
    payment_status: 'failed',
    delivery_status: 'pending',
    notes: 'Transfer gagal karena masalah teknis bank. Akan coba lagi besok pagi.'
  },
  {
    customer_name: 'Joko Widodo',
    customer_email: 'joko.widodo@business.com',
    quantity: 1,
    total_amount: 220000,
    payment_status: 'failed',
    delivery_status: 'pending',
    notes: 'Kartu kredit expired. Mohon tunggu, sedang update payment method.'
  },

  // REFUNDED ORDERS (Cancelled or refunded)
  {
    customer_name: 'Lina Marlina',
    customer_email: 'lina.marlina@email.com',
    quantity: 1,
    total_amount: 160000,
    payment_status: 'refunded',
    delivery_status: 'failed',
    notes: 'Project dibatalkan oleh client. Mohon proses refund sesuai kebijakan.'
  },
  {
    customer_name: 'Nanda Pratama',
    customer_email: 'nanda.pratama@startup.id',
    quantity: 2,
    total_amount: 300000,
    payment_status: 'refunded',
    delivery_status: 'failed',
    notes: 'Tidak sesuai dengan ekspektasi setelah revisi. Refund sudah diproses.'
  },

  // MORE SUCCESSFUL ORDERS (Additional variety)
  {
    customer_name: 'Putri Ayu Lestari',
    customer_email: 'putri.ayu@fashion.store',
    quantity: 1,
    total_amount: 380000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Fashion brand identity package sangat membantu launching brand baru kami.'
  },
  {
    customer_name: 'Rizky Febrian',
    customer_email: 'rizky.febrian@tech.startup',
    quantity: 1,
    total_amount: 400000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Website template collection sangat lengkap. Menghemat waktu development.'
  },
  {
    customer_name: 'Sari Indah Permata',
    customer_email: 'sari.indah@restaurant.co.id',
    quantity: 1,
    total_amount: 315000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Complete restaurant branding dengan harga promo. Sangat worth it!'
  },
  {
    customer_name: 'Tommy Setiawan',
    customer_email: 'tommy.setiawan@gym.fitness',
    quantity: 1,
    total_amount: 350000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Fitness brand package perfect untuk gym baru kami. Design sangat energik!'
  },
  {
    customer_name: 'Vina Cantika',
    customer_email: 'vina.cantika@creative.agency',
    quantity: 2,
    total_amount: 300000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Icon library sangat lengkap dengan harga promo. Client kami sangat puas.'
  },
  {
    customer_name: 'Wahyu Nugroho',
    customer_email: 'wahyu.nugroho@design.studio',
    quantity: 1,
    total_amount: 165000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Complete icon library dengan mega promo 45% off. Incredible value!'
  },
  {
    customer_name: 'Yuni Astuti',
    customer_email: 'yuni.astuti@marketing.com',
    quantity: 3,
    total_amount: 540000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Social media template bundle untuk 3 brand client. Semua template sangat modern.'
  },
  {
    customer_name: 'Zaki Rahman',
    customer_email: 'zaki.rahman@photographer.id',
    quantity: 1,
    total_amount: 96000,
    payment_status: 'paid',
    delivery_status: 'delivered',
    notes: 'Lightroom preset bundle dengan diskon 20%. Hasil edit foto jadi lebih profesional.'
  }
]

// Seed function
async function seedExtendedOrders() {
  try {
    await connectDB()
    
    console.log('🌱 Starting extended order seeding...')
    
    // Get all products to assign random product_ids
    const products = await Product.find({}).select('_id title price discount')
    
    if (products.length === 0) {
      console.log('⚠️ No products found. Please seed products first.')
      return
    }
    
    console.log(`📦 Found ${products.length} products to reference`)
    
    // Clear existing orders
    await Order.deleteMany({})
    console.log('🗑️ Cleared existing orders')
    
    // Assign random product_ids and calculate realistic amounts
    const ordersWithProductIds = extendedOrdersData.map(orderData => {
      const randomProduct = products[Math.floor(Math.random() * products.length)]
      const basePrice = randomProduct.price
      const discount = randomProduct.discount || 0
      const discountedPrice = basePrice * (1 - discount / 100)
      const calculatedAmount = Math.round(discountedPrice * orderData.quantity)
      
      return {
        ...orderData,
        product_id: randomProduct._id,
        total_amount: calculatedAmount // Use calculated amount based on actual product price
      }
    })
    
    // Insert new orders
    const insertedOrders = await Order.insertMany(ordersWithProductIds)
    console.log(`✅ Successfully seeded ${insertedOrders.length} extended orders`)
    
    // Display summary
    const statusCount = {
      paid: 0,
      pending: 0,
      failed: 0,
      refunded: 0
    }
    
    const deliveryCount = {
      delivered: 0,
      processing: 0,
      pending: 0,
      failed: 0
    }
    
    let totalRevenue = 0
    
    insertedOrders.forEach(order => {
      statusCount[order.payment_status]++
      deliveryCount[order.delivery_status]++
      
      if (order.payment_status === 'paid') {
        totalRevenue += order.total_amount
      }
    })
    
    console.log(`📊 Summary:`)
    console.log(`   - Total orders: ${insertedOrders.length}`)
    console.log(`   - Payment status breakdown:`)
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`     * ${status}: ${count} orders`)
    })
    console.log(`   - Delivery status breakdown:`)
    Object.entries(deliveryCount).forEach(([status, count]) => {
      console.log(`     * ${status}: ${count} orders`)
    })
    console.log(`   - Total revenue from paid orders: Rp ${totalRevenue.toLocaleString('id-ID')}`)
    
    console.log('🛒 Extended order seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding extended orders:', error)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

// Run if called directly
if (require.main === module) {
  seedExtendedOrders()
}

module.exports = seedExtendedOrders