'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  Plus,
  ArrowLeft,
  Settings,
  Monitor
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Image from 'next/image'

interface Background {
  _id: string
  name: string
  image_url: string
  is_active: boolean
  file_size?: number
  file_type?: string
  createdAt: string
  updatedAt: string
}

export default function BackgroundManagementPage() {
  const router = useRouter()
  const [backgrounds, setBackgrounds] = useState<Background[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [backgroundName, setBackgroundName] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuthentication()
  }, [])

  useEffect(() => {
    if (user) {
      fetchBackgrounds()
    }
  }, [user])

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.user && data.user.role === 'admin') {
          setUser(data.user)
        } else {
          router.push('/admin')
        }
      } else {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  const fetchBackgrounds = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/backgrounds', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.status === 401) {
        router.push('/admin')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch backgrounds')
      }
      
      const data = await response.json()
      setBackgrounds(data.backgrounds || [])
    } catch (error) {
      console.error('Error fetching backgrounds:', error)
      setError('Failed to load backgrounds')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setBackgroundName(file.name.split('.')[0])
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setError('')
  }

  const handleUpload = async () => {
    if (!selectedFile || !backgroundName.trim()) {
      setError('Please select a file and enter a name')
      return
    }

    try {
      setUploading(true)
      setError('')
      
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('name', backgroundName.trim())
      
      const response = await fetch('/api/backgrounds', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
      
      const data = await response.json()
      setSuccess('Background uploaded successfully!')
      setShowUploadModal(false)
      resetUploadForm()
      fetchBackgrounds()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const resetUploadForm = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setBackgroundName('')
    setError('')
  }

  const handleSetActive = async (id: string) => {
    try {
      const response = await fetch('/api/backgrounds', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ id, is_active: true })
      })
      
      if (!response.ok) {
        throw new Error('Failed to set active background')
      }
      
      setSuccess('Background set as active!')
      fetchBackgrounds()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error setting active background:', error)
      setError('Failed to set active background')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this background?')) {
      return
    }

    try {
      const response = await fetch(`/api/backgrounds?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete background')
      }
      
      setSuccess('Background deleted successfully!')
      fetchBackgrounds()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error deleting background:', error)
      setError('Failed to delete background')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header isAdmin onLogout={() => {
        localStorage.removeItem('adminToken')
        router.push('/admin')
      }} />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <Monitor size={20} />
                <span className="font-medium">Background Management</span>
              </div>
              
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus size={18} />
                <span>Upload Background</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200"
              >
                {error}
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Backgrounds Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-white/10 rounded-lg mb-4"></div>
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {backgrounds.map((background) => (
                <motion.div
                  key={background._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300"
                >
                  {/* Background Preview */}
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={background.image_url}
                      alt={background.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {background.is_active && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Check size={12} />
                        <span>Active</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Background Info */}
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-2 truncate">{background.name}</h3>
                    <p className="text-white/60 text-sm mb-4">
                      {background.file_type} • {background.file_size ? `${Math.round(background.file_size / 1024)} KB` : 'Unknown size'}
                    </p>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {!background.is_active && (
                        <button
                          onClick={() => handleSetActive(background._id)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm"
                        >
                          <Check size={14} />
                          <span>Set Active</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => window.open(background.image_url, '_blank')}
                        className="flex items-center justify-center p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(background._id)}
                        className="flex items-center justify-center p-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {backgrounds.length === 0 && !loading && (
            <div className="text-center py-12">
              <ImageIcon size={48} className="text-white/30 mx-auto mb-4" />
              <h3 className="text-white/60 text-lg mb-2">No backgrounds uploaded</h3>
              <p className="text-white/40 mb-6">Upload your first background to get started</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300"
              >
                Upload Background
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-white/10 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Upload Background</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* File Input */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Select Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Background Name</label>
                  <input
                    type="text"
                    value={backgroundName}
                    onChange={(e) => setBackgroundName(e.target.value)}
                    placeholder="Enter background name"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Preview</label>
                    <div className="aspect-video relative overflow-hidden rounded-lg border border-white/10">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="400px"
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || !backgroundName.trim() || uploading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Upload</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}