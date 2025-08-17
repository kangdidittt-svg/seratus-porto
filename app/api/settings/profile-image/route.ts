import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function GET() {
  try {
    // Check if there's a saved profile image setting
    // For now, we'll use a default or check uploads folder
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const profileImagePath = path.join(uploadsDir, 'profile.png')
    
    if (existsSync(profileImagePath)) {
      return NextResponse.json({ profileImage: '/uploads/profile.png' })
    }
    
    // Check for JPG version
    const profileImageJpgPath = path.join(uploadsDir, 'profile.jpg')
    if (existsSync(profileImageJpgPath)) {
      return NextResponse.json({ profileImage: '/uploads/profile.jpg' })
    }
    
    return NextResponse.json({ profileImage: '/uploads/profile-placeholder.svg' })
  } catch (error) {
    console.error('Error getting profile image:', error)
    return NextResponse.json({ profileImage: '/uploads/profile-placeholder.svg' })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type (PNG, JPG, JPEG)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PNG, JPG, and JPEG files are allowed' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save as profile.png (or keep original extension)
    const extension = file.type === 'image/png' ? 'png' : 'jpg'
    const filename = `profile.${extension}`
    const filepath = path.join(uploadsDir, filename)
    
    await writeFile(filepath, buffer)
    
    return NextResponse.json({ 
      message: 'Profile image uploaded successfully',
      profileImage: `/uploads/${filename}`
    })
  } catch (error) {
    console.error('Error uploading profile image:', error)
    return NextResponse.json({ error: 'Failed to upload profile image' }, { status: 500 })
  }
}