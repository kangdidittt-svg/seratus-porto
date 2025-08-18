import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Configure dotenv
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

// Import models - we'll create them inline since they use ES modules
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  active: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const ArtworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  tags: [{ type: String }],
  process_steps: [{ type: String }],
  creative_process_images: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    image_url: { type: String, required: true }
  }],
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  original_price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  category: { 
    type: String, 
    required: true,
    enum: ['Digital Art', 'Illustrations', 'Templates', 'Mockups', 'Icons', 'Fonts', 'Textures', 'Brushes', 'Other']
  },
  file_url: { type: String, required: true },
  watermark_url: { type: String, required: true },
  preview_images: [{ type: String }],
  downloads: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', UserSchema)
const Artwork = mongoose.model('Artwork', ArtworkSchema)
const Product = mongoose.model('Product', ProductSchema)

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

// Sample data
const users = [
  {
    username: 'admin',
    email: 'admin@seratus.com',
    password: 'admin123',
    role: 'admin',
    active: true
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'password123',
    role: 'user',
    active: true
  },
  {
    username: 'artist',
    email: 'artist@seratus.com',
    password: 'artist123',
    role: 'user',
    active: true
  }
]

const artworks = [
  {
    title: 'Digital Abstract #001',
    description: 'A mesmerizing digital abstract artwork featuring flowing geometric patterns and vibrant color gradients.',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop'
    ],
    tags: ['abstract', 'digital', 'geometric', 'colorful'],
    process_steps: ['Concept Development', 'Digital Sketching', 'Color Exploration', 'Final Composition'],
    creative_process_images: [
      {
        title: 'Initial Concept Sketch',
        description: 'Early conceptual sketches exploring geometric forms and composition ideas.',
        image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop'
      },
      {
        title: 'Color Palette Development',
        description: 'Experimenting with different color combinations and gradients.',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
      },
      {
        title: 'Digital Refinement',
        description: 'Refining the digital composition with advanced techniques and effects.',
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop'
      }
    ],
    featured: true
  },
  {
    title: 'Neon Dreams',
    description: 'Cyberpunk-inspired artwork with neon lights and futuristic elements.',
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop'
    ],
    tags: ['cyberpunk', 'neon', 'futuristic', 'digital'],
    process_steps: ['Mood Board Creation', '3D Modeling', 'Lighting Setup', 'Post Processing'],
    creative_process_images: [
      {
        title: 'Cyberpunk Mood Board',
        description: 'Collection of references and inspiration for the cyberpunk aesthetic.',
        image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop'
      },
      {
        title: 'Neon Lighting Tests',
        description: 'Experimenting with different neon light effects and colors.',
        image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
      },
      {
        title: 'Final Composition',
        description: 'Combining all elements into the final cyberpunk scene.',
        image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop'
      }
    ],
    featured: true
  },
  {
    title: 'Minimalist Landscape',
    description: 'Clean and simple landscape with modern minimalist approach.',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop'
    ],
    tags: ['minimalist', 'landscape', 'clean', 'modern'],
    process_steps: ['Location Scouting', 'Composition Planning', 'Digital Enhancement'],
    creative_process_images: [
      {
        title: 'Location Research',
        description: 'Exploring different locations for the perfect minimalist landscape.',
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      },
      {
        title: 'Composition Studies',
        description: 'Testing different compositions and framing approaches.',
        image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop'
      }
    ],
    featured: false
  },
  {
    title: 'Urban Architecture',
    description: 'Modern architectural photography showcasing urban design.',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=1200&fit=crop'
    ],
    tags: ['architecture', 'urban', 'modern', 'photography'],
    process_steps: ['Urban Exploration', 'Architectural Analysis', 'Photography Session', 'Post Processing'],
    creative_process_images: [
      {
        title: 'Building Survey',
        description: 'Analyzing architectural elements and finding unique perspectives.',
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop'
      },
      {
        title: 'Lighting Study',
        description: 'Understanding how natural light interacts with the building structures.',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
      }
    ],
    featured: true
  },
  {
    title: 'Color Explosion',
    description: 'Vibrant abstract composition with explosive color combinations.',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1200&fit=crop'
    ],
    tags: ['abstract', 'colorful', 'vibrant', 'explosion'],
    process_steps: ['Color Theory Research', 'Digital Painting', 'Effect Application'],
    creative_process_images: [
      {
        title: 'Color Wheel Studies',
        description: 'Exploring complementary and analogous color relationships.',
        image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop'
      },
      {
        title: 'Brush Technique Tests',
        description: 'Experimenting with different digital brush techniques and textures.',
        image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
      }
    ],
    featured: false
  },
  {
    title: 'Digital Portrait Series',
    description: 'Contemporary digital portrait with artistic interpretation.',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=1200&fit=crop'
    ],
    tags: ['portrait', 'digital', 'contemporary', 'artistic'],
    process_steps: ['Reference Photography', 'Digital Sketching', 'Color Grading', 'Final Touches'],
    creative_process_images: [
      {
        title: 'Reference Photos',
        description: 'Collecting and analyzing reference photographs for the portrait series.',
        image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop'
      },
      {
        title: 'Digital Sketching Phase',
        description: 'Creating initial digital sketches and exploring different artistic styles.',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
      },
      {
        title: 'Color and Mood Development',
        description: 'Developing the color palette and overall mood of the portrait.',
        image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop'
      }
    ],
    featured: true
  }
]

