import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'
import { authenticateRequest, isAdmin } from '@/lib/auth'

// GET /api/products - Get all products with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    
    const skip = (page - 1) * limit
    
    // Build query
    let query: any = { active: true }
    
    if (search) {
      query.$text = { $search: search }
    }
    
    if (category) {
      query.category = category
    }
    
    if (tags.length > 0) {
      query.tags = { $in: tags }
    }
    
    // Price range filter
    query.price = { $gte: minPrice, $lte: maxPrice }
    
    // Build sort object
    const sortObj: any = {}
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1
    
    // Get products with pagination
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Calculate final prices
    const productsWithFinalPrice = products.map(product => ({
      ...product,
      finalPrice: product.price - (product.price * product.discount / 100)
    }))
    
    // Get total count for pagination
    const total = await Product.countDocuments(query)
    
    // Get filter options
    const categories = await Product.distinct('category', { active: true })
    const allTags = await Product.distinct('tags', { active: true })
    const priceRange = await Product.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ])
    
    return NextResponse.json(
      {
        products: productsWithFinalPrice,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        filters: {
          categories,
          tags: allTags,
          priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
        }
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product (Admin only)
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
    const {
      title,
      description,
      price,
      discount,
      category,
      file_url,
      watermark_url,
      preview_images,
      tags,
      active
    } = body
    
    // Validation
    if (!title || !description || !price || !category || !file_url || !watermark_url) {
      return NextResponse.json(
        { error: 'Title, description, price, category, file_url, and watermark_url are required' },
        { status: 400 }
      )
    }
    
    // Create product
    const product = new Product({
      title,
      description,
      price,
      discount: discount || 0,
      category,
      file_url,
      watermark_url,
      preview_images: preview_images || [],
      tags: tags || [],
      active: active !== undefined ? active : true
    })
    
    await product.save()
    
    return NextResponse.json(
      {
        message: 'Product created successfully',
        product
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Create product error:', error)
    
    if ((error as any).name === 'ValidationError') {
      return NextResponse.json(
        { error: (error as any).message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

// PUT /api/products - Update product (Admin only)
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
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    // Update product
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        message: 'Product updated successfully',
        product
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Update product error:', error)
    
    if ((error as any).name === 'ValidationError') {
      return NextResponse.json(
        { error: (error as any).message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products - Delete product (Admin only)
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
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    // Soft delete - set active to false
    const product = await Product.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    )
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}