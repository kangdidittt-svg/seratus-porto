import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Configure dotenv
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env.local') })

// Artwork Schema
const ArtworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const Artwork = mongoose.model('Artwork', ArtworkSchema)

// Connect and check
const checkArtworks = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    const count = await Artwork.countDocuments()
    console.log(`📊 Total artworks in database: ${count}`)
    
    if (count > 0) {
      const artworks = await Artwork.find().select('title featured').lean()
      console.log('\n📋 Artworks list:')
      artworks.forEach((artwork, index) => {
        console.log(`${index + 1}. ${artwork.title} ${artwork.featured ? '⭐' : ''}`)
      })
    }
    
    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkArtworks()