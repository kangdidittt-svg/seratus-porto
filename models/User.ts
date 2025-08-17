import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  username: string
  email: string
  password: string
  role: 'admin' | 'user'
  active: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    },
    active: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete (ret as any).password
        return ret
      }
    },
    toObject: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete (ret as any).password
        return ret
      }
    }
  }
)

// Index for better query performance (username and email already indexed via unique: true)
UserSchema.index({ role: 1, active: 1 })

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next()

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12)
    this.password = hashedPassword
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Instance method to check password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

// Static method to find user by credentials
UserSchema.statics.findByCredentials = async function(username: string, password: string) {
  const user = await this.findOne({ 
    $or: [{ username }, { email: username }],
    active: true 
  }).select('+password')
  
  if (!user) {
    throw new Error('Invalid credentials')
  }
  
  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new Error('Invalid credentials')
  }
  
  // Update last login
  user.lastLogin = new Date()
  await user.save()
  
  return user
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)