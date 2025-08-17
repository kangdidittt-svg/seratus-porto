import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const LOGO_PATH = path.join(UPLOAD_DIR, 'logo.png')
const FAVICON_PATH = path.join(process.cwd(), 'public', 'favicon.ico')

export async function GET() {
  try {
    // Check if custom logo exists
    if (existsSync(LOGO_PATH)) {
      return NextResponse.json({
        success: true,
        logoUrl: '/uploads/logo.png',
        hasCustomLogo: true
      })
    }
    
    // Return default logo info
    return NextResponse.json({
      success: true,
      logoUrl: null,
      hasCustomLogo: false
    })
  } catch (error) {
    console.error('Error getting logo:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get logo' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('logo') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PNG, JPG, JPEG, and SVG are allowed.' },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Save logo
    const logoExtension = file.type === 'image/svg+xml' ? 'svg' : 'png'
    const logoPath = path.join(UPLOAD_DIR, `logo.${logoExtension}`)
    await writeFile(logoPath, buffer)
    
    // Create favicon from the uploaded image (for non-SVG files)
    if (file.type !== 'image/svg+xml') {
      // For now, just copy the logo as favicon
      // In a real implementation, you might want to resize it to 32x32 or 16x16
      await writeFile(FAVICON_PATH, buffer)
    }

    return NextResponse.json({
      success: true,
      message: 'Logo uploaded successfully',
      logoUrl: `/uploads/logo.${logoExtension}`
    })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload logo' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Remove custom logo files
    const logoFiles = ['logo.png', 'logo.svg', 'logo.jpg', 'logo.jpeg']
    
    for (const filename of logoFiles) {
      const filePath = path.join(UPLOAD_DIR, filename)
      if (existsSync(filePath)) {
        await writeFile(filePath, '') // Clear file content
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Logo reset to default'
    })
  } catch (error) {
    console.error('Error deleting logo:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset logo' },
      { status: 500 }
    )
  }
}