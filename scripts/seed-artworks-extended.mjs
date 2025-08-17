import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Configure dotenv
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

// Artwork Schema
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

// Extended artwork data
const extendedArtworks = [
  {
    title: 'Digital Abstract Symphony #001',
    description: 'A mesmerizing digital abstract artwork featuring flowing geometric patterns and vibrant color gradients that dance across the canvas.',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop'
    ],
    tags: ['abstract', 'digital', 'geometric', 'colorful', 'symphony'],
    process_steps: ['Concept Development', 'Digital Sketching', 'Color Exploration', 'Final Composition', 'Digital Enhancement'],
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
      }
    ],
    featured: true
  },
  {
    title: 'Neon Dreams: Cyberpunk Vision',
    description: 'Cyberpunk-inspired artwork with neon lights and futuristic elements that transport viewers to a digital dystopia.',
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=1200&fit=crop'
    ],
    tags: ['cyberpunk', 'neon', 'futuristic', 'digital', 'dystopia'],
    process_steps: ['Mood Board Creation', '3D Modeling', 'Lighting Setup', 'Post Processing', 'Neon Effects'],
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
      }
    ],
    featured: true
  },
  {
    title: 'Minimalist Zen Garden',
    description: 'Clean and simple landscape with modern minimalist approach inspired by Japanese zen gardens.',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=1200&fit=crop'
    ],
    tags: ['minimalist', 'landscape', 'clean', 'modern', 'zen', 'japanese'],
    process_steps: ['Location Scouting', 'Composition Planning', 'Digital Enhancement', 'Minimalist Editing'],
    creative_process_images: [
      {
        title: 'Location Research',
        description: 'Exploring different locations for the perfect minimalist landscape.',
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      }
    ],
    featured: false
  },
  {
    title: 'Urban Architecture Dynamics',
    description: 'Modern architectural photography showcasing urban design and the interplay of light and shadow.',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1200&fit=crop'
    ],
    tags: ['architecture', 'urban', 'modern', 'photography', 'dynamics', 'shadow'],
    process_steps: ['Urban Exploration', 'Architectural Analysis', 'Photography Session', 'Post Processing', 'Shadow Enhancement'],
    creative_process_images: [
      {
        title: 'Building Survey',
        description: 'Analyzing architectural elements and finding unique perspectives.',
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop'
      }
    ],
    featured: true
  },
  {
    title: 'Color Explosion: Prismatic Dreams',
    description: 'Vibrant abstract composition with explosive color combinations that create a prismatic dreamscape.',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop'
    ],
    tags: ['abstract', 'colorful', 'vibrant', 'explosion', 'prismatic', 'dreams'],
    process_steps: ['Color Theory Research', 'Digital Painting', 'Effect Application', 'Prismatic Effects'],
    creative_process_images: [
      {
        title: 'Color Wheel Studies',
        description: 'Exploring complementary and analogous color relationships.',
        image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop'
      }
    ],
    featured: false
  },
  {
    title: 'Digital Portrait: Future Faces',
    description: 'Contemporary digital portrait series exploring the intersection of humanity and technology.',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop'
    ],
    tags: ['portrait', 'digital', 'contemporary', 'artistic', 'future', 'technology'],
    process_steps: ['Reference Photography', 'Digital Sketching', 'Color Grading', 'Final Touches', 'Tech Integration'],
    creative_process_images: [
      {
        title: 'Reference Photos',
        description: 'Collecting and analyzing reference photographs for the portrait series.',
        image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop'
      }
    ],
    featured: true
  },
  {
    title: 'Organic Flow: Nature Meets Digital',
    description: 'A harmonious blend of organic forms and digital artistry, exploring the connection between nature and technology.',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=1200&fit=crop'
    ],
    tags: ['organic', 'nature', 'digital', 'flow', 'harmony', 'technology'],
    process_steps: ['Nature Study', 'Digital Interpretation', 'Organic Modeling', 'Flow Dynamics'],
    creative_process_images: [
      {
        title: 'Nature Reference Collection',
        description: 'Gathering natural forms and patterns as inspiration.',
        image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop'
      }
    ],
    featured: false
  },
  {
    title: 'Geometric Harmony: Sacred Patterns',
    description: 'Exploration of sacred geometry and mathematical beauty through digital art and precise geometric patterns.',
    images: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1200&fit=crop'
    ],
    tags: ['geometric', 'sacred', 'patterns', 'mathematical', 'harmony', 'precision'],
    process_steps: ['Mathematical Research', 'Pattern Design', 'Geometric Construction', 'Sacred Proportions'],
    creative_process_images: [
      {
        title: 'Sacred Geometry Studies',
        description: 'Research into mathematical principles and sacred proportions.',
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      }
    ],
    featured: true
  },
  {
    title: 'Liquid Light: Fluid Dynamics',
    description: 'Mesmerizing visualization of light behaving like liquid, creating fluid dynamics in digital space.',
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=1200&fit=crop'
    ],
    tags: ['liquid', 'light', 'fluid', 'dynamics', 'visualization', 'mesmerizing'],
    process_steps: ['Fluid Simulation', 'Light Physics', 'Dynamic Rendering', 'Liquid Effects'],
    creative_process_images: [
      {
        title: 'Fluid Simulation Tests',
        description: 'Experimenting with different fluid dynamics and light interactions.',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
      }
    ],
    featured: false
  },
  {
    title: 'Cosmic Meditation: Space Dreams',
    description: 'A journey through cosmic landscapes and celestial bodies, inviting viewers into deep meditation.',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=1200&fit=crop'
    ],
    tags: ['cosmic', 'meditation', 'space', 'dreams', 'celestial', 'journey'],
    process_steps: ['Astronomical Research', 'Cosmic Visualization', 'Meditation Themes', 'Space Rendering'],
    creative_process_images: [
      {
        title: 'Astronomical References',
        description: 'Studying celestial bodies and cosmic phenomena for inspiration.',
        image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop'
      }
    ],
    featured: true
  },
  {
    title: 'Industrial Poetry: Metal and Light',
    description: 'Finding beauty in industrial landscapes, where metal structures create poetry through light and shadow.',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1200&fit=crop'
    ],
    tags: ['industrial', 'poetry', 'metal', 'light', 'shadow', 'beauty'],
    process_steps: ['Industrial Exploration', 'Light Study', 'Metal Textures', 'Poetic Composition'],
    creative_process_images: [
      {
        title: 'Industrial Site Survey',
        description: 'Exploring industrial locations for artistic potential.',
        image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop'
      }
    ],
    featured: false
  },
  {
    title: 'Digital Botanica: Virtual Garden',
    description: 'A virtual botanical garden where digital plants and flowers bloom in impossible colors and forms.',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=1200&fit=crop'
    ],
    tags: ['digital', 'botanical', 'virtual', 'garden', 'plants', 'flowers'],
    process_steps: ['Botanical Study', 'Digital Modeling', 'Virtual Environment', 'Impossible Colors'],
    creative_process_images: [
      {
        title: 'Plant Structure Analysis',
        description: 'Studying natural plant forms for digital interpretation.',
        image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop'
      }
    ],
    featured: true
  },
  {
    title: 'Temporal Fragments: Time Visualization',
    description: 'An artistic exploration of time as a visual concept, fragmenting moments into abstract compositions.',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1200&fit=crop'
    ],
    tags: ['temporal', 'fragments', 'time', 'visualization', 'abstract', 'moments'],
    process_steps: ['Time Concept Research', 'Fragment Design', 'Temporal Effects', 'Abstract Composition'],
    creative_process_images: [
      {
        title: 'Time Concept Studies',
        description: 'Exploring different ways to visualize the concept of time.',
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      }
    ],
    featured: false
  },
  {
    title: 'Quantum Entanglement: Particle Dance',
    description: 'Visualization of quantum physics concepts through artistic interpretation of particle interactions.',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1200&fit=crop'
    ],
    tags: ['quantum', 'entanglement', 'particle', 'dance', 'physics', 'visualization'],
    process_steps: ['Physics Research', 'Particle Simulation', 'Quantum Visualization', 'Artistic Interpretation'],
    creative_process_images: [
      {
        title: 'Quantum Physics Studies',
        description: 'Research into quantum mechanics for artistic inspiration.',
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop'
      }
    ],
    featured: true
  },
  {
    title: 'Emotional Spectrum: Feeling Colors',
    description: 'A synesthetic exploration where emotions are translated into colors and abstract forms.',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1200&fit=crop'
    ],
    tags: ['emotional', 'spectrum', 'feeling', 'colors', 'synesthetic', 'abstract'],
    process_steps: ['Emotion Mapping', 'Color Psychology', 'Synesthetic Translation', 'Abstract Expression'],
    creative_process_images: [
      {
        title: 'Emotion-Color Studies',
        description: 'Mapping different emotions to color palettes and forms.',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
      }
    ],
    featured: false
  }
]

// Seed function
const seedExtendedArtworks = async () => {
  try {
    await connectDB()
    
    console.log('🌱 Starting extended artwork seeding...')
    
    // Clear existing artworks
    await Artwork.deleteMany({})
    console.log('🗑️ Cleared existing artworks')
    
    // Insert new artworks
    const insertedArtworks = await Artwork.insertMany(extendedArtworks)
    console.log(`✅ Successfully seeded ${insertedArtworks.length} extended artworks`)
    
    // Display summary
    const featuredCount = insertedArtworks.filter(artwork => artwork.featured).length
    console.log(`📊 Summary:`)
    console.log(`   - Total artworks: ${insertedArtworks.length}`)
    console.log(`   - Featured artworks: ${featuredCount}`)
    console.log(`   - Regular artworks: ${insertedArtworks.length - featuredCount}`)
    
    console.log('🎨 Extended artwork seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding extended artworks:', error)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedExtendedArtworks()
}

export default seedExtendedArtworks