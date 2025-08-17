import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'
import { Types } from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const { id } = params
    
    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Find the product
    const product = await Product.findById(id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Find related products based on category and tags
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      active: true,
      $or: [
        { category: product.category },
        { tags: { $in: product.tags } }
      ]
    })
    .limit(8)
    .select('-file_url') // Don't expose actual file URLs
    .sort({ downloads: -1, createdAt: -1 })

    return NextResponse.json({
      product: {
        ...product.toObject(),
        file_url: undefined // Don't expose actual file URL
      },
      relatedProducts
    })
    
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}