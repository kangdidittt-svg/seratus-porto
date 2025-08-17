'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Star, Sparkles } from 'lucide-react'
import Header from '@/components/Header'
import ArtworkCard, { ArtworkCardSkeleton } from '@/components/ArtworkCard'
import MasonryGrid from '@/components/MasonryGrid'

interface Artwork {
  _id: string
  title: string
  description: string
  images: string[]
  tags: string[]
  featured: boolean
  createdAt: string
}

interface ApiResponse {
  artworks: Artwork[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    tags: string[]
  }
}

export default function HomePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [showFeatured, setShowFeatured] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Fetch artworks
  const fetchArtworks = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedTags.length > 0 && { tags: selectedTags.join(',') }),
        ...(showFeatured && { featured: 'true' })
      })

      const response = await fetch(`/api/artworks?${params}`)
      const data: ApiResponse = await response.json()

      if (response.ok) {
        if (reset || pageNum === 1) {
          setArtworks(data.artworks)
        } else {
          setArtworks(prev => [...prev, ...data.artworks])
        }
        
        setAvailableTags(data.filters.tags)
        setHasMore(pageNum < data.pagination.pages)
        setPage(pageNum)
      } else {
        console.error('Failed to fetch artworks:', (data as any).error)
      }
    } catch (error) {
      console.error('Error fetching artworks:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchArtworks(1, true)
  }, [searchTerm, selectedTags, showFeatured])

  // Load more
  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchArtworks(page + 1)
    }
  }

  // Handle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedTags([])
    setShowFeatured(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="gradient-text">Creative Portfolio</span>
              <br />
              <span className="text-white">Seratus Studio</span>
            </h1>
            
            <p className="text-xl text-dark-300 mb-8 max-w-3xl mx-auto">
              Jelajahi koleksi karya kreatif kami yang menginspirasi. Dari desain grafis hingga ilustrasi digital, 
              temukan keindahan dalam setiap detail.
            </p>

            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-20 h-20 bg-primary-500/10 rounded-full floating-animation" />
              <div className="absolute top-40 right-20 w-16 h-16 bg-primary-400/10 rounded-full floating-animation" style={{ animationDelay: '2s' }} />
              <div className="absolute bottom-40 left-20 w-12 h-12 bg-primary-600/10 rounded-full floating-animation" style={{ animationDelay: '4s' }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-effect rounded-2xl p-6"
          >
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" size={20} />
              <input
                type="text"
                placeholder="Cari karya seni..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filter Options */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Filter size={18} className="text-dark-400" />
                <span className="text-dark-300 font-medium">Filter:</span>
              </div>
              
              <button
                onClick={() => setShowFeatured(!showFeatured)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  showFeatured
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                }`}
              >
                <Star size={16} />
                <span>Featured</span>
              </button>

              {selectedTags.length > 0 || searchTerm || showFeatured ? (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>

            {/* Tags */}
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                      selectedTags.includes(tag)
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Artworks Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <MasonryGrid>
              {Array.from({ length: 12 }).map((_, index) => (
                <ArtworkCardSkeleton key={index} />
              ))}
            </MasonryGrid>
          ) : artworks.length > 0 ? (
            <>
              <MasonryGrid>
                {artworks.map((artwork, index) => (
                  <ArtworkCard
                    key={artwork._id}
                    artwork={artwork}
                    index={index}
                  />
                ))}
              </MasonryGrid>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <div className="flex items-center space-x-2">
                        <div className="loading-dots">
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                        </div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Sparkles size={18} />
                        <span>Load More Artworks</span>
                      </div>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-dark-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">No Artworks Found</h3>
              <p className="text-dark-300 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}