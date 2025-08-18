'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye, Download, Star, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { IProduct } from '@/models/Product'

interface ProductCardProps {
  product: IProduct
  index: number
  onAddToCart: (product: IProduct) => void
}

export default function ProductCard({ product, index, onAddToCart }: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0)
    setImageLoading(true)
  }, [product._id])

  const hasDiscount = product.original_price > product.price
  const discountPercentage = hasDiscount ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0
  const discountAmount = hasDiscount ? product.original_price - product.price : 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const nextImage = () => {
    if (product.preview_images && product.preview_images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.preview_images.length)
      setImageLoading(true)
    }
  }

  const prevImage = () => {
    if (product.preview_images && product.preview_images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.preview_images.length) % product.preview_images.length)
      setImageLoading(true)
    }
  }

  return (
    <div
      className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold z-10">
            -{discountPercentage}%
          </div>
        )}

        {/* Image Loading Skeleton */}
        {imageLoading && (
          <div className="absolute inset-0 bg-white/10 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {/* Main Image */}
        <Image
          src={(product.preview_images && product.preview_images[currentImageIndex]) || product.watermark_url || '/placeholder-product.jpg'}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onLoad={() => setImageLoading(false)}
        />

        {/* Image Navigation Dots */}
        {product.preview_images && product.preview_images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {product.preview_images.map((_, index) => (
              <button
                key={index}
                onClick={() => { setCurrentImageIndex(index); setImageLoading(true); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex
                    ? 'bg-white'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          <button
            onClick={() => onAddToCart(product)}
            className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full transition-colors transform hover:scale-110"
            title="Add to Cart"
          >
            <ShoppingCart size={20} />
          </button>
          
          <Link
            href={`/shop/${product._id}`}
            className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors transform hover:scale-110"
            title="View Details"
          >
            <Eye size={20} />
          </Link>
        </div>

        {/* Download Count */}
        <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-lg text-xs flex items-center space-x-1">
          <Download size={12} />
          <span>{product.downloads}</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-primary-400 font-medium uppercase tracking-wide">
            {product.category}
          </span>
          {product.tags && product.tags.length > 0 && (
            <div className="flex items-center space-x-1 text-white/60">
              <Tag size={12} />
              <span className="text-xs">{product.tags.length}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white text-lg leading-tight group-hover:text-primary-300 transition-colors">
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
          {product.description}
        </p>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full border border-white/20"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-xs text-white/60">+{product.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/20">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-primary-400">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-white/50 line-through">
                  {formatPrice(product.original_price)}
                </span>
                <span className="text-xs text-green-400 font-medium">
                  Hemat {formatPrice(discountAmount)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary-400">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 group/btn"
          >
            <ShoppingCart size={16} className="group-hover/btn:animate-bounce" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Product Card Skeleton for loading state
export function ProductCardSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-white/10"></div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-3 bg-white/10 rounded w-16"></div>
          <div className="h-3 bg-white/10 rounded w-8"></div>
        </div>
        <div className="h-5 bg-white/10 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-white/10 rounded"></div>
          <div className="h-3 bg-white/10 rounded w-5/6"></div>
        </div>
        <div className="flex space-x-1">
          <div className="h-5 bg-white/10 rounded w-12"></div>
          <div className="h-5 bg-white/10 rounded w-16"></div>
          <div className="h-5 bg-white/10 rounded w-10"></div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-white/10 rounded w-20"></div>
          <div className="h-8 bg-white/10 rounded w-24"></div>
        </div>
      </div>
    </div>
  )
}