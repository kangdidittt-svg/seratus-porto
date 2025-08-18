import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { createReadStream, createWriteStream, existsSync, writeFileSync } from 'fs'
import { join } from 'path'
import archiver from 'archiver'
import nodemailer from 'nodemailer'

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Helper function to get watermark path
async function getWatermarkPath(watermark_option: string, custom_watermark: File | null): Promise<string | null> {
  if (watermark_option === 'none') {
    return null
  }
  
  if (watermark_option === 'custom' && custom_watermark) {
    // Save custom watermark temporarily
    const tempDir = join(process.cwd(), 'public', 'temp')
    const fs = require('fs')
    if (!existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    
    const tempWatermarkPath = join(tempDir, `watermark_${Date.now()}.${custom_watermark.name.split('.').pop()}`)
    const bytes = await custom_watermark.arrayBuffer()
    const buffer = Buffer.from(bytes)
    writeFileSync(tempWatermarkPath, buffer)
    
    return tempWatermarkPath
  }
  
  if (watermark_option === 'default') {
    // Check for default watermark
    const extensions = ['.png', '.jpg', '.jpeg']
    const watermarkDir = join(process.cwd(), 'public', 'watermarks')
    
    for (const ext of extensions) {
      const defaultWatermarkPath = join(watermarkDir, `default-watermark${ext}`)
      if (existsSync(defaultWatermarkPath)) {
        return defaultWatermarkPath
      }
    }
  }
  
  return null
}

// POST /api/download - Generate download link and send email
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const formData = await request.formData()
    const order_id = formData.get('order_id') as string
    const download_type = formData.get('download_type') as string || 'url'
    const watermark_option = formData.get('watermark_option') as string || 'default'
    const custom_watermark = formData.get('custom_watermark') as File | null
    
    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    // Get order first
    const order = await Order.findById(order_id)
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Get product details separately
    const product = await Product.findById(order.product_id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Check if order is paid and delivered
    if (order.payment_status !== 'paid' || order.delivery_status !== 'delivered') {
      return NextResponse.json(
        { error: 'Order must be paid and delivered to generate download' },
        { status: 400 }
      )
    }
    let downloadUrl = ''
    
    // Get watermark path if needed
    const watermarkPath = await getWatermarkPath(watermark_option, custom_watermark)
    
    if (download_type === 'zip') {
      // Create ZIP file
      const zipFileName = `${product.title.replace(/[^a-zA-Z0-9]/g, '_')}_${order_id}.zip`
      const zipPath = join(process.cwd(), 'public', 'downloads', zipFileName)
      
      // Ensure downloads directory exists
      const downloadsDir = join(process.cwd(), 'public', 'downloads')
      if (!existsSync(downloadsDir)) {
        const fs = require('fs')
        fs.mkdirSync(downloadsDir, { recursive: true })
      }
      
      // Create ZIP archive
      const output = createWriteStream(zipPath)
      const archive = archiver('zip', { zlib: { level: 9 } })
      
      // Handle archive events
      const archivePromise = new Promise<void>((resolve, reject) => {
        output.on('close', () => resolve())
        archive.on('error', reject)
      })
      
      archive.pipe(output)
      
      // Add main file to ZIP
      if (product.file_url && existsSync(product.file_url)) {
        archive.file(product.file_url, { name: `${product.title}.${product.file_url.split('.').pop()}` })
      }
      
      // Add preview images to ZIP
      if (product.preview_images && product.preview_images.length > 0) {
        product.preview_images.forEach((imagePath: string, index: number) => {
          if (existsSync(imagePath)) {
            archive.file(imagePath, { name: `preview_${index + 1}.${imagePath.split('.').pop()}` })
          }
        })
      }
      
      // Add watermark to ZIP if available
      if (watermarkPath && existsSync(watermarkPath)) {
        const watermarkName = watermark_option === 'custom' ? 'custom_watermark' : 'default_watermark'
        archive.file(watermarkPath, { name: `${watermarkName}.${watermarkPath.split('.').pop()}` })
      }
      
      archive.finalize()
      await archivePromise
      
      downloadUrl = `/downloads/${zipFileName}`
      
    } else {
      // Direct URL download
      downloadUrl = product.file_url
    }
    
    // Set download expiration (30 days from now)
    const downloadExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    
    // Cleanup temporary watermark file if it was custom
    if (watermark_option === 'custom' && watermarkPath && existsSync(watermarkPath)) {
      const fs = require('fs')
      try {
        fs.unlinkSync(watermarkPath)
      } catch (error) {
        console.log('Failed to cleanup temporary watermark file:', error)
      }
    }
    
    // Update order with download link
    await Order.findByIdAndUpdate(order_id, {
      download_link: downloadUrl,
      download_expires: downloadExpires
    })
    
    // Send email with download link
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Download Ready - ${product.title}</h2>
        <p>Halo ${order.customer_name},</p>
        <p>Terima kasih atas pembelian Anda! File digital Anda sudah siap untuk didownload.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detail Pesanan:</h3>
          <p><strong>Produk:</strong> ${product.title}</p>
          <p><strong>Jumlah:</strong> ${order.quantity}</p>
          <p><strong>Total:</strong> Rp ${order.total_amount.toLocaleString('id-ID')}</p>
          <p><strong>Watermark:</strong> ${watermark_option === 'none' ? 'Tidak ada' : watermark_option === 'custom' ? 'Custom watermark' : 'Default watermark'}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}${downloadUrl}" 
             style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Download File
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          <strong>Catatan Penting:</strong><br>
          • Link download akan kedaluwarsa pada ${downloadExpires.toLocaleDateString('id-ID')}<br>
          • Simpan file di tempat yang aman<br>
          • Jika ada masalah, hubungi kami di support@seratusstudio.com
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2024 Seratus Studio. All rights reserved.
        </p>
      </div>
    `
    
    // Send email with download link
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: order.customer_email,
        subject: `Download Ready - ${product.title}`,
        html: emailHtml
      })
      console.log('Email sent successfully to:', order.customer_email)
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      // Don't fail the entire request if email fails
    }
    
    return NextResponse.json({
      message: 'Download link generated and email sent successfully',
      download_url: downloadUrl,
      expires_at: downloadExpires
    })
    
  } catch (error) {
    console.error('Download generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download link' },
      { status: 500 }
    )
  }
}

// GET /api/download/[order_id] - Check download status
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const order_id = searchParams.get('order_id')
    
    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    const order = await Order.findById(order_id).populate('product_id', 'title')
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Check if download link exists and is not expired
    const isExpired = order.download_expires && new Date() > order.download_expires
    
    return NextResponse.json({
      has_download: !!order.download_link,
      download_url: order.download_link,
      expires_at: order.download_expires,
      is_expired: isExpired,
      product_title: order.product_id.title
    })
    
  } catch (error) {
    console.error('Download check error:', error)
    return NextResponse.json(
      { error: 'Failed to check download status' },
      { status: 500 }
    )
  }
}