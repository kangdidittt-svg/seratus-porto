import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Seratus Studio - Creative Portfolio',
  description: 'Portfolio kreatif dan toko digital untuk desain premium',
  keywords: 'portfolio, design, creative, digital art, premade designs',
  authors: [{ name: 'Seratus Studio' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.className} bg-dark-900 text-white antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
          {children}
        </div>
      </body>
    </html>
  )
}