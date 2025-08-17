import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { params: string[] } }) {
  const [width = '300', height = '300'] = params.params || []
  
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <circle cx="50%" cy="40%" r="25%" fill="white" opacity="0.3"/>
      <path d="M ${parseInt(width) * 0.3} ${parseInt(height) * 0.7} Q ${parseInt(width) * 0.5} ${parseInt(height) * 0.6} ${parseInt(width) * 0.7} ${parseInt(height) * 0.7} L ${parseInt(width) * 0.7} ${parseInt(height)} L ${parseInt(width) * 0.3} ${parseInt(height)} Z" fill="white" opacity="0.3"/>
    </svg>
  `
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}