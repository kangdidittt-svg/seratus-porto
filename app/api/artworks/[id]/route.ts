import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Artwork from '@/models/Artwork'
import mongoose from 'mongoose'
import { verifyAdminToken } from '@/lib/auth'

// GET /api/artworks/[id] - Get single artwork by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const { id } = params
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid artwork ID' },
        { status: 400 }
      )
    }
    
    // Get artwork by ID
    const artwork = await Artwork.findById(id).lean()
    
    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }
    
    // Get related artworks (same tags, excluding current artwork)
    const relatedArtworks = await Artwork.find({
      _id: { $ne: id },
      tags: { $in: (artwork as any).tags }
    })
      .limit(6)
      .sort({ createdAt: -1 })
      .lean()
    
    // If not enough related artworks, get recent ones
    if (relatedArtworks.length < 6) {
      const additionalArtworks = await Artwork.find({
        _id: { $nin: [id, ...relatedArtworks.map(a => a._id)] }
      })
        .limit(6 - relatedArtworks.length)
        .sort({ createdAt: -1 })
        .lean()
      
      relatedArtworks.push(...additionalArtworks)
    }
    
    return NextResponse.json(
      {
        artwork,
        relatedArtworks
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Get artwork error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artwork' },
      { status: 500 }
    )
  }
}

// PUT /api/artworks/[id] - Update artwork by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const adminVerification = await verifyAdminToken(request)
    if (!adminVerification.success) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: 401 }
      )
    }

    await dbConnect()
    
    const { id } = params
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid artwork ID' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const { title, description, images, featured } = body

    // Validate required fields
    if (!title || !description || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi dan minimal 1 gambar' },
        { status: 400 }
      )
    }

    const artwork = await Artwork.findByIdAndUpdate(
      id,
      {
        title,
        description,
        images,
        featured: featured || false,
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Artwork berhasil diperbarui',
      artwork
    })
  } catch (error) {
    console.error('Update artwork error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/artworks/[id] - Delete artwork by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const adminVerification = await verifyAdminToken(request)
    if (!adminVerification.success) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: 401 }
      )
    }

    await dbConnect()
    
    const { id } = params
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid artwork ID' },
        { status: 400 }
      )
    }
    
    const artwork = await Artwork.findByIdAndDelete(id)

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Artwork berhasil dihapus'
    })
  } catch (error) {
    console.error('Delete artwork error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}