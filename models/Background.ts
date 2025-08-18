import mongoose, { Document, Schema, Model } from 'mongoose'

export interface IBackground extends Document {
  name: string
  image_url: string
  is_active: boolean
  file_size?: number
  file_type?: string
  createdAt: Date
  updatedAt: Date
}

export interface IBackgroundModel extends Model<IBackground> {
  getActive(): Promise<IBackground | null>
  setActive(id: string): Promise<IBackground | null>
}

const BackgroundSchema = new Schema<IBackground>(
  {
    name: {
      type: String,
      required: [true, 'Background name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    image_url: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true
    },
    is_active: {
      type: Boolean,
      default: false
    },
    file_size: {
      type: Number,
      min: [0, 'File size cannot be negative']
    },
    file_type: {
      type: String,
      enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
      default: 'image/jpeg'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Index for better query performance
BackgroundSchema.index({ is_active: 1 })
BackgroundSchema.index({ createdAt: -1 })

// Pre-save middleware to ensure only one active background
BackgroundSchema.pre('save', async function(next) {
  if (this.is_active && this.isModified('is_active')) {
    // Set all other backgrounds to inactive
    await mongoose.model('Background').updateMany(
      { _id: { $ne: this._id } },
      { is_active: false }
    )
  }
  next()
})

// Static method to get active background
BackgroundSchema.statics.getActive = function() {
  return this.findOne({ is_active: true }).sort({ createdAt: -1 })
}

// Static method to set active background
BackgroundSchema.statics.setActive = async function(id: string) {
  // First, set all backgrounds to inactive
  await this.updateMany({}, { is_active: false })
  // Then set the specified background to active
  return this.findByIdAndUpdate(id, { is_active: true }, { new: true })
}

export default (mongoose.models.Background as IBackgroundModel) || mongoose.model<IBackground, IBackgroundModel>('Background', BackgroundSchema)