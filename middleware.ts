import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip middleware for login page
    if (request.nextUrl.pathname === '/admin') {
      return NextResponse.next()
    }

    // Get the token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // Redirect to admin login if no token
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // For now, just check if token exists
    // Token verification will be handled by the API routes
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}