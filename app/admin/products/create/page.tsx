'use client'

import { useState } from 'react'
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  Save, 
  Eye,
  Package,
  Link
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProductForm {
  title: string
  description: string
  price: number
  original_price: number
  category: string
  file_url: string
  watermark_url: string
  preview_images: string[]
  active: boolean
}

const categories = [
  'Digital Art',
  'Illustrations',
  'Templates',
  'Mockups',
  'Icons',
  'Fonts',
  'Textures',
  'Brushes',
  'Other'
]

export default function CreateProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [fileUpload, setFileUpload] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const [fileInputType, setFileInputType] = useState<'upload' | 'url'>('upload')
  const [fileUrl, setFileUrl] = useState('')
  
  const [formData, setFormData] = useState<ProductForm>({
    title: '',
    description: '',
    price: 0,
    original_price: 0,
    category: '',
    file_url: '',
    watermark_url: '',
    preview_images: [],
    active: true
  })

  // Calculate discount percentage and amount
  const discountAmount = formData.original_price - formData.price
  const discountPercentage = formData.original_price > 0 ? Math.round((discountAmount / formData.original_price) * 100) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Prepare data with proper price handling
      const submitData = {
        ...formData,
        price: formData.price > 0 ? formData.price : undefined
      }
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Product created successfully!')
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 2000)
      } else {
        setError(data.error || 'Failed to create product')
      }
    } catch (error) {
      console.error('Create product error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async () => {
    if (!imageFile) return

    setUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', imageFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setFormData(prev => ({
          ...prev,
          preview_images: [...prev.preview_images, data.url]
        }))
        setImageFile(null)
        // Reset file input
        const fileInput = document.getElementById('image-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setError(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileUpload = async () => {
    if (!fileUpload) return

    setUploadingFile(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', fileUpload)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setFormData(prev => ({
          ...prev,
          file_url: data.url
        }))
        setFileUpload(null)
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setError(data.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload file')
    } finally {
      setUploadingFile(false)
    }
  }



  const addImage = () => {
    if (imageUrl.trim() && !formData.preview_images.includes(imageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        preview_images: [...prev.preview_images, imageUrl.trim()]
      }))
      setImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      preview_images: prev.preview_images.filter((_, i) => i !== index)
    }))
  }



  const finalPrice = formData.price

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{backgroundImage: 'url(/bg-web.jpg)'}}>
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors mr-6"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-white">Create New Product</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                Basic Information
              </h2>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter product title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Describe your product"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-5 h-5 text-primary-500 bg-white/10 border-white/20 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label htmlFor="active" className="text-white/70">
                  Active (Available for purchase)
                </label>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                Pricing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Price */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Original Price (Rp) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 text-sm">Rp</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.original_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Sale Price */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Sale Price (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 text-sm">Rp</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Leave empty for no discount"
                    />
                  </div>
                  <p className="text-white/50 text-xs mt-1">
                    Optional: Leave empty if no discount is applied
                  </p>
                </div>
              </div>

              {/* Price Preview */}
              {formData.original_price > 0 && (
                <div className="bg-white/10 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Price Preview:</span>
                    <div className="flex items-center space-x-2">
                      {formData.price > 0 && discountAmount > 0 && (
                        <span className="text-white/50 line-through">Rp {formData.original_price.toLocaleString('id-ID')}</span>
                      )}
                      <span className="text-primary-400 font-bold text-lg">
                        Rp {(formData.price > 0 ? formData.price : formData.original_price).toLocaleString('id-ID')}
                      </span>
                      {formData.price > 0 && discountPercentage > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          -{discountPercentage}%
                        </span>
                      )}
                    </div>
                  </div>
                  {discountAmount > 0 && (
                    <div className="text-center">
                      <span className="text-green-400 font-medium">Hemat Rp {discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Files */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                Files
              </h2>
              
              {/* File Input Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Download File *
                </label>
                <div className="flex space-x-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setFileInputType('upload')}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                      fileInputType === 'upload'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Upload size={16} />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFileInputType('url')}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                      fileInputType === 'url'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Link size={16} />
                    <span>Use URL</span>
                  </button>
                </div>

                {fileInputType === 'upload' ? (
                  <div className="flex items-center space-x-4">
                    <input
                      id="file-upload"
                      type="file"
                      onChange={(e) => setFileUpload(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white/70 cursor-pointer hover:bg-white/20 transition-all duration-200 flex items-center space-x-2"
                    >
                      <Package size={18} />
                      <span>{fileUpload ? fileUpload.name : 'Choose file to upload'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleFileUpload}
                      disabled={!fileUpload || uploadingFile}
                      className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors"
                    >
                      {uploadingFile ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Upload size={18} />
                      )}
                      <span>{uploadingFile ? 'Uploading...' : 'Upload'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <input
                      type="url"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://example.com/file.zip"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (fileUrl.trim()) {
                          setFormData(prev => ({ ...prev, file_url: fileUrl.trim() }))
                          setFileUrl('')
                        }
                      }}
                      disabled={!fileUrl.trim()}
                      className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors"
                    >
                      <Link size={18} />
                      <span>Set URL</span>
                    </button>
                  </div>
                )}
                
                {formData.file_url && (
                  <p className="text-green-400 text-sm mt-2">
                    ✓ File set: {formData.file_url.includes('http') ? 'External URL' : formData.file_url.split('/').pop()}
                  </p>
                )}
                <p className="text-white/50 text-xs mt-1">
                  {fileInputType === 'upload' 
                    ? 'Upload file to server (uses storage)' 
                    : 'Use external URL (saves server storage)'}
                </p>
              </div>


            </div>

            {/* Preview Images */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                Preview Images
              </h2>
              
              {/* Add Image */}
              <div className="flex items-center space-x-4">
                <input
                  id="preview-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="preview-image-upload"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white/70 cursor-pointer hover:bg-white/20 transition-all duration-200 flex items-center space-x-2"
                >
                  <Upload size={18} />
                  <span>{imageFile ? imageFile.name : 'Choose preview image'}</span>
                </label>
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={!imageFile || uploadingImage}
                  className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors"
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Plus size={18} />
                  )}
                  <span>{uploadingImage ? 'Uploading...' : 'Add'}</span>
                </button>
              </div>

              {/* Image List */}
              {formData.preview_images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.preview_images.map((image, index) => (
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
              )}
            </div>



            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Create Product</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}