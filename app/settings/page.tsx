'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Palette, Monitor, Smartphone, Save, RotateCcw, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface BackgroundOption {
  id: string
  name: string
  preview: string
  url: string
  type: 'image' | 'gradient'
}

const backgroundOptions: BackgroundOption[] = [
  {
    id: 'default',
    name: 'Default Background',
    preview: '/bg-web-fix.svg',
    url: '/bg-web-fix.svg',
    type: 'image'
  },
  {
    id: 'abstract-1',
    name: 'Abstract Blue',
    preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop',
    type: 'image'
  },
  {
    id: 'abstract-2',
    name: 'Purple Waves',
    preview: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&h=600&fit=crop',
    url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920&h=1080&fit=crop',
    type: 'image'
  },
  {
    id: 'gradient-1',
    name: 'Blue Gradient',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    url: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'gradient'
  },
  {
    id: 'gradient-2',
    name: 'Purple Gradient',
    preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    url: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    type: 'gradient'
  },
  {
    id: 'gradient-3',
    name: 'Dark Gradient',
    preview: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    url: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    type: 'gradient'
  },
  {
    id: 'minimal-1',
    name: 'Minimal Dots',
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&h=1080&fit=crop',
    type: 'image'
  },
  {
    id: 'geometric-1',
    name: 'Geometric Pattern',
    preview: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=600&fit=crop',
    url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&h=1080&fit=crop',
    type: 'image'
  }
]

