'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Save,
  Image as ImageIcon
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'

interface ArtworkForm {
  title: string
  description: string
  images: string[]
  featured: boolean
}

export default function EditArtworkPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState<ArtworkForm>({
    title: '',
    description: '',
    images: [],
    featured: false
  })

  // Fetch artwork data
  useEffect(() => {
    if (params.id) {
      fetchArtwork(params.id as string)
    }
  }, [params.id])

  const fetchArtwork = async (id: string) => {
    try {
      setFetchLoading(true)
      const response = await fetch(`/api/artworks/${id}`, {
        credentials: 'include'
      })
      const data = await response.json()

      if (response.ok) {
        setFormData({
          title: data.artwork.title,
          description: data.artwork.description,
          images: data.artwork.images,
          featured: data.artwork.featured
        })
      } else {
        setError('Gagal memuat data artwork')
      }
    } catch (error) {
      console.error('Fetch artwork error:', error)
      setError('Network error. Silakan coba lagi.')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/artworks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: params.id,
          ...formData
        }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Artwork berhasil diperbarui!')
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 2000)
      } else {
        setError(data.error || 'Gagal memperbarui artwork')
      }
    } catch (error) {
      console.error('Update artwork error:', error)
      setError('Network error. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
  }

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setError('')
    
    try {
      const uploadedUrls: string[] = []
      
      for (const file of selectedFiles) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload
        })

        const data = await response.json()

        if (response.ok && data.success) {
          uploadedUrls.push(data.url)
        } else {
          throw new Error(data.error || `Gagal upload ${file.name}`)
        }
      }
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))
      
      setSelectedFiles([])
      // Reset file input
      const fileInput = document.getElementById('image-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      setSuccess(`Berhasil upload ${uploadedUrls.length} gambar!`)
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Gagal upload gambar')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-white/70">Memuat data artwork...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-6">
      <div className="max-w-4xl mx-auto">
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
              <h1 className="text-2xl font-bold text-white">Edit Artwork</h1>
              <p className="text-white/60">Perbarui informasi artwork Anda</p>
            </div>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            {/* Basic Info */}
            <div className="space-y-6 mb-8">
              <h2 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                Informasi Dasar
              </h2>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Judul Artwork *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Masukkan judul artwork"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Deskripsi *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Deskripsikan artwork Anda"
                />
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-5 h-5 text-primary-500 bg-dark-800 border-dark-600 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label htmlFor="featured" className="text-white/70">
                  Tandai sebagai Featured
                </label>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                Gambar Artwork
              </h2>
              
              {/* Upload Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ImageIcon className="text-blue-400 mt-1" size={20} />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">Tips Upload Gambar:</p>
                    <ul className="space-y-1 text-blue-300/80">
                      <li>• Ukuran ideal: 1920x1080px atau lebih tinggi</li>
                      <li>• Format: JPG, PNG, WebP</li>
                      <li>• Ukuran file maksimal: 10MB per gambar</li>
                      <li>• Anda dapat upload beberapa gambar sekaligus</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Upload Section */}
              <div className="space-y-4">
                <div className="flex flex-col space-y-4">
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="w-full px-4 py-6 bg-white/10 border-2 border-dashed border-white/20 rounded-xl text-white/70 cursor-pointer hover:bg-white/20 hover:border-white/30 transition-all duration-200 flex flex-col items-center space-y-2"
                  >
                    <Upload size={32} />
                    <div className="text-center">
                      <p className="font-medium">
                        {selectedFiles.length > 0 
                          ? `${selectedFiles.length} file dipilih` 
                          : 'Klik untuk pilih gambar atau drag & drop'
                        }
                      </p>
                      <p className="text-sm text-white/50">Mendukung multiple file</p>
                    </div>
                  </label>
                  
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-white/70">File yang dipilih:</p>
                      <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="text-sm text-white/60 bg-white/5 px-3 py-2 rounded-lg">
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleUploadImages}
                        disabled={uploading}
                        className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Mengupload...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={18} />
                            <span>Upload {selectedFiles.length} Gambar</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-white/70">
                    Gambar Terupload ({formData.images.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-white/10 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/placeholder-image.jpg'
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-white/20">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || formData.images.length === 0}
                className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl flex items-center space-x-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Perbarui Artwork</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}