const products = [
  {
    title: 'Premium Digital Art Pack #1',
    description: 'Collection of 10 high-resolution digital artworks perfect for commercial use. Includes PSD files and various formats.',
    price: 39.99,
    original_price: 49.99,
    discount: 20,
    category: 'Digital Art',
    file_url: 'https://example.com/downloads/art-pack-1.zip',
    watermark_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    downloads: 156,
    active: true
  },
  {
    title: 'Cyberpunk UI Elements',
    description: 'Futuristic UI elements and components for web and app design. Includes Figma and Sketch files.',
    price: 25.49,
    original_price: 29.99,
    discount: 15,
    category: 'Templates',
    file_url: 'https://example.com/downloads/cyberpunk-ui.zip',
    watermark_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    ],
    downloads: 89,
    active: true
  },
  {
    title: 'Minimalist Logo Templates',
    description: 'Clean and modern logo templates for various industries. Vector files included.',
    price: 19.99,
    original_price: 19.99,
    discount: 0,
    category: 'Templates',
    file_url: 'https://example.com/downloads/logo-templates.zip',
    watermark_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'
    ],
    downloads: 234,
    active: true
  },
  {
    title: 'Abstract Background Collection',
    description: 'High-quality abstract backgrounds for presentations, websites, and print materials.',
    price: 11.99,
    original_price: 15.99,
    discount: 25,
    category: 'Textures',
    file_url: 'https://example.com/downloads/abstract-backgrounds.zip',
    watermark_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    ],
    downloads: 312,
    active: true
  },
  {
    title: 'Photography Lightroom Presets',
    description: 'Professional Lightroom presets for portrait and landscape photography.',
    price: 17.49,
    original_price: 24.99,
    discount: 30,
    category: 'Other',
    file_url: 'https://example.com/downloads/lightroom-presets.zip',
    watermark_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview_images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
    ],
    downloads: 178,
    active: true
  }
]

// Seed functions
const seedUsers = async () => {
  try {
    await User.deleteMany({})
    console.log('🗑️  Cleared existing users')
    
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      const user = new User({
        ...userData,
        password: hashedPassword
      })
      await user.save()
    }
    
    console.log('👥 Users seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding users:', error)
  }
}

const seedArtworks = async () => {
  try {
    await Artwork.deleteMany({})
    console.log('🗑️  Cleared existing artworks')
    
    for (const artworkData of artworks) {
      const artwork = new Artwork(artworkData)
      await artwork.save()
    }
    
    console.log('🎨 Artworks seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding artworks:', error)
  }
}

const seedProducts = async () => {
  try {
    await Product.deleteMany({})
    console.log('🗑️  Cleared existing products')
    
    for (const productData of products) {
      const product = new Product(productData)
      await product.save()
    }
    
    console.log('🛍️  Products seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding products:', error)
  }
}

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB()
    
    console.log('🌱 Starting database seeding...')
    
    await seedUsers()
    await seedArtworks()
    await seedProducts()
    
    console.log('✅ Database seeding completed successfully!')
    console.log('\n📊 Seeded data summary:')
    console.log(`   👥 Users: ${users.length}`)
    console.log(`   🎨 Artworks: ${artworks.length}`)
    console.log(`   🛍️  Products: ${products.length}`)
    console.log('\n🔐 Admin credentials:')
    console.log('   Username: admin')
    console.log('   Password: admin123')
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
    process.exit(0)
  }
}

// Run seeder
seedDatabase()