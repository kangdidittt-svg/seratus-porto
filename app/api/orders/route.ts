import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { authenticateRequest, isAdmin } from '@/lib/auth'

// GET /api/orders - Get all orders (Admin only) or user's orders
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const email = searchParams.get('email') || ''
    const status = searchParams.get('status') || ''
    const paymentStatus = searchParams.get('paymentStatus') || ''
    
    const skip = (page - 1) * limit
    
    // Check if user is admin
    const user = await authenticateRequest(request)
    const isUserAdmin = user && isAdmin(user)
    
    // Build query
    let query: any = {}
    
    // If not admin, only show orders for specific email
    if (!isUserAdmin && email) {
      query.customer_email = email
    } else if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (status) {
      query.delivery_status = status
    }
    
    if (paymentStatus) {
      query.payment_status = paymentStatus
    }
    
    // Get orders with product details
    const orders = await Order.find(query)
      .populate('product_id', 'title price watermark_url category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Get total count for pagination
    const total = await Order.countDocuments(query)
    
    return NextResponse.json(
      {
        orders,
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
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      product_id,
      quantity = 1,
      notes,
      payment_proof
    } = body
    
    // Validation
    if (!customer_name || !customer_email || !customer_phone || !customer_address || !product_id) {
      return NextResponse.json(
        { error: 'Customer name, email, phone, address, and product ID are required' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customer_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    // Get product details
    const product = await Product.findById(product_id)
    if (!product || !product.active) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      )
    }
    
    // Calculate total amount
    const finalPrice = product.price - (product.price * product.discount / 100)
    const total_amount = finalPrice * quantity
    
    // Create order
    const order = new Order({
      customer_name,
      customer_email: customer_email.toLowerCase(),
      customer_phone,
      customer_address,
      product_id,
      quantity,
      total_amount,
      notes,
      payment_proof
    })
    
    await order.save()
    
    // Populate product details for response
    await order.populate('product_id', 'title price watermark_url category')
    
    return NextResponse.json(
      {
        message: 'Order created successfully',
        order
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Create order error:', error)
    
    if ((error as any).name === 'ValidationError') {
      return NextResponse.json(
        { error: (error as any).message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// PUT /api/orders - Update order status (Admin only)
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
    const {
      id,
      payment_status,
      delivery_status,
      download_link,
      notes
    } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    // Build update object
    const updateData: any = {}
    
    if (payment_status) updateData.payment_status = payment_status
    if (delivery_status) updateData.delivery_status = delivery_status
    if (download_link) updateData.download_link = download_link
    if (notes !== undefined) updateData.notes = notes
    
    // If marking as delivered, set download expiration
    if (delivery_status === 'delivered' && payment_status === 'paid') {
      updateData.download_expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
    
    // Update order
    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('product_id', 'title price watermark_url category')
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Update product download count if delivered
    if (delivery_status === 'delivered' && payment_status === 'paid') {
      await Product.findByIdAndUpdate(
        order.product_id,
        { $inc: { downloads: order.quantity } }
      )
    }
    
    return NextResponse.json(
      {
        message: 'Order updated successfully',
        order
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Update order error:', error)
    
    if ((error as any).name === 'ValidationError') {
      return NextResponse.json(
        { error: (error as any).message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders - Delete order (Admin only)
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
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    // Delete order
    const order = await Order.findByIdAndDelete(id)
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Order deleted successfully' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}