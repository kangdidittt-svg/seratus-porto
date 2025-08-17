'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
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
}

export default function HomePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
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
        limit: '12'
      })

      const response = await fetch(`/api/artworks?${params}`)
      const data: ApiResponse = await response.json()

      if (response.ok) {
        if (reset || pageNum === 1) {
          setArtworks(data.artworks)
        } else {
          setArtworks(prev => [...prev, ...data.artworks])
        }
        
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
  }, [])

  // Load more
  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchArtworks(page + 1)
    }
  }

  // Scroll to artworks section
  const scrollToArtworks = () => {
    const artworksSection = document.getElementById('artworks-section')
    if (artworksSection) {
      artworksSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Seratus Studio
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={scrollToArtworks}
                className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 transform hover:scale-105"
              >
                Jelajahi Karya
              </button>
              <a 
                href="/about"
                className="px-8 py-3 bg-transparent text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/30 transform hover:scale-105 inline-block text-center"
              >
                Tentang Kami
              </a>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Artworks Grid */}
      <section id="artworks-section" className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              Artwork
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
          {loading ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse rounded-2xl" />
              <MasonryGrid>
                {Array.from({ length: 12 }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ArtworkCardSkeleton />
                  </motion.div>
                ))}
              </MasonryGrid>
            </div>
          ) : artworks.length > 0 ? (
            <>
              <div className="relative">
                <MasonryGrid>
                  {artworks.map((artwork, index) => (
                    <motion.div
                      key={artwork._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <ArtworkCard
                        artwork={artwork}
                        index={index}
                      />
                    </motion.div>
                  ))}
                </MasonryGrid>
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Memuat...
                      </div>
                    ) : (
                      'Muat Lebih Banyak'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <div className="glass-effect-purple rounded-3xl p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Belum Ada Karya</h3>
                <p className="text-white/70 leading-relaxed">Kami sedang mempersiapkan koleksi karya terbaru. Kembali lagi nanti untuk melihat kreasi menakjubkan kami.</p>
              </div>
            </motion.div>
          )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}