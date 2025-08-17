'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Calendar, Tag, Star, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import ArtworkCard from '@/components/ArtworkCard'
import MasonryGrid from '@/components/MasonryGrid'

interface Artwork {
  _id: string
  title: string
  description: string
  images: string[]
  tags: string[]
  process_steps: string[]
  creative_process_images: {
    title: string
    description: string
    image_url: string
  }[]
  featured: boolean
  createdAt: string
}

interface ApiResponse {
  artwork: Artwork
  relatedArtworks: Artwork[]
}

export default function ArtworkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [relatedArtworks, setRelatedArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchArtwork(params.id as string)
    }
  }, [params.id])

  const fetchArtwork = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/artworks/${id}`)
      const data: ApiResponse = await response.json()

      if (response.ok) {
        setArtwork(data.artwork)
        setRelatedArtworks(data.relatedArtworks)
      } else {
        console.error('Failed to fetch artwork:', (data as any).error)
        router.push('/404')
      }
    } catch (error) {
      console.error('Error fetching artwork:', error)
      router.push('/404')
    } finally {
      setLoading(false)
    }
  }

  // Get all images (main images + creative process images)
  const allImages = useMemo(() => {
    if (!artwork) return []
    const mainImages = artwork.images || []
    const processImages = artwork.creative_process_images?.map(step => step.image_url) || []
    return [...mainImages, ...processImages]
  }, [artwork])

  const nextImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
      setImageLoading(true)
    }
  }

  const prevImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
      setImageLoading(true)
    }
  }

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index)
    setShowImageModal(true)
    setImageLoading(true)
  }

  const getCurrentImageInfo = () => {
    if (!artwork || currentImageIndex < 0) return null
    
    const mainImages = artwork.images || []
    if (currentImageIndex < mainImages.length) {
      return {
        url: mainImages[currentImageIndex],
        title: artwork.title,
        type: 'main'
      }
    } else {
      const processIndex = currentImageIndex - mainImages.length
      const processStep = artwork.creative_process_images?.[processIndex]
      return {
        url: processStep?.image_url || '',
        title: processStep?.title || artwork.title,
        type: 'process',
        description: processStep?.description
      }
    }
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

  if (!artwork) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Artwork Not Found</h1>
          <p className="text-dark-300 mb-8">The artwork you're looking for doesn't exist.</p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

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
            <span>Back to Gallery</span>
          </motion.button>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                {/* Main Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-800 group cursor-pointer"
                     onClick={() => openImageModal(currentImageIndex)}>
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
                    src={getCurrentImageInfo()?.url || '/placeholder-image.jpg'}
                    alt={getCurrentImageInfo()?.title || artwork.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    onLoad={() => {
                      if (imageLoading) {
                        setImageLoading(false)
                      }
                    }}
                  />
                  
                  {/* Featured Badge */}
                  {artwork.featured && (
                    <div className="absolute top-4 left-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Star size={14} fill="currentColor" />
                      <span>Featured</span>
                    </div>
                  )}

                  {/* Expand Icon */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={16} />
                  </div>

                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
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
                {allImages.length > 1 && (
                  <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                    {allImages.map((image, index) => {
                      const imageInfo = getCurrentImageInfo()
                      const isMainImage = index < (artwork.images?.length || 0)
                      return (
                        <button
                          key={index}
                          onClick={() => { setCurrentImageIndex(index); setImageLoading(true); }}
                          className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex
                              ? 'border-primary-500 ring-2 ring-primary-500/30'
                              : 'border-dark-600 hover:border-dark-500'
                          }`}
                          title={isMainImage ? `${artwork.title} ${index + 1}` : `Process Step ${index - (artwork.images?.length || 0) + 1}`}
                        >
                          <Image
                            src={image}
                            alt={isMainImage ? `${artwork.title} ${index + 1}` : `Process Step ${index - (artwork.images?.length || 0) + 1}`}
                            fill
                            className="object-cover"
                          />
                          {!isMainImage && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-6 flex items-end justify-center">
                              <span className="text-white text-xs font-medium pb-1">P</span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Artwork Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Title and Meta */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">{artwork.title}</h1>
                <div className="flex items-center space-x-4 text-dark-300">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>{new Date(artwork.createdAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                <p className="text-dark-200 leading-relaxed whitespace-pre-line">
                  {artwork.description}
                </p>
              </div>

              {/* Tags */}
              {artwork.tags.length > 0 && (
                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <Tag size={20} />
                    <span>Tags</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {artwork.tags.map((tag) => (
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

              {/* Creative Process */}
              {artwork.creative_process_images && artwork.creative_process_images.length > 0 && (
                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Creative Process</h3>
                  <div className="space-y-8">
                    {artwork.creative_process_images.map((processStep, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-dark-800/50 rounded-xl p-6 border border-dark-700"
                      >
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-2">{processStep.title}</h4>
                            <p className="text-dark-200 leading-relaxed">{processStep.description}</p>
                          </div>
                        </div>
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-dark-700 group cursor-pointer"
                             onClick={() => openImageModal((artwork.images?.length || 0) + index)}>
                          <Image
                            src={processStep.image_url}
                            alt={processStep.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <ExternalLink size={24} className="text-white" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy Process Steps (fallback) */}
              {(!artwork.creative_process_images || artwork.creative_process_images.length === 0) && artwork.process_steps.length > 0 && (
                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Creative Process</h3>
                  <div className="space-y-3">
                    {artwork.process_steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-dark-200 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Related Artworks */}
          {relatedArtworks.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-white mb-8">Related Artworks</h2>
              <MasonryGrid>
                {relatedArtworks.map((relatedArtwork, index) => (
                  <ArtworkCard
                    key={relatedArtwork._id}
                    artwork={relatedArtwork}
                    index={index}
                  />
                ))}
              </MasonryGrid>
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
                  src={getCurrentImageInfo()?.url || ''}
                  alt={getCurrentImageInfo()?.title || artwork.title}
                  fill
                  className="object-contain"
                  onLoad={() => {
                    if (imageLoading) {
                      setImageLoading(false)
                    }
                  }}
                />

                {/* Navigation in Modal */}
                {allImages.length > 1 && (
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

              {/* Image Info */}
              <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center text-white">
                {/* Image Counter */}
                {allImages.length > 1 && (
                  <div className="text-sm mb-2">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                )}
                
                {/* Image Title and Description */}
                {(() => {
                  const imageInfo = getCurrentImageInfo()
                  if (imageInfo?.type === 'process') {
                    return (
                      <div className="max-w-md">
                        <div className="text-lg font-semibold mb-1">{imageInfo.title}</div>
                        {imageInfo.description && (
                          <div className="text-sm text-gray-300">{imageInfo.description}</div>
                        )}
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}