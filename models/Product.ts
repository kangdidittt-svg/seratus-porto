import mongoose, { Document, Schema } from 'mongoose'

export interface IProduct extends Document {
  title: string
  description: string
  price: number
  original_price: number
  category: string
  file_url: string
  watermark_url: string
  preview_images: string[]
  tags: string[]
  downloads: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
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
      required: [true, 'Sale price is required'],
      min: [0, 'Price cannot be negative']
    },
    original_price: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Original price cannot be negative']
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
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 10
        },
        message: 'Cannot have more than 10 tags'
      }
    },
    downloads: {
      type: Number,
      default: 0,
      min: [0, 'Downloads cannot be negative']
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Virtual for final price (same as price since price is already the sale price)
ProductSchema.virtual('finalPrice').get(function() {
  return this.price
})

// Virtual for discount percentage
ProductSchema.virtual('discount').get(function() {
  if (this.original_price <= 0) return 0
  return Math.round(((this.original_price - this.price) / this.original_price) * 100)
})

// Virtual for discount amount
ProductSchema.virtual('discountAmount').get(function() {
  return Math.max(0, this.original_price - this.price)
})

// Index for better search and filtering
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' })
ProductSchema.index({ category: 1, active: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ downloads: -1 })
ProductSchema.index({ createdAt: -1 })

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)