export default function SettingsPage() {
  const router = useRouter()
  const [selectedBackground, setSelectedBackground] = useState<string>('default')
  const [previewBackground, setPreviewBackground] = useState<string>('default')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [customImageFile, setCustomImageFile] = useState<File | null>(null)
  const [uploadingCustomImage, setUploadingCustomImage] = useState(false)
  const [customImageUrl, setCustomImageUrl] = useState('')
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false)
  const [currentProfileImage, setCurrentProfileImage] = useState('/api/placeholder/400/600')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [currentLogo, setCurrentLogo] = useState('')
  const [hasCustomLogo, setHasCustomLogo] = useState(false)

  // Load saved background preference and profile image
  useEffect(() => {
    const savedBackground = localStorage.getItem('portfolio-background') || 'default'
    setSelectedBackground(savedBackground)
    setPreviewBackground(savedBackground)
    applyBackground(savedBackground)
    
    // Load current profile image
    loadCurrentProfileImage()
    
    // Load current logo
    loadCurrentLogo()
  }, [])

  const loadCurrentProfileImage = async () => {
    try {
      const response = await fetch('/api/settings/profile-image')
      if (response.ok) {
        const data = await response.json()
        setCurrentProfileImage(data.profileImage)
      }
    } catch (error) {
      console.log('Using default profile image')
    }
  }

  const loadCurrentLogo = async () => {
    try {
      const response = await fetch('/api/settings/logo')
      if (response.ok) {
        const data = await response.json()
        setCurrentLogo(data.logoUrl)
        setHasCustomLogo(data.hasCustomLogo)
      }
    } catch (error) {
      console.log('Using default logo')
    }
  }

  const applyBackground = (backgroundId: string) => {
    const body = document.body
    
    // Handle custom backgrounds
    if (backgroundId === 'custom-uploaded' || backgroundId === 'custom-url') {
      const customUrl = localStorage.getItem('custom-background-url')
      if (customUrl) {
        body.style.background = `url('${customUrl}') center/cover fixed`
        return
      }
    }
    
    // Handle predefined backgrounds
    const option = backgroundOptions.find(opt => opt.id === backgroundId)
    if (!option) return

    if (option.type === 'gradient') {
      body.style.background = option.url
      body.style.backgroundAttachment = 'fixed'
    } else {
      body.style.background = `url('${option.url}') center/cover fixed`
    }
  }

  const handleReset = () => {
    const defaultBg = 'default'
    setPreviewBackground(defaultBg)
    applyBackground(defaultBg)
    localStorage.setItem('portfolio-background', defaultBg)
    localStorage.removeItem('custom-background-url')
    setSaveMessage('Settings reset to default!')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleCustomImageUpload = async () => {
    if (!customImageFile) return

    setUploadingCustomImage(true)
    try {
      const formData = new FormData()
      formData.append('file', customImageFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      const uploadedUrl = data.url
      
      // Apply the uploaded image as background
      const body = document.body
      body.style.background = `url('${uploadedUrl}') center/cover fixed`
      
      // Save to localStorage with a custom ID
      const customBgId = 'custom-uploaded'
      localStorage.setItem('portfolio-background', customBgId)
      localStorage.setItem('custom-background-url', uploadedUrl)
      
      setSelectedBackground(customBgId)
      setPreviewBackground(customBgId)
      setCustomImageFile(null)
      setSaveMessage('Custom background uploaded and applied successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Upload error:', error)
      setSaveMessage('Failed to upload image. Please try again.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setUploadingCustomImage(false)
    }
  }

  const handleCustomUrlApply = () => {
    if (!customImageUrl.trim()) return
    
    // Apply the URL image as background
    const body = document.body
    body.style.background = `url('${customImageUrl}') center/cover fixed`
    
    // Save to localStorage with a custom ID
    const customBgId = 'custom-url'
    localStorage.setItem('portfolio-background', customBgId)
    localStorage.setItem('custom-background-url', customImageUrl)
    
    setSelectedBackground(customBgId)
    setPreviewBackground(customBgId)
    setCustomImageUrl('')
    setSaveMessage('Custom background applied successfully!')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleProfileImageUpload = async () => {
    if (!profileImageFile) return

    setUploadingProfileImage(true)
    try {
      const formData = new FormData()
      formData.append('file', profileImageFile)

      const response = await fetch('/api/settings/profile-image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setCurrentProfileImage(data.profileImage)
      setProfileImageFile(null)
      
      setSaveMessage('Profile image updated successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error uploading profile image:', error)
      setSaveMessage('Failed to upload profile image. Please try again.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setUploadingProfileImage(false)
    }
  }

  const handleLogoUpload = async () => {
    if (!logoFile) return

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', logoFile)

      const response = await fetch('/api/settings/logo', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentLogo(data.logoUrl)
        setHasCustomLogo(true)
        setLogoFile(null)
        setSaveMessage('Logo updated successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
        
        // Reload the page to update header logo
        window.location.reload()
      } else {
        setSaveMessage('Failed to upload logo')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      setSaveMessage('Error uploading logo')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleLogoReset = async () => {
    try {
      const response = await fetch('/api/settings/logo', {
        method: 'DELETE'
      })

      if (response.ok) {
        setCurrentLogo('')
        setHasCustomLogo(false)
        setSaveMessage('Logo reset to default!')
        setTimeout(() => setSaveMessage(''), 3000)
        
        // Reload the page to update header logo
        window.location.reload()
      } else {
        setSaveMessage('Failed to reset logo')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      setSaveMessage('Error resetting logo')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }



  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-20" />
      
      <Header />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-all duration-300 group bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back</span>
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-white/60">Customize your portfolio appearance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/20 rounded-lg transition-all duration-300"
              >
                <RotateCcw size={18} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-6 p-4 rounded-lg border ${
              saveMessage.includes('successfully') 
                ? 'bg-green-500/20 border-green-500/30 text-green-300'
                : 'bg-red-500/20 border-red-500/30 text-red-300'
            }`}>
              {saveMessage}
            </div>
          )}

          {/* Background Settings */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <Palette className="text-primary-400" size={24} />
              <h2 className="text-xl font-semibold text-white">Background Settings</h2>
            </div>
            
            <p className="text-white/60 mb-8">
              Choose a background that reflects your style. Changes will be applied immediately for preview.
            </p>

            {/* Reset Background Button */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setPreviewBackground('default')
                  applyBackground('default')
                  localStorage.setItem('portfolio-background', 'default')
                  localStorage.removeItem('custom-background-url')
                  setSaveMessage('Background reset to default!')
                  setTimeout(() => setSaveMessage(''), 3000)
                }}
                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <RotateCcw size={20} />
                <span>Reset Background to Default</span>
              </button>
            </div>

            {/* Custom Background Upload */}
            <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-medium mb-3">Custom Background</h3>
              <p className="text-white/60 text-sm mb-4">
                Want to use your own background? Upload an image or provide a URL.
              </p>
              
              {/* File Upload Section */}
              <div className="mb-4">
                <label className="block text-white/70 text-sm mb-2">Upload Image File</label>
                <div className="flex items-center space-x-3">
                  <input
                    id="custom-bg-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCustomImageFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label
                    htmlFor="custom-bg-upload"
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/70 cursor-pointer hover:bg-white/20 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Upload size={18} />
                    <span>{customImageFile ? customImageFile.name : 'Choose background image'}</span>
                  </label>
                  <button
                    onClick={handleCustomImageUpload}
                    disabled={!customImageFile || uploadingCustomImage}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {uploadingCustomImage ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Upload size={16} />
                    )}
                    <span>{uploadingCustomImage ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>
              </div>
              
              {/* URL Input Section */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Or Enter Image URL</label>
                <div className="flex space-x-3">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Enter image URL..."
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleCustomUrlApply}
                    disabled={!customImageUrl.trim()}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-300 font-medium mb-2">Tips:</h4>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• Backgrounds are applied with 20% opacity for better readability</li>
                <li>• Changes are saved locally and will persist across sessions</li>
                <li>• For best results, use high-resolution images (1920x1080 or higher)</li>
                <li>• Gradient backgrounds provide consistent performance across devices</li>
              </ul>
            </div>
          </div>

          {/* Profile Image Settings */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mt-6">
            <div className="flex items-center space-x-3 mb-6">
              <Monitor className="text-primary-400" size={24} />
              <h2 className="text-xl font-semibold text-white">Profile Image Settings</h2>
            </div>
            
            <p className="text-white/60 mb-8">
              Upload a profile image that will be displayed on your portfolio.
            </p>

            {/* Current Profile Image Preview */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">Current Profile Image</h3>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20">
                <img 
                  src={currentProfileImage} 
                  alt="Current profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Profile Image Upload */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-medium mb-3">Upload New Profile Image</h3>
              <p className="text-white/60 text-sm mb-4">
                Choose a high-quality image for your profile. Recommended size: 400x400 pixels or larger.
              </p>
              
              <div className="flex items-center space-x-3">
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="profile-image-upload"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/70 cursor-pointer hover:bg-white/20 transition-all duration-200 flex items-center space-x-2"
                >
                  <Upload size={18} />
                  <span>{profileImageFile ? profileImageFile.name : 'Choose profile image'}</span>
                </label>
                <button
                  onClick={handleProfileImageUpload}
                  disabled={!profileImageFile || uploadingProfileImage}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {uploadingProfileImage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Upload size={16} />
                  )}
                  <span>{uploadingProfileImage ? 'Uploading...' : 'Upload'}</span>
                </button>
              </div>
            </div>

            {/* Profile Image Tips */}
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h4 className="text-green-300 font-medium mb-2">Profile Image Tips:</h4>
              <ul className="text-green-200 text-sm space-y-1">
                <li>• Use a square image for best results (1:1 aspect ratio)</li>
                <li>• Minimum recommended size: 400x400 pixels</li>
                <li>• Supported formats: JPG, PNG, WebP</li>
                <li>• The image will be automatically cropped to a circle</li>
              </ul>
            </div>
          </div>

          {/* Logo Studio Settings */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mt-6">
            <div className="flex items-center space-x-3 mb-6">
              <Smartphone className="text-primary-400" size={24} />
              <h2 className="text-xl font-semibold text-white">Logo Studio Settings</h2>
            </div>
            
            <p className="text-white/60 mb-8">
              Upload a custom logo for your studio. This will replace the default "S" logo in the header and update the favicon.
            </p>

            {/* Current Logo Preview */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">Current Logo</h3>
              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/20 bg-white/5 flex items-center justify-center">
                {hasCustomLogo && currentLogo ? (
                  <img 
                    src={currentLogo} 
                    alt="Current logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">S</span>
                )}
              </div>
            </div>

            {/* Logo Upload */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-4">
              <h3 className="text-white font-medium mb-3">Upload New Logo</h3>
              <p className="text-white/60 text-sm mb-4">
                Choose a high-quality logo image. Supported formats: PNG, JPG, JPEG, SVG. Recommended size: 64x64 pixels or larger.
              </p>
              
              <div className="flex items-center space-x-3">
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/70 cursor-pointer hover:bg-white/20 transition-all duration-200 flex items-center space-x-2"
                >
                  <Upload size={18} />
                  <span>{logoFile ? logoFile.name : 'Choose logo image'}</span>
                </label>
                <button
                  onClick={handleLogoUpload}
                  disabled={!logoFile || uploadingLogo}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {uploadingLogo ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Upload size={16} />
                  )}
                  <span>{uploadingLogo ? 'Uploading...' : 'Upload'}</span>
                </button>
              </div>
            </div>

            {/* Reset Logo Button */}
            {hasCustomLogo && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={handleLogoReset}
                  className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <RotateCcw size={18} />
                  <span>Reset to Default Logo</span>
                </button>
              </div>
            )}

            {/* Logo Tips */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <h4 className="text-purple-300 font-medium mb-2">Logo Tips:</h4>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>• Use a square or rectangular logo for best results</li>
                <li>• SVG format is recommended for crisp display at all sizes</li>
                <li>• The logo will be displayed in the header navigation</li>
                <li>• Favicon will be automatically generated from your logo</li>
                <li>• Changes will be visible after page refresh</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}