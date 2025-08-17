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
  discount: number
  category: string
  file_url: string
  watermark_url: string
  preview_images: string[]
  tags: string[]
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
  const [newTag, setNewTag] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [fileUpload, setFileUpload] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [watermarkUpload, setWatermarkUpload] = useState<File | null>(null)
  const [uploadingWatermark, setUploadingWatermark] = useState(false)
  
  const [formData, setFormData] = useState<ProductForm>({
    title: '',
    description: '',
    price: 0,
    discount: 0,
    category: '',
    file_url: '',
    watermark_url: '',
    preview_images: [],
    tags: [],
    active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
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

  const handleWatermarkUpload = async () => {
    if (!watermarkUpload) return

    setUploadingWatermark(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', watermarkUpload)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setFormData(prev => ({
          ...prev,
          watermark_url: data.url
        }))
        setWatermarkUpload(null)
        // Reset file input
        const fileInput = document.getElementById('watermark-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setError(data.error || 'Failed to upload watermark')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload watermark')
    } finally {
      setUploadingWatermark(false)
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

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const finalPrice = formData.price - (formData.price * formData.discount / 100)

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
        >
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
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Price (Rp) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 text-sm">Rp</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Price Preview */}
              {formData.price > 0 && (
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Final Price:</span>
                    <div className="flex items-center space-x-2">
                      {formData.discount > 0 && (
                        <span className="text-white/50 line-through">Rp {formData.price.toLocaleString('id-ID')}</span>
                      )}
                      <span className="text-primary-400 font-bold text-lg">Rp {finalPrice.toLocaleString('id-ID')}</span>
                      {formData.discount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          -{formData.discount}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Files */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                Files
              </h2>
              
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Download File *
                </label>
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
                {formData.file_url && (
                  <p className="text-green-400 text-sm mt-2">
                    ✓ File uploaded: {formData.file_url.split('/').pop()}
                  </p>
                )}
                <p className="text-white/50 text-xs mt-1">
                  This file will be provided to customers after purchase
                </p>
              </div>

              {/* Watermark Upload */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Watermark Preview Image
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    id="watermark-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setWatermarkUpload(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label
                    htmlFor="watermark-upload"
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white/70 cursor-pointer hover:bg-white/20 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Upload size={18} />
                    <span>{watermarkUpload ? watermarkUpload.name : 'Choose watermark image'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleWatermarkUpload}
                    disabled={!watermarkUpload || uploadingWatermark}
                    className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors"
                  >
                    {uploadingWatermark ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Upload size={18} />
                    )}
                    <span>{uploadingWatermark ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>
                {formData.watermark_url && (
                  <p className="text-green-400 text-sm mt-2">
                    ✓ Watermark uploaded: {formData.watermark_url.split('/').pop()}
                  </p>
                )}
                <p className="text-white/50 text-xs mt-1">
                  Optional: Watermarked version for preview
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

            {/* Tags */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                Tags
              </h2>
              
              {/* Add Tag */}
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors"
                >
                  <Plus size={18} />
                  <span>Add</span>
                </button>
              </div>

              {/* Tag List */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-primary-300 hover:text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
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