'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Edit,
  Trash2,
  Star,
  Calendar,
  Image as ImageIcon
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'

interface Artwork {
  _id: string
  title: string
  description: string
  images: string[]
  featured: boolean
  createdAt: string
  updatedAt: string
}

export default function ViewArtworkPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [artwork, setArtwork] = useState<Artwork | null>(null)

  // Fetch artwork data
  useEffect(() => {
    if (params.id) {
      fetchArtwork(params.id as string)
    }
  }, [params.id])

  const fetchArtwork = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/artworks/${id}`, {
        credentials: 'include'
      })
      const data = await response.json()

      if (response.ok) {
        setArtwork(data.artwork)
      } else {
        setError('Gagal memuat data artwork')
      }
    } catch (error) {
      console.error('Fetch artwork error:', error)
      setError('Network error. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!artwork || !confirm('Apakah Anda yakin ingin menghapus artwork ini?')) return

    setDeleting(true)
    setError('')
    
    try {
      const response = await fetch('/api/artworks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: artwork._id }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Artwork berhasil dihapus!')
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 2000)
      } else {
        setError(data.error || 'Gagal menghapus artwork')
      }
    } catch (error) {
      console.error('Delete artwork error:', error)
      setError('Network error. Silakan coba lagi.')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-white/70">Memuat data artwork...</p>
        </div>
      </div>
    )
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70 mb-4">Artwork tidak ditemukan</p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Detail Artwork</h1>
              <p className="text-white/60">Lihat informasi lengkap artwork</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(`/admin/artworks/edit/${artwork._id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Edit size={18} />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  <span>Hapus</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <ImageIcon className="text-primary-500" size={24} />
                <h2 className="text-xl font-semibold text-white">
                  Gambar Artwork ({artwork.images.length})
                </h2>
              </div>
              
              {artwork.images.length > 0 ? (
                <div className="space-y-6">
                  {/* Main Image */}
                  <div className="aspect-video bg-white/10 rounded-xl overflow-hidden">
                    <img
                      src={artwork.images[0]}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-image.jpg'
                      }}
                    />
                  </div>
                  
                  {/* Additional Images */}
                  {artwork.images.length > 1 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {artwork.images.slice(1).map((image, index) => (
                        <div key={index + 1} className="aspect-video bg-white/10 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${artwork.title} - ${index + 2}`}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                            onClick={() => {
                              // Simple image viewer - replace main image
                              const mainImg = document.querySelector('.aspect-video img') as HTMLImageElement
                              if (mainImg) mainImg.src = image
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/placeholder-image.jpg'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-white/50">
                  <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Tidak ada gambar</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Informasi Artwork</h2>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-1">
                    Judul
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="text-white font-medium">{artwork.title}</p>
                    {artwork.featured && (
                      <div className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">
                        <Star size={12} fill="currentColor" />
                        <span>Featured</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-1">
                    Deskripsi
                  </label>
                  <p className="text-white/80 leading-relaxed">{artwork.description}</p>
                </div>

                {/* Dates */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar size={16} className="text-white/50" />
                    <span className="text-white/50">Dibuat:</span>
                    <span className="text-white/80">{formatDate(artwork.createdAt)}</span>
                  </div>
                  
                  {artwork.updatedAt !== artwork.createdAt && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar size={16} className="text-white/50" />
                      <span className="text-white/50">Diperbarui:</span>
                      <span className="text-white/80">{formatDate(artwork.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Statistik</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-primary-500 mb-1">
                    {artwork.images.length}
                  </div>
                  <div className="text-sm text-white/60">Gambar</div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-primary-500 mb-1">
                    {artwork.featured ? 'Ya' : 'Tidak'}
                  </div>
                  <div className="text-sm text-white/60">Featured</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}