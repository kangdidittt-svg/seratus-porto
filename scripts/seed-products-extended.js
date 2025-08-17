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
    price: 250000,
    discount: 40, // PROMO!
    category: 'logo',
    file_url: 'https://example.com/files/tech-startup-logo.zip',
    watermark_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop'
    ],
    tags: ['modern', 'tech', 'startup', 'minimal', 'professional', 'saas'],
    downloads: 189,
    active: true
  },
  {
    title: 'Vintage Artisan Logo Collection',
    description: 'Hand-crafted vintage logos perfect for cafes, bakeries, and artisanal businesses. Includes 15 unique designs.',
    price: 180000,
    discount: 25, // PROMO!
    category: 'logo',
    file_url: 'https://example.com/files/vintage-artisan-logos.zip',
    watermark_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop'
    ],
    tags: ['vintage', 'artisan', 'handcrafted', 'cafe', 'bakery', 'retro'],
    downloads: 234,
    active: true
  },
  {
    title: 'Corporate Identity Logo Suite',
    description: 'Professional corporate logos for established businesses. Includes monogram variations and corporate guidelines.',
    price: 320000,
    discount: 15,
    category: 'logo',
    file_url: 'https://example.com/files/corporate-identity-logos.zip',
    watermark_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    ],
    tags: ['corporate', 'professional', 'identity', 'monogram', 'business'],
    downloads: 156,
    active: true
  },
  {
    title: 'Creative Agency Logo Bundle',
    description: 'Bold and creative logos for design agencies, studios, and creative professionals. 20 unique concepts included.',
    price: 280000,
    discount: 0,
    category: 'logo',
    file_url: 'https://example.com/files/creative-agency-logos.zip',
    watermark_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
    ],
    tags: ['creative', 'agency', 'bold', 'studio', 'design', 'artistic'],
    downloads: 98,
    active: true
  },

  // BRANDING CATEGORY
  {
    title: 'Complete Restaurant Branding Kit',
    description: 'Full branding package for restaurants including logo, menu design, business cards, and signage templates.',
    price: 450000,
    discount: 30, // PROMO!
    category: 'branding',
    file_url: 'https://example.com/files/restaurant-branding-complete.zip',
    watermark_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    ],
    tags: ['restaurant', 'food', 'branding', 'complete', 'menu', 'signage'],
    downloads: 167,
    active: true
  },
  {
    title: 'Fashion Brand Identity Package',
    description: 'Elegant branding solution for fashion brands and boutiques. Includes lookbook templates and social media kit.',
    price: 380000,
    discount: 20,
    category: 'branding',
    file_url: 'https://example.com/files/fashion-brand-identity.zip',
    watermark_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop'
    ],
    tags: ['fashion', 'elegant', 'boutique', 'lookbook', 'social-media'],
    downloads: 143,
    active: true
  },
  {
    title: 'Fitness Brand Complete Package',
    description: 'Dynamic branding for gyms and fitness centers. Includes workout templates, membership cards, and promotional materials.',
    price: 350000,
    discount: 0,
    category: 'branding',
    file_url: 'https://example.com/files/fitness-brand-package.zip',
    watermark_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    tags: ['fitness', 'gym', 'dynamic', 'workout', 'membership', 'sports'],
    downloads: 89,
    active: true
  },

  // ILLUSTRATION CATEGORY
  {
    title: 'Abstract Art Illustration Bundle',
    description: 'Collection of 50 abstract illustrations perfect for web design, presentations, and creative projects.',
    price: 150000,
    discount: 35, // PROMO!
    category: 'illustration',
    file_url: 'https://example.com/files/abstract-art-bundle.zip',
    watermark_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    tags: ['abstract', 'illustration', 'web', 'creative', 'colorful', 'modern'],
    downloads: 312,
    active: true
  },
  {
    title: 'Character Design Illustration Pack',
    description: 'Diverse character illustrations for games, apps, and storytelling. Includes various poses and expressions.',
    price: 200000,
    discount: 0,
    category: 'illustration',
    file_url: 'https://example.com/files/character-design-pack.zip',
    watermark_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'
    ],
    tags: ['character', 'design', 'games', 'apps', 'storytelling', 'diverse'],
    downloads: 178,
    active: true
  },
  {
    title: 'Nature Botanical Illustrations',
    description: 'Hand-drawn botanical illustrations of plants, flowers, and trees. Perfect for organic and eco-friendly brands.',
    price: 120000,
    discount: 15,
    category: 'illustration',
    file_url: 'https://example.com/files/botanical-illustrations.zip',
    watermark_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop'
    ],
    tags: ['botanical', 'nature', 'plants', 'flowers', 'organic', 'eco-friendly'],
    downloads: 245,
    active: true
  },

  // TEMPLATE CATEGORY
  {
    title: 'Modern Website Template Collection',
    description: 'Responsive website templates for various industries. Includes HTML, CSS, and JavaScript files.',
    price: 400000,
    discount: 50, // MEGA PROMO!
    category: 'template',
    file_url: 'https://example.com/files/modern-website-templates.zip',
    watermark_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    tags: ['website', 'template', 'responsive', 'modern', 'html', 'css'],
    downloads: 456,
    active: true
  },
  {
    title: 'Business Card Template Mega Pack',
    description: 'Over 100 professional business card templates in various styles and industries. Print-ready files included.',
    price: 100000,
    discount: 25,
    category: 'template',
    file_url: 'https://example.com/files/business-card-mega-pack.zip',
    watermark_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    ],
    tags: ['business-card', 'template', 'professional', 'print-ready', 'corporate'],
    downloads: 389,
    active: true
  },
  {
    title: 'Social Media Template Bundle',
    description: 'Complete social media templates for Instagram, Facebook, Twitter, and LinkedIn. Includes stories and posts.',
    price: 180000,
    discount: 0,
    category: 'template',
    file_url: 'https://example.com/files/social-media-templates.zip',
    watermark_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    tags: ['social-media', 'instagram', 'facebook', 'twitter', 'linkedin', 'stories'],
    downloads: 267,
    active: true
  },

  // MOCKUP CATEGORY
  {
    title: 'Device Mockup Ultimate Collection',
    description: 'High-resolution mockups for phones, tablets, laptops, and desktops. Perfect for app and web presentations.',
    price: 220000,
    discount: 30, // PROMO!
    category: 'mockup',
    file_url: 'https://example.com/files/device-mockup-collection.zip',
    watermark_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
    ],
    tags: ['mockup', 'device', 'phone', 'tablet', 'laptop', 'presentation'],
    downloads: 198,
    active: true
  },
  {
    title: 'Packaging Mockup Collection',
    description: 'Product packaging mockups for boxes, bottles, bags, and containers. Ideal for product presentations.',
    price: 160000,
    discount: 20,
    category: 'mockup',
    file_url: 'https://example.com/files/packaging-mockups.zip',
    watermark_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    ],
    tags: ['packaging', 'mockup', 'product', 'box', 'bottle', 'container'],
    downloads: 134,
    active: true
  },
  {
    title: 'Apparel Mockup Bundle',
    description: 'T-shirt, hoodie, and clothing mockups for fashion and merchandise design. Multiple angles included.',
    price: 140000,
    discount: 0,
    category: 'mockup',
    file_url: 'https://example.com/files/apparel-mockups.zip',
    watermark_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop'
    ],
    tags: ['apparel', 'mockup', 'tshirt', 'hoodie', 'clothing', 'merchandise'],
    downloads: 223,
    active: true
  },

  // ICON CATEGORY
  {
    title: 'Complete Icon Library - 1000+ Icons',
    description: 'Massive collection of 1000+ icons covering all categories. Multiple formats and styles included.',
    price: 300000,
    discount: 45, // MEGA PROMO!
    category: 'icon',
    file_url: 'https://example.com/files/complete-icon-library.zip',
    watermark_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    tags: ['icons', 'library', 'complete', 'ui', 'interface', 'massive'],
    downloads: 567,
    active: true
  },
  {
    title: 'Minimalist Icon Set',
    description: 'Clean and minimal icons perfect for modern interfaces. Available in outline and filled versions.',
    price: 80000,
    discount: 0,
    category: 'icon',
    file_url: 'https://example.com/files/minimalist-icons.zip',
    watermark_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'
    ],
    tags: ['minimalist', 'clean', 'modern', 'outline', 'filled', 'interface'],
    downloads: 345,
    active: true
  },
  {
    title: 'Animated Icon Collection',
    description: 'Animated icons for web and app interfaces. Includes Lottie files and CSS animations.',
    price: 200000,
    discount: 15,
    category: 'icon',
    file_url: 'https://example.com/files/animated-icons.zip',
    watermark_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
    ],
    tags: ['animated', 'icons', 'lottie', 'css', 'web', 'app'],
    downloads: 189,
    active: true
  },

  // OTHER CATEGORY
  {
    title: 'Infographic Design Elements Mega Pack',
    description: 'Comprehensive collection of infographic elements including charts, graphs, timelines, and decorative elements.',
    price: 250000,
    discount: 35, // PROMO!
    category: 'other',
    file_url: 'https://example.com/files/infographic-mega-pack.zip',
    watermark_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
    ],
    tags: ['infographic', 'charts', 'graphs', 'timeline', 'data', 'visualization'],
    downloads: 278,
    active: true
  },
  {
    title: 'Texture and Pattern Library',
    description: 'High-quality textures and seamless patterns for backgrounds and design elements. Over 200 files included.',
    price: 180000,
    discount: 0,
    category: 'other',
    file_url: 'https://example.com/files/texture-pattern-library.zip',
    watermark_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    ],
    tags: ['texture', 'pattern', 'background', 'seamless', 'design', 'library'],
    downloads: 156,
    active: true
  },
  {
    title: 'Photography Lightroom Preset Bundle',
    description: 'Professional Lightroom presets for portrait, landscape, and street photography. 50 unique presets included.',
    price: 120000,
    discount: 20,
    category: 'other',
    file_url: 'https://example.com/files/lightroom-preset-bundle.zip',
    watermark_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    ],
    tags: ['photography', 'lightroom', 'presets', 'portrait', 'landscape', 'professional'],
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