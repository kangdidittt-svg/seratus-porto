'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  Save, 
  Eye,
  Image as ImageIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CreativeProcessStep {
  title: string
  description: string
  image_url: string
}

interface ArtworkForm {
  title: string
  description: string
  images: string[]
  tags: string[]
  process_steps: string[]
  creative_process_images: CreativeProcessStep[]
  featured: boolean
}

export default function CreateArtworkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newStep, setNewStep] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [processStepTitle, setProcessStepTitle] = useState('')
  const [processStepDescription, setProcessStepDescription] = useState('')
  const [processStepImageUrl, setProcessStepImageUrl] = useState('')
  
  const [formData, setFormData] = useState<ArtworkForm>({
    title: '',
    description: '',
    images: [],
    tags: [],
    process_steps: [],
    creative_process_images: [],
    featured: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Artwork created successfully!')
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 2000)
      } else {
        setError(data.error || 'Failed to create artwork')
      }
    } catch (error) {
      console.error('Create artwork error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addImage = () => {
    if (imageUrl.trim() && !formData.images.includes(imageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }))
      setImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
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

  const addStep = () => {
    if (newStep.trim()) {
      setFormData(prev => ({
        ...prev,
        process_steps: [...prev.process_steps, newStep.trim()]
      }))
      setNewStep('')
    }
  }

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      process_steps: prev.process_steps.filter((_, i) => i !== index)
    }))
  }

  const addCreativeProcessStep = () => {
    if (processStepTitle.trim() && processStepImageUrl.trim()) {
      const newProcessStep: CreativeProcessStep = {
        title: processStepTitle.trim(),
        description: processStepDescription.trim(),
        image_url: processStepImageUrl.trim()
      }
      setFormData(prev => ({
        ...prev,
        creative_process_images: [...prev.creative_process_images, newProcessStep]
      }))
      setProcessStepTitle('')
      setProcessStepDescription('')
      setProcessStepImageUrl('')
    }
  }

  const removeCreativeProcessStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      creative_process_images: prev.creative_process_images.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-dark-400 hover:text-white transition-colors mr-6"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-white">Create New Artwork</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-dark-600 pb-2">
                Basic Information
              </h2>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter artwork title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Describe your artwork"
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
                <label htmlFor="featured" className="text-dark-300">
                  Mark as Featured
                </label>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-dark-600 pb-2">
                Images
              </h2>
              
              {/* Add Image */}
              <div className="flex space-x-3">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter image URL"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors"
                >
                  <Plus size={18} />
                  <span>Add</span>
                </button>
              </div>

              {/* Image List */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-dark-800 rounded-lg overflow-hidden">
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
              <h2 className="text-lg font-semibold text-white border-b border-dark-600 pb-2">
                Tags
              </h2>
              
              {/* Add Tag */}
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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

            {/* Process Steps */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-dark-600 pb-2">
                Process Steps (Text Only)
              </h2>
              
              {/* Add Step */}
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStep())}
                  className="flex-1 px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter process step"
                />
                <button
                  type="button"
                  onClick={addStep}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors"
                >
                  <Plus size={18} />
                  <span>Add</span>
                </button>
              </div>

              {/* Steps List */}
              {formData.process_steps.length > 0 && (
                <div className="space-y-3">
                  {formData.process_steps.map((step, index) => (
                    <div
                      key={index}
                      className="bg-dark-800 p-4 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="bg-primary-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-white">{step}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Creative Process Images */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-dark-600 pb-2">
                Creative Process Images (Behance Style)
              </h2>
              
              {/* Add Creative Process Step */}
              <div className="space-y-4 bg-dark-800/50 p-6 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Step Title *
                    </label>
                    <input
                      type="text"
                      value={processStepTitle}
                      onChange={(e) => setProcessStepTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Initial Sketch, Color Exploration"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Image URL *
                    </label>
                    <input
                      type="url"
                      value={processStepImageUrl}
                      onChange={(e) => setProcessStepImageUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter image URL"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={processStepDescription}
                    onChange={(e) => setProcessStepDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Describe this step of your creative process"
                  />
                </div>
                <button
                  type="button"
                  onClick={addCreativeProcessStep}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors"
                >
                  <ImageIcon size={18} />
                  <span>Add Process Step</span>
                </button>
              </div>

              {/* Creative Process Steps List */}
              {formData.creative_process_images.length > 0 && (
                <div className="space-y-4">
                  {formData.creative_process_images.map((step, index) => (
                    <div
                      key={index}
                      className="bg-dark-800 p-6 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="bg-primary-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="text-white font-medium">{step.title}</h3>
                            {step.description && (
                              <p className="text-dark-300 text-sm mt-1">{step.description}</p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCreativeProcessStep(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="aspect-video bg-dark-700 rounded-lg overflow-hidden">
                        <img
                          src={step.image_url}
                          alt={step.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder-image.jpg'
                          }}
                        />
                      </div>
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
            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-dark-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Create Artwork</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}