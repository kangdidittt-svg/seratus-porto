import mongoose, { Document, Schema } from 'mongoose'

export interface IArtwork extends Document {
  title: string
  description: string
  images: string[]
  tags: string[]
  process_steps: string[]
  creative_process_images: {
    title: string
    description: string
    image_url: string
  }[]
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

const ArtworkSchema = new Schema<IArtwork>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: {
        validator: function(v: string[]) {
          return v && v.length > 0
        },
        message: 'At least one image is required'
      }
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 10
        },
        message: 'Cannot have more than 10 tags'
      }
    },
    process_steps: {
      type: [String],
      default: []
    },
    creative_process_images: {
      type: [{
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, 'Process step title cannot exceed 100 characters']
        },
        description: {
          type: String,
          required: true,
          trim: true,
          maxlength: [500, 'Process step description cannot exceed 500 characters']
        },
        image_url: {
          type: String,
          required: true
        }
      }],
      default: [],
      validate: {
        validator: function(v: any[]) {
          return v.length <= 20
        },
        message: 'Cannot have more than 20 creative process images'
      }
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Index for better search performance
ArtworkSchema.index({ title: 'text', description: 'text', tags: 'text' })
ArtworkSchema.index({ featured: -1, createdAt: -1 })
ArtworkSchema.index({ createdAt: -1 })

export default mongoose.models.Artwork || mongoose.model<IArtwork>('Artwork', ArtworkSchema)