const mongoose = require('mongoose')

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

// Sample product data
const sampleProducts = [
  {
    title: 'Modern Logo Design - Tech Startup',
    description: 'Clean and modern logo design perfect for tech startups and digital companies. Includes vector files and multiple format variations.',
    price: 150000,
    discount: 10,
    category: 'logo',
    file_url: 'https://example.com/files/tech-logo.zip',
    watermark_url: 'https://example.com/previews/tech-logo-watermark.jpg',
    preview_images: [
      'https://example.com/previews/tech-logo-1.jpg',
      'https://example.com/previews/tech-logo-2.jpg',
      'https://example.com/previews/tech-logo-3.jpg'
    ],
    tags: ['modern', 'tech', 'startup', 'minimal', 'professional'],
    downloads: 45,
    active: true
  },
  {
    title: 'Restaurant Branding Package',
    description: 'Complete branding package for restaurants including logo, menu design, and business card templates.',
    price: 250000,
    discount: 15,
    category: 'branding',
    file_url: 'https://example.com/files/restaurant-branding.zip',
    watermark_url: 'https://example.com/previews/restaurant-branding-watermark.jpg',
    preview_images: [
      'https://example.com/previews/restaurant-branding-1.jpg',
      'https://example.com/previews/restaurant-branding-2.jpg'
    ],
    tags: ['restaurant', 'food', 'branding', 'package', 'menu'],
    downloads: 32,
    active: true
  },
  {
    title: 'Abstract Illustration Set',
    description: 'Collection of 20 abstract illustrations perfect for web design, presentations, and marketing materials.',
    price: 100000,
    discount: 0,
    category: 'illustration',
    file_url: 'https://example.com/files/abstract-illustrations.zip',
    watermark_url: 'https://example.com/previews/abstract-illustrations-watermark.jpg',
    preview_images: [
      'https://example.com/previews/abstract-illustrations-1.jpg',
      'https://example.com/previews/abstract-illustrations-2.jpg',
      'https://example.com/previews/abstract-illustrations-3.jpg',
      'https://example.com/previews/abstract-illustrations-4.jpg'
    ],
    tags: ['abstract', 'illustration', 'web', 'design', 'colorful'],
    downloads: 78,
    active: true
  },
  {
    title: 'Business Card Template Pack',
    description: 'Professional business card templates in various styles. Easy to customize with your own information.',
    price: 75000,
    discount: 20,
    category: 'template',
    file_url: 'https://example.com/files/business-card-templates.zip',
    watermark_url: 'https://example.com/previews/business-card-templates-watermark.jpg',
    preview_images: [
      'https://example.com/previews/business-card-templates-1.jpg',
      'https://example.com/previews/business-card-templates-2.jpg'
    ],
    tags: ['business card', 'template', 'professional', 'corporate'],
    downloads: 156,
    active: true
  },
  {
    title: 'Mobile App Mockup Collection',
    description: 'High-quality mobile app mockups for iOS and Android. Perfect for showcasing your app designs.',
    price: 120000,
    discount: 5,
    category: 'mockup',
    file_url: 'https://example.com/files/mobile-app-mockups.zip',
    watermark_url: 'https://example.com/previews/mobile-app-mockups-watermark.jpg',
    preview_images: [
      'https://example.com/previews/mobile-app-mockups-1.jpg',
      'https://example.com/previews/mobile-app-mockups-2.jpg',
      'https://example.com/previews/mobile-app-mockups-3.jpg'
    ],
    tags: ['mockup', 'mobile', 'app', 'ios', 'android'],
    downloads: 89,
    active: true
  },
  {
    title: 'Social Media Icon Set',
    description: 'Complete set of social media icons in multiple styles and formats. Includes all major platforms.',
    price: 50000,
    discount: 0,
    category: 'icon',
    file_url: 'https://example.com/files/social-media-icons.zip',
    watermark_url: 'https://example.com/previews/social-media-icons-watermark.jpg',
    preview_images: [
      'https://example.com/previews/social-media-icons-1.jpg',
      'https://example.com/previews/social-media-icons-2.jpg'
    ],
    tags: ['icons', 'social media', 'web', 'ui', 'interface'],
    downloads: 234,
    active: true
  },
  {
    title: 'E-commerce Website Template',
    description: 'Modern and responsive e-commerce website template. Includes product pages, cart, and checkout design.',
    price: 300000,
    discount: 25,
    category: 'template',
    file_url: 'https://example.com/files/ecommerce-template.zip',
    watermark_url: 'https://example.com/previews/ecommerce-template-watermark.jpg',
    preview_images: [
      'https://example.com/previews/ecommerce-template-1.jpg',
      'https://example.com/previews/ecommerce-template-2.jpg',
      'https://example.com/previews/ecommerce-template-3.jpg',
      'https://example.com/previews/ecommerce-template-4.jpg'
    ],
    tags: ['ecommerce', 'website', 'template', 'responsive', 'modern'],
    downloads: 67,
    active: true
  },
  {
    title: 'Vintage Logo Collection',
    description: 'Collection of vintage-style logos perfect for retro brands, cafes, and artisanal businesses.',
    price: 180000,
    discount: 12,
    category: 'logo',
    file_url: 'https://example.com/files/vintage-logos.zip',
    watermark_url: 'https://example.com/previews/vintage-logos-watermark.jpg',
    preview_images: [
      'https://example.com/previews/vintage-logos-1.jpg',
      'https://example.com/previews/vintage-logos-2.jpg',
      'https://example.com/previews/vintage-logos-3.jpg'
    ],
    tags: ['vintage', 'retro', 'logo', 'classic', 'artisanal'],
    downloads: 123,
    active: true
  },
  {
    title: 'Infographic Elements Pack',
    description: 'Comprehensive pack of infographic elements including charts, graphs, icons, and decorative elements.',
    price: 90000,
    discount: 8,
    category: 'other',
    file_url: 'https://example.com/files/infographic-elements.zip',
    watermark_url: 'https://example.com/previews/infographic-elements-watermark.jpg',
    preview_images: [
      'https://example.com/previews/infographic-elements-1.jpg',
      'https://example.com/previews/infographic-elements-2.jpg'
    ],
    tags: ['infographic', 'charts', 'graphs', 'data', 'visualization'],
    downloads: 198,
    active: true
  },
  {
    title: 'Minimalist Branding Kit',
    description: 'Clean and minimalist branding kit including logo templates, color palettes, and typography guidelines.',
    price: 200000,
    discount: 18,
    category: 'branding',
    file_url: 'https://example.com/files/minimalist-branding.zip',
    watermark_url: 'https://example.com/previews/minimalist-branding-watermark.jpg',
    preview_images: [
      'https://example.com/previews/minimalist-branding-1.jpg',
      'https://example.com/previews/minimalist-branding-2.jpg',
      'https://example.com/previews/minimalist-branding-3.jpg'
    ],
    tags: ['minimalist', 'branding', 'clean', 'modern', 'simple'],
    downloads: 87,
    active: true
  }
]

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/seratus-porto')
    console.log('Connected to MongoDB')

    // Clear existing products (optional)
    await Product.deleteMany({})
    console.log('Cleared existing products')

    // Insert products
    const createdProducts = await Product.insertMany(sampleProducts)
    console.log(`Successfully created ${createdProducts.length} sample products`)

    // Display summary
    const productStats = {
      total: createdProducts.length,
      byCategory: {},
      totalDownloads: createdProducts.reduce((sum, p) => sum + p.downloads, 0),
      averagePrice: createdProducts.reduce((sum, p) => sum + p.price, 0) / createdProducts.length
    }

    // Count by category
    createdProducts.forEach(product => {
      productStats.byCategory[product.category] = (productStats.byCategory[product.category] || 0) + 1
    })

    console.log('\nProduct Statistics:')
    console.log(`Total Products: ${productStats.total}`)
    console.log(`Total Downloads: ${productStats.totalDownloads}`)
    console.log(`Average Price: Rp ${Math.round(productStats.averagePrice).toLocaleString('id-ID')}`)
    console.log('\nBy Category:')
    Object.entries(productStats.byCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`)
    })

  } catch (error) {
    console.error('Error seeding products:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the seed function
if (require.main === module) {
  seedProducts()
}

module.exports = seedProducts