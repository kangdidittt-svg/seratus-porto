import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Artwork from '@/models/Artwork'
import { authenticateRequest, isAdmin } from '@/lib/auth'

// GET /api/artworks - Get all artworks with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const featured = searchParams.get('featured') === 'true'
    
    const skip = (page - 1) * limit
    
    // Build query
    let query: any = {}
    
    if (search) {
      query.$text = { $search: search }
    }
    
    if (tags.length > 0) {
      query.tags = { $in: tags }
    }
    
    if (featured) {
      query.featured = true
    }
    
    // Get artworks with pagination
    const artworks = await Artwork.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Get total count for pagination
    const total = await Artwork.countDocuments(query)
    
    // Get all unique tags for filtering
    const allTags = await Artwork.distinct('tags')
    
    return NextResponse.json(
      {
        artworks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        filters: {
          tags: allTags
        }
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Get artworks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artworks' },
      { status: 500 }
    )
  }
}

// POST /api/artworks - Create new artwork (Admin only)
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
    
    const body = await request.json()
    const { title, description, images, tags, process_steps, creative_process_images, featured } = body
    
    // Validation
    if (!title || !description || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'Title, description, and at least one image are required' },
        { status: 400 }
      )
    }
    
    // Create artwork
    const artwork = new Artwork({
      title,
      description,
      images,
      tags: tags || [],
      process_steps: process_steps || [],
      creative_process_images: creative_process_images || [],
      featured: featured || false
    })
    
    await artwork.save()
    
    return NextResponse.json(
      {
        message: 'Artwork created successfully',
        artwork
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Create artwork error:', error)
    
    if ((error as any).name === 'ValidationError') {
      return NextResponse.json(
        { error: (error as any).message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create artwork' },
      { status: 500 }
    )
  }
}

// PUT /api/artworks - Update artwork (Admin only)
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
    
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Artwork ID is required' },
        { status: 400 }
      )
    }
    
    // Update artwork
    const artwork = await Artwork.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        message: 'Artwork updated successfully',
        artwork
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Update artwork error:', error)
    
    if ((error as any).name === 'ValidationError') {
      return NextResponse.json(
        { error: (error as any).message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update artwork' },
      { status: 500 }
    )
  }
}

// DELETE /api/artworks - Delete artwork (Admin only)
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
        { error: 'Artwork ID is required' },
        { status: 400 }
      )
    }
    
    // Delete artwork
    const artwork = await Artwork.findByIdAndDelete(id)
    
    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Artwork deleted successfully' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Delete artwork error:', error)
    return NextResponse.json(
      { error: 'Failed to delete artwork' },
      { status: 500 }
    )
  }
}