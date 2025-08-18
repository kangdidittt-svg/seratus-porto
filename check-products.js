require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

// Product Schema
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

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    const products = await Product.find({ active: true }).select('title price category discount')
    
    console.log('📦 Available products for purchase:')
    console.log('=' .repeat(60))
    
    if (products.length === 0) {
      console.log('❌ No products found. Please seed products first.')
      return
    }
    
    products.forEach((product, index) => {
      const discountedPrice = product.discount > 0 
        ? product.price * (1 - product.discount / 100)
        : product.price
      
      console.log(`${index + 1}. ${product.title}`)
      console.log(`   Category: ${product.category}`)
      console.log(`   Price: Rp ${product.price.toLocaleString('id-ID')}`)
      if (product.discount > 0) {
        console.log(`   Discount: ${product.discount}% (Final: Rp ${Math.round(discountedPrice).toLocaleString('id-ID')})`)
      }
      console.log('')
    })
    
    console.log(`Total: ${products.length} active products`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

checkProducts()