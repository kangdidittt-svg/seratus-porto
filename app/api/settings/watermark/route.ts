import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const WATERMARK_DIR = path.join(process.cwd(), 'public', 'watermarks')
const WATERMARK_FILE = path.join(WATERMARK_DIR, 'default-watermark')

// Ensure watermark directory exists
async function ensureWatermarkDir() {
  const { mkdir } = await import('fs/promises')
  try {
    await mkdir(WATERMARK_DIR, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

// Get current watermark
export async function GET() {
  try {
    // Check for different file extensions
    const extensions = ['.png', '.jpg', '.jpeg']
    let watermarkUrl = ''
    let hasDefaultWatermark = false

    for (const ext of extensions) {
      const filePath = WATERMARK_FILE + ext
      if (existsSync(filePath)) {
        watermarkUrl = `/watermarks/default-watermark${ext}`
        hasDefaultWatermark = true
        break
      }
    }

    return NextResponse.json({
      watermarkUrl,
      hasDefaultWatermark
    })
  } catch (error) {
    console.error('Error getting watermark:', error)
    return NextResponse.json(
      { error: 'Failed to get watermark' },
      { status: 500 }
    )
  }
}

// Upload new watermark
export async function POST(request: NextRequest) {
  try {
    await ensureWatermarkDir()

    const formData = await request.formData()
    const file = formData.get('watermark') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No watermark file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPG, and JPEG are allowed.' },
        { status: 400 }
      )
    }

    // Remove existing watermark files
    const extensions = ['.png', '.jpg', '.jpeg']
    for (const ext of extensions) {
      const existingFile = WATERMARK_FILE + ext
      if (existsSync(existingFile)) {
        await unlink(existingFile)
      }
    }

    // Determine file extension
    const fileExtension = file.type === 'image/png' ? '.png' : 
                         file.type === 'image/jpeg' ? '.jpg' : '.jpg'
    
    const watermarkPath = WATERMARK_FILE + fileExtension
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await writeFile(watermarkPath, buffer)

    const watermarkUrl = `/watermarks/default-watermark${fileExtension}`

    return NextResponse.json({
      success: true,
      watermarkUrl,
      message: 'Watermark uploaded successfully'
    })
  } catch (error) {
    console.error('Error uploading watermark:', error)
    return NextResponse.json(
      { error: 'Failed to upload watermark' },
      { status: 500 }
    )
  }
}

// Delete watermark
export async function DELETE() {
  try {
    // Remove all possible watermark files
    const extensions = ['.png', '.jpg', '.jpeg']
    let removed = false

    for (const ext of extensions) {
      const filePath = WATERMARK_FILE + ext
      if (existsSync(filePath)) {
        await unlink(filePath)
        removed = true
      }
    }

    if (removed) {
      return NextResponse.json({
        success: true,
        message: 'Default watermark removed successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'No watermark found to remove' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error removing watermark:', error)
    return NextResponse.json(
      { error: 'Failed to remove watermark' },
      { status: 500 }
    )
  }
}