'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, Heart, Tag } from 'lucide-react'

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/artwork/${artwork._id}`}>
        {/* Featured Badge */}
        {artwork.featured && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-dark-900 px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          </div>
        )}

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
            <div className="absolute inset-0 bg-dark-700 animate-pulse" />
          )}

          {/* Hover Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/50 to-transparent flex items-end justify-between p-4"
          >
            <div className="flex items-center space-x-4 text-white">
              <div className="flex items-center space-x-1">
                <Eye size={16} />
                <span className="text-sm">View</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart size={16} />
                <span className="text-sm">Like</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
            {artwork.title}
          </h3>
          
          <p className="text-dark-300 text-sm mb-3 line-clamp-2">
            {artwork.description}
          </p>

          {/* Tags */}
          {artwork.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {artwork.tags.slice(0, 3).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="inline-flex items-center space-x-1 bg-dark-700 text-dark-300 px-2 py-1 rounded-full text-xs"
                >
                  <Tag size={10} />
                  <span>{tag}</span>
                </span>
              ))}
              {artwork.tags.length > 3 && (
                <span className="text-dark-400 text-xs px-2 py-1">
                  +{artwork.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Date */}
          <div className="text-dark-400 text-xs">
            {new Date(artwork.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Loading skeleton component
export function ArtworkCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-dark-800 border border-dark-700 animate-pulse">
      <div className="aspect-[4/3] bg-dark-700" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-dark-700 rounded" />
        <div className="h-4 bg-dark-700 rounded w-3/4" />
        <div className="flex space-x-2">
          <div className="h-6 bg-dark-700 rounded-full w-16" />
          <div className="h-6 bg-dark-700 rounded-full w-20" />
        </div>
        <div className="h-3 bg-dark-700 rounded w-1/2" />
      </div>
    </div>
  )
}