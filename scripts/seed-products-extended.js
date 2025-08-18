const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path')

// Configure dotenv
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

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
    min: [0, 'Price cannot be negative']
  },
  original_price: {
    type: Number,
    required: [true, 'Original price is required'],
    min: [0, 'Original price cannot be negative']
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
    enum: ['Digital Art', 'Illustrations', 'Templates', 'Mockups', 'Icons', 'Fonts', 'Textures', 'Brushes', 'Other']
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

// Extended product data with more variety and promotions
const extendedProducts = [
  // LOGO CATEGORY - Some with high discounts (PROMO)
  {
    title: 'Modern Tech Startup Logo Pack',
    description: 'Complete logo package for tech startups including vector files, color variations, and brand guidelines. Perfect for SaaS companies.',
    price: 150000,
    original_price: 250000,
    discount: 40, // PROMO!
    category: 'Digital Art',
    file_url: 'https://example.com/files/tech-startup-logo.zip',
    watermark_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop'
    ],

    downloads: 189,
    active: true
  },
  {
    title: 'Vintage Artisan Logo Collection',
    description: 'Hand-crafted vintage logos perfect for cafes, bakeries, and artisanal businesses. Includes 15 unique designs.',
    price: 135000,
    original_price: 180000,
    discount: 25, // PROMO!
    category: 'Digital Art',
    file_url: 'https://example.com/files/vintage-artisan-logos.zip',
    watermark_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop'
    ],
    downloads: 234,
    active: true
  },
  {
    title: 'Corporate Identity Logo Suite',
    description: 'Professional corporate logos for established businesses. Includes monogram variations and corporate guidelines.',
    price: 272000,
    original_price: 320000,
    discount: 15,
    category: 'Digital Art',
    file_url: 'https://example.com/files/corporate-identity-logos.zip',
    watermark_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    ],
    downloads: 156,
    active: true
  },
  {
    title: 'Creative Agency Logo Bundle',
    description: 'Bold and creative logos for design agencies, studios, and creative professionals. 20 unique concepts included.',
    original_price: 280000,
    discount: 0,
    category: 'Digital Art',
    file_url: 'https://example.com/files/creative-agency-logos.zip',
    watermark_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
    ],
    downloads: 98,
    active: true
  },

  // BRANDING CATEGORY
  {
    title: 'Complete Restaurant Branding Kit',
    description: 'Full branding package for restaurants including logo, menu design, business cards, and signage templates.',
    price: 315000,
    original_price: 450000,
    discount: 30, // PROMO!
    category: 'Digital Art',
    file_url: 'https://example.com/files/restaurant-branding-complete.zip',
    watermark_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    ],
    downloads: 167,
    active: true
  },
  {
    title: 'Fashion Brand Identity Package',
    description: 'Elegant branding solution for fashion brands and boutiques. Includes lookbook templates and social media kit.',
    price: 304000,
    original_price: 380000,
    discount: 20,
    category: 'Digital Art',
    file_url: 'https://example.com/files/fashion-brand-identity.zip',
    watermark_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop'
    ],
    downloads: 143,
    active: true
  },
  {
    title: 'Fitness Brand Complete Package',
    description: 'Dynamic branding for gyms and fitness centers. Includes workout templates, membership cards, and promotional materials.',
    original_price: 350000,
    discount: 0,
    category: 'Digital Art',
    file_url: 'https://example.com/files/fitness-brand-package.zip',
    watermark_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    downloads: 89,
    active: true
  },

  // ILLUSTRATION CATEGORY
  {
    title: 'Abstract Art Illustration Bundle',
    description: 'Collection of 50 abstract illustrations perfect for web design, presentations, and creative projects.',
    price: 97500,
    original_price: 150000,
    discount: 35, // PROMO!
    category: 'Illustrations',
    file_url: 'https://example.com/files/abstract-art-bundle.zip',
    watermark_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    downloads: 312,
    active: true
  },
  {
    title: 'Character Design Illustration Pack',
    description: 'Diverse character illustrations for games, apps, and storytelling. Includes various poses and expressions.',
    original_price: 200000,
    discount: 0,
    category: 'Illustrations',
    file_url: 'https://example.com/files/character-design-pack.zip',
    watermark_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'
    ],
    downloads: 178,
    active: true
  },
  {
    title: 'Nature Botanical Illustrations',
    description: 'Hand-drawn botanical illustrations of plants, flowers, and trees. Perfect for organic and eco-friendly brands.',
    price: 102000,
    original_price: 120000,
    discount: 15,
    category: 'Illustrations',
    file_url: 'https://example.com/files/botanical-illustrations.zip',
    watermark_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop'
    ],
    downloads: 245,
    active: true
  },

  // TEMPLATE CATEGORY
  {
    title: 'Modern Website Template Collection',
    description: 'Responsive website templates for various industries. Includes HTML, CSS, and JavaScript files.',
    price: 200000,
    original_price: 400000,
    discount: 50, // MEGA PROMO!
    category: 'Templates',
    file_url: 'https://example.com/files/modern-website-templates.zip',
    watermark_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    downloads: 456,
    active: true
  },
  {
    title: 'Business Card Template Mega Pack',
    description: 'Over 100 professional business card templates in various styles and industries. Print-ready files included.',
    price: 75000,
    original_price: 100000,
    discount: 25,
    category: 'Templates',
    file_url: 'https://example.com/files/business-card-mega-pack.zip',
    watermark_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    ],
    downloads: 389,
    active: true
  },
  {
    title: 'Social Media Template Bundle',
    description: 'Complete social media templates for Instagram, Facebook, Twitter, and LinkedIn. Includes stories and posts.',
    original_price: 180000,
    discount: 0,
    category: 'Templates',
    file_url: 'https://example.com/files/social-media-templates.zip',
    watermark_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    downloads: 267,
    active: true
  },

  // MOCKUP CATEGORY
  {
    title: 'Device Mockup Ultimate Collection',
    description: 'High-resolution mockups for phones, tablets, laptops, and desktops. Perfect for app and web presentations.',
    price: 154000,
    original_price: 220000,
    discount: 30, // PROMO!
    category: 'Mockups',
    file_url: 'https://example.com/files/device-mockup-collection.zip',
    watermark_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
    ],
    downloads: 198,
    active: true
  },
  {
    title: 'Packaging Mockup Collection',
    description: 'Product packaging mockups for boxes, bottles, bags, and containers. Ideal for product presentations.',
    price: 128000,
    original_price: 160000,
    discount: 20,
    category: 'Mockups',
    file_url: 'https://example.com/files/packaging-mockups.zip',
    watermark_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    ],
    downloads: 134,
    active: true
  },
  {
    title: 'Apparel Mockup Bundle',
    description: 'T-shirt, hoodie, and clothing mockups for fashion and merchandise design. Multiple angles included.',
    original_price: 140000,
    discount: 0,
    category: 'Mockups',
    file_url: 'https://example.com/files/apparel-mockups.zip',
    watermark_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop'
    ],
    downloads: 223,
    active: true
  },

  // ICON CATEGORY
  {
    title: 'Complete Icon Library - 1000+ Icons',
    description: 'Massive collection of 1000+ icons covering all categories. Multiple formats and styles included.',
    price: 165000,
    original_price: 300000,
    discount: 45, // MEGA PROMO!
    category: 'Icons',
    file_url: 'https://example.com/files/complete-icon-library.zip',
    watermark_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    downloads: 567,
    active: true
  },
  {
    title: 'Minimalist Icon Set',
    description: 'Clean and minimal icons perfect for modern interfaces. Available in outline and filled versions.',
    original_price: 80000,
    discount: 0,
    category: 'Icons',
    file_url: 'https://example.com/files/minimalist-icons.zip',
    watermark_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'
    ],
    downloads: 345,
    active: true
  },
  {
    title: 'Animated Icon Collection',
    description: 'Animated icons for web and app interfaces. Includes Lottie files and CSS animations.',
    price: 170000,
    original_price: 200000,
    discount: 15,
    category: 'Icons',
    file_url: 'https://example.com/files/animated-icons.zip',
    watermark_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
    ],
    downloads: 189,
    active: true
  },

  // OTHER CATEGORY
  {
    title: 'Infographic Design Elements Mega Pack',
    description: 'Comprehensive collection of infographic elements including charts, graphs, timelines, and decorative elements.',
    price: 162500,
    original_price: 250000,
    discount: 35, // PROMO!
    category: 'Other',
    file_url: 'https://example.com/files/infographic-mega-pack.zip',
    watermark_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
    ],
    downloads: 278,
    active: true
  },
  {
    title: 'Texture and Pattern Library',
    description: 'High-quality textures and seamless patterns for backgrounds and design elements. Over 200 files included.',
    original_price: 180000,
    discount: 0,
    category: 'Other',
    file_url: 'https://example.com/files/texture-pattern-library.zip',
    watermark_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    ],
    downloads: 156,
    active: true
  },
  {
    title: 'Photography Lightroom Preset Bundle',
    description: 'Professional Lightroom presets for portrait, landscape, and street photography. 50 unique presets included.',
    price: 96000,
    original_price: 120000,
    discount: 20,
    category: 'Other',
    file_url: 'https://example.com/files/lightroom-preset-bundle.zip',
    watermark_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    ],
    downloads: 234,
    active: true
  }
]

// Seed function
async function seedExtendedProducts() {
  try {
    await connectDB()
    
    console.log('🌱 Starting extended product seeding...')
    
    // Clear existing products
    await Product.deleteMany({})
    console.log('🗑️ Cleared existing products')
    
    // Insert new products
    const insertedProducts = await Product.insertMany(extendedProducts)
    console.log(`✅ Successfully seeded ${insertedProducts.length} extended products`)
    
    // Display summary
    const promoProducts = insertedProducts.filter(product => product.discount > 0)
    const megaPromoProducts = insertedProducts.filter(product => product.discount >= 40)
    const categoryCount = {}
    
    insertedProducts.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1
    })
    
    console.log(`📊 Summary:`)
    console.log(`   - Total products: ${insertedProducts.length}`)
    console.log(`   - Products with discount: ${promoProducts.length}`)
    console.log(`   - Mega promo products (40%+ discount): ${megaPromoProducts.length}`)
    console.log(`   - Category breakdown:`)
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`     * ${category}: ${count} products`)
    })
    
    console.log('🛍️ Extended product seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding extended products:', error)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

// Run if called directly
if (require.main === module) {
  seedExtendedProducts()
}

module.exports = seedExtendedProducts