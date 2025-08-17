'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ShoppingCart, Download, Star, Tag, Calendar, Eye, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'

interface Product {
  _id: string
  title: string
  description: string
  price: number
  discount?: number
  category: string
  file_url: string
  watermark_url: string
  preview_images: string[]
  tags: string[]
  downloads: number
  active: boolean
  finalPrice: number
  createdAt: string
}

interface ApiResponse {
  product: Product
  relatedProducts: Product[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${id}`)
      const data: ApiResponse = await response.json()

      if (response.ok) {
        setProduct(data.product)
        setRelatedProducts(data.relatedProducts)
      } else {
        console.error('Failed to fetch product:', (data as any).error)
        router.push('/404')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      router.push('/404')
    } finally {
      setLoading(false)
    }
  }

  const nextImage = () => {
    if (product && product.preview_images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.preview_images.length)
      setImageLoading(true)
    }
  }

  const prevImage = () => {
    if (product && product.preview_images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.preview_images.length) % product.preview_images.length)
      setImageLoading(true)
    }
  }

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index)
    setShowImageModal(true)
    setImageLoading(true)
  }

  const addToCart = () => {
    if (product) {
      // In a real app, this would integrate with a cart context/state
      alert(`Added ${quantity} x ${product.title} to cart!`)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
        <Header />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-dark-700 rounded w-32 mb-8"></div>
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="aspect-square bg-dark-700 rounded-2xl"></div>
                <div className="space-y-6">
                  <div className="h-8 bg-dark-700 rounded w-3/4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-dark-700 rounded"></div>
                    <div className="h-4 bg-dark-700 rounded w-5/6"></div>
                    <div className="h-4 bg-dark-700 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Product Not Found</h1>
          <p className="text-dark-300 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/shop" className="btn-primary">
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  const hasDiscount = product.discount && product.discount > 0
  const discountPercentage = hasDiscount ? Math.round(((product.discount || 0) / product.price) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
      <Header />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-dark-300 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Shop</span>
          </motion.button>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                {/* Main Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-800 group cursor-pointer"
                     onClick={() => openImageModal(currentImageIndex)}>
                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                      -{discountPercentage}%
                    </div>
                  )}

                  {/* Download Count */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1 z-10">
                    <Download size={14} />
                    <span>{product.downloads}</span>
                  </div>

                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="loading-dots">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                  )}
                  
                  <Image
                    src={product.preview_images[currentImageIndex] || product.watermark_url || '/placeholder-product.jpg'}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    onLoad={() => setImageLoading(false)}
                  />

                  {/* Expand Icon */}
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={16} />
                  </div>

                  {/* Navigation Arrows */}
                  {product.preview_images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {product.preview_images.length > 1 && (
                  <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                    {product.preview_images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => { setCurrentImageIndex(index); setImageLoading(true); }}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex
                            ? 'border-primary-500 ring-2 ring-primary-500/30'
                            : 'border-dark-600 hover:border-dark-500'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Title and Meta */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-primary-400 font-medium uppercase tracking-wide">
                    {product.category}
                  </span>
                  <span className="text-dark-500">•</span>
                  <div className="flex items-center space-x-1 text-dark-400">
                    <Calendar size={14} />
                    <span className="text-sm">
                      {new Date(product.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-4">{product.title}</h1>
                
                {/* Price */}
                <div className="flex items-center space-x-4 mb-6">
                  {hasDiscount ? (
                    <>
                      <span className="text-3xl font-bold text-primary-400">
                        {formatPrice(product.finalPrice)}
                      </span>
                      <span className="text-xl text-dark-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                        Save {formatPrice(product.discount!)}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-primary-400">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                <p className="text-dark-200 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <Tag size={20} />
                    <span>Tags</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm border border-primary-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase Section */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Purchase</h3>
                
                {/* Quantity Selector */}
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-dark-300">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-dark-700 text-white rounded-lg flex items-center justify-center hover:bg-dark-600 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-white font-medium w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-dark-700 text-white rounded-lg flex items-center justify-center hover:bg-dark-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="flex items-center justify-between mb-6 p-4 bg-dark-700/50 rounded-lg">
                  <span className="text-lg font-semibold text-white">Total:</span>
                  <span className="text-2xl font-bold text-primary-400">
                    {formatPrice(product.finalPrice * quantity)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={addToCart}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </button>
                  
                  <Link
                    href="/shop"
                    className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Download Info */}
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Download size={16} className="text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-blue-300 text-sm font-medium">Digital Download</p>
                      <p className="text-blue-200 text-xs mt-1">
                        Download link akan dikirim ke email Anda setelah konfirmasi pembayaran
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-white mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct, index) => (
                  <ProductCard
                    key={relatedProduct._id}
                    product={relatedProduct}
                    index={index}
                    onAddToCart={() => alert(`Added ${relatedProduct.title} to cart!`)}
                  />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X size={32} />
              </button>

              {/* Modal Image */}
              <div className="relative aspect-square max-h-[80vh] rounded-lg overflow-hidden">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-dark-800">
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                )}
                <Image
                  src={product.preview_images[currentImageIndex] || product.watermark_url}
                  alt={product.title}
                  fill
                  className="object-contain"
                  onLoad={() => setImageLoading(false)}
                />

                {/* Navigation in Modal */}
                {product.preview_images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Image Counter */}
              {product.preview_images.length > 1 && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white text-sm">
                  {currentImageIndex + 1} / {product.preview_images.length}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}