import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Configure dotenv
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

// Artwork Schema (simplified)
const ArtworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const Artwork = mongoose.model('Artwork', ArtworkSchema)

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

// Simple artwork data with various image sizes
const simpleArtworks = [
  {
    title: 'Abstract Harmony',
    description: 'Sebuah karya abstrak yang menggabungkan warna-warna hangat dengan bentuk geometris yang mengalir.',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop&crop=center'
    ],
    featured: true
  },
  {
    title: 'Digital Landscape',
    description: 'Pemandangan digital yang memadukan elemen alam dengan sentuhan teknologi modern.',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&h=1000&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=1000&fit=crop&crop=center'
    ],
    featured: false
  },
  {
    title: 'Neon Dreams',
    description: 'Karya yang terinspirasi dari estetika cyberpunk dengan cahaya neon yang memukau.',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=900&h=1200&fit=crop&crop=center'
    ],
    featured: true
  },
  {
    title: 'Minimalist Zen',
    description: 'Pendekatan minimalis yang terinspirasi dari filosofi zen dan kesederhanaan.',
    images: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1400&h=700&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=900&fit=crop&crop=center'
    ],
    featured: false
  },
  {
    title: 'Urban Architecture',
    description: 'Eksplorasi arsitektur perkotaan dengan permainan cahaya dan bayangan yang dramatis.',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1100&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1100&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1000&h=750&fit=crop&crop=center'
    ],
    featured: true
  },
  {
    title: 'Color Symphony',
    description: 'Simfoni warna yang mengekspresikan emosi melalui gradasi dan kontras yang harmonis.',
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=800&fit=crop&crop=center'
    ],
    featured: false
  },
  {
    title: 'Digital Portrait',
    description: 'Potret digital yang mengeksplorasi hubungan antara manusia dan teknologi.',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&h=1000&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=900&fit=crop&crop=center'
    ],
    featured: true
  },
  {
    title: 'Organic Flow',
    description: 'Aliran organik yang menggabungkan bentuk-bentuk alam dengan interpretasi digital.',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1300&h=650&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1100&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=750&h=1000&fit=crop&crop=center'
    ],
    featured: false
  },
  {
    title: 'Geometric Patterns',
    description: 'Pola geometris yang mengeksplorasi keindahan matematika dalam seni visual.',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1000&h=1000&fit=crop&crop=center'
    ],
    featured: true
  },
  {
    title: 'Liquid Light',
    description: 'Visualisasi cahaya yang berperilaku seperti cairan dalam ruang digital.',
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1100&h=700&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=1200&fit=crop&crop=center'
    ],
    featured: false
  },
  {
    title: 'Cosmic Journey',
    description: 'Perjalanan kosmik yang mengajak penonton untuk bermeditasi dengan alam semesta.',
    images: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&h=600&fit=crop&crop=center'
    ],
    featured: true
  },
  {
    title: 'Industrial Poetry',
    description: 'Menemukan keindahan dalam lanskap industri melalui permainan logam dan cahaya.',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=900&fit=crop&crop=center'
    ],
    featured: false
  },
  {
    title: 'Virtual Garden',
    description: 'Taman virtual di mana tanaman dan bunga digital mekar dalam warna yang mustahil.',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=700&h=1100&fit=crop&crop=center'
    ],
    featured: true
  },
  {
    title: 'Time Fragments',
    description: 'Eksplorasi artistik tentang waktu sebagai konsep visual melalui fragmen abstrak.',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1100&h=900&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1000&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1000&h=700&fit=crop&crop=center'
    ],
    featured: false
  },
  {
    title: 'Emotional Spectrum',
    description: 'Eksplorasi sinestesia di mana emosi diterjemahkan menjadi warna dan bentuk abstrak.',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=1200&fit=crop&crop=center'
    ],
    featured: true
  }
]

// Seed function
const seedSimpleArtworks = async () => {
  try {
    await connectDB()
    
    // Clear existing artworks
    console.log('🗑️  Clearing existing artworks...')
    await Artwork.deleteMany({})
    
    // Insert new artworks
    console.log('🌱 Seeding simple artworks...')
    const createdArtworks = await Artwork.insertMany(simpleArtworks)
    
    console.log(`✅ Successfully seeded ${createdArtworks.length} artworks!`)
    console.log('📊 Artwork summary:')
    console.log(`   - Featured artworks: ${createdArtworks.filter(a => a.featured).length}`)
    console.log(`   - Regular artworks: ${createdArtworks.filter(a => !a.featured).length}`)
    console.log(`   - Total images: ${createdArtworks.reduce((sum, a) => sum + a.images.length, 0)}`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding artworks:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSimpleArtworks()
}

export default seedSimpleArtworks