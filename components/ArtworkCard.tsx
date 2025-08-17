'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye } from 'lucide-react'

interface ArtworkCardProps {
  artwork: {
    _id: string
    title: string
    description: string
    images: string[]
    tags: string[]
    featured: boolean
    createdAt: string
  }
  index: number
}

export default function ArtworkCard({ artwork, index }: ArtworkCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative overflow-hidden rounded-xl transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/artwork/${artwork._id}`}>
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <div className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src={artwork.images[0] || '/placeholder-artwork.jpg'}
              alt={artwork.title}
              width={400}
              height={300}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
              onLoad={() => setImageLoaded(true)}
              priority={index < 6}
            />
          </div>
          
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
          )}

          {/* Hover Overlay */}
          <div
            className={`absolute inset-0 bg-black/80 flex items-center justify-center transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-center space-x-2 text-white bg-primary-500 px-4 py-2 rounded-lg">
              <Eye size={18} />
              <span className="font-medium">View Detail</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

// Loading skeleton component
export function ArtworkCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white/10 animate-pulse border border-white/20">
      <div className="aspect-[4/3] bg-white/10" />
    </div>
  )
}