import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import User, { IUser } from '@/models/User'
import dbConnect from './mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  username: string
  role: string
  iat?: number
  exp?: number
}

// Generate JWT token
export function generateToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: (user._id as any).toString(),
    username: user.username,
    role: user.role
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // Token expires in 7 days
  })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

// Extract token from request headers
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Also check for token in cookies
  const tokenFromCookie = request.cookies.get('auth-token')?.value
  if (tokenFromCookie) {
    return tokenFromCookie
  }
  
  return null
}

// Middleware to authenticate requests
export async function authenticateRequest(request: NextRequest): Promise<IUser | null> {
  try {
    const token = extractTokenFromRequest(request)
    
    if (!token) {
      return null
    }
    
    const payload = verifyToken(token)
    
    await dbConnect()
    const user = await User.findById(payload.userId).select('-password')
    
    if (!user || !user.active) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Check if user is admin
export function isAdmin(user: IUser | null): boolean {
  return user?.role === 'admin'
}

// Create admin user if doesn't exist
export async function createDefaultAdmin() {
  try {
    await dbConnect()
    
    const adminExists = await User.findOne({ role: 'admin' })
    
    if (!adminExists) {
      const adminUser = new User({
        username: process.env.ADMIN_USERNAME || 'admin',
        email: 'admin@seratusstudio.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin'
      })
      
      await adminUser.save()
      console.log('Default admin user created')
    }
  } catch (error) {
    console.error('Error creating default admin:', error)
  }
}

// Password validation
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }
  
  return { isValid: true }
}

// Generate secure random password
export function generateSecurePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  return password
}