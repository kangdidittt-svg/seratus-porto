import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BackgroundLoader from '@/components/BackgroundLoader'
import FaviconUpdater from '@/components/FaviconUpdater'

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
      <body className={`${inter.className} text-white antialiased`}>
        <BackgroundLoader />
        <FaviconUpdater />
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}