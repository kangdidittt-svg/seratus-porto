import mongoose, { Document, Schema } from 'mongoose'

export interface IOrder extends Document {
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  product_id: mongoose.Types.ObjectId
  quantity: number
  total_amount: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  delivery_status: 'pending' | 'processing' | 'delivered' | 'failed'
  download_link?: string
  download_expires?: Date
  payment_proof?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    customer_name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    customer_email: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
    },
    customer_phone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true
    },
    customer_address: {
      type: String,
      required: [true, 'Customer address is required'],
      trim: true
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    total_amount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    delivery_status: {
      type: String,
      enum: ['pending', 'processing', 'delivered', 'failed'],
      default: 'pending'
    },
    download_link: {
      type: String,
      default: null
    },
    download_expires: {
      type: Date,
      default: null
    },
    payment_proof: {
      type: String,
      default: null
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Virtual to populate product details
OrderSchema.virtual('product', {
  ref: 'Product',
  localField: 'product_id',
  foreignField: '_id',
  justOne: true
})

// Index for better query performance
OrderSchema.index({ customer_email: 1 })
OrderSchema.index({ payment_status: 1 })
OrderSchema.index({ delivery_status: 1 })
OrderSchema.index({ createdAt: -1 })
OrderSchema.index({ product_id: 1 })

// Pre-save middleware to set download expiration
OrderSchema.pre('save', function(next) {
  if (this.payment_status === 'paid' && this.delivery_status === 'delivered' && !this.download_expires) {
    // Set download link to expire in 30 days
    this.download_expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
  next()
})

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)