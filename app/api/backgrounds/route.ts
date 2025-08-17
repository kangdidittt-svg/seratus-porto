import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Background from '@/models/Background'
import { authenticateRequest, isAdmin } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// GET /api/backgrounds - Get all backgrounds or active background
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // If requesting active background, no authentication required (for BackgroundLoader)
    if (active === 'true') {
      const background = await Background.findOne({ is_active: true })
      return NextResponse.json({ background })
    }
    
    // For all other requests, require admin authentication
    const user = await authenticateRequest(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const skip = (page - 1) * limit
    
    const backgrounds = await Background.find({})
      .sort({ is_active: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    const total = await Background.countDocuments({})
    
    return NextResponse.json(
      {
        backgrounds,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Get backgrounds error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backgrounds' },
      { status: 500 }
    )
  }
}

// POST /api/backgrounds - Upload new background (Admin only)
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    // Authenticate user
    const user = await authenticateRequest(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const setActive = formData.get('setActive') === 'true'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    if (!name) {
      return NextResponse.json(
        { error: 'Background name is required' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed.' },
        { status: 400 }
      )
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      )
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'backgrounds')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const filename = `${timestamp}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`
    const filepath = join(uploadsDir, filename)
    
    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)
    
    // If setting as active, deactivate all other backgrounds first
    if (setActive) {
      await Background.updateMany({}, { is_active: false })
    }

    // Create background record - always set as active for new uploads
    const background = new Background({
      name,
      image_url: `/uploads/backgrounds/${filename}`,
      is_active: true, // Always set new uploads as active
      file_size: file.size,
      file_type: file.type
    })

    // Deactivate all other backgrounds when creating new one
    await Background.updateMany({}, { is_active: false })
    
    await background.save()
    
    return NextResponse.json(
      {
        message: 'Background uploaded successfully',
        background
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Upload background error:', error)
    return NextResponse.json(
      { error: 'Failed to upload background' },
      { status: 500 }
    )
  }
}

// PUT /api/backgrounds - Update background (set active/inactive) (Admin only)
export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    // Authenticate user
    const user = await authenticateRequest(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { id, is_active, name } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Background ID is required' },
        { status: 400 }
      )
    }
    
    const updateData: any = {}
    if (typeof is_active === 'boolean') {
      updateData.is_active = is_active
    }
    if (name) {
      updateData.name = name
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }
    
    // If setting as active, use the static method to ensure only one active
    let background
    if (updateData.is_active === true) {
      background = await Background.setActive(id)
    } else {
      background = await Background.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      )
    }
    
    if (!background) {
      return NextResponse.json(
        { error: 'Background not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        message: 'Background updated successfully',
        background
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Update background error:', error)
    return NextResponse.json(
      { error: 'Failed to update background' },
      { status: 500 }
    )
  }
}

// DELETE /api/backgrounds - Delete background (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    // Authenticate user
    const user = await authenticateRequest(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Background ID is required' },
        { status: 400 }
      )
    }
    
    // Find and delete background
    const background = await Background.findByIdAndDelete(id)
    
    if (!background) {
      return NextResponse.json(
        { error: 'Background not found' },
        { status: 404 }
      )
    }
    
    // TODO: Optionally delete the actual file from filesystem
    // const fs = require('fs')
    // const filepath = join(process.cwd(), 'public', background.image_url)
    // if (fs.existsSync(filepath)) {
    //   fs.unlinkSync(filepath)
    // }
    
    return NextResponse.json(
      { message: 'Background deleted successfully' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Delete background error:', error)
    return NextResponse.json(
      { error: 'Failed to delete background' },
      { status: 500 }
    )
  }
}