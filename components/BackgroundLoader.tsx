'use client'

import { useEffect, useState } from 'react'

interface Background {
  _id: string
  name: string
  image_url: string
  is_active: boolean
  file_type?: string
  createdAt: string
  updatedAt: string
}

export default function BackgroundLoader() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadActiveBackground = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch active background from database with cache busting
        const timestamp = Date.now()
        const response = await fetch(`/api/backgrounds?active=true&t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.background && data.background.image_url) {
          // Apply background to html element
          const htmlElement = document.documentElement
          
          // Remove any existing background styles
          htmlElement.style.background = ''
          htmlElement.style.backgroundImage = ''
          htmlElement.style.backgroundSize = ''
          htmlElement.style.backgroundPosition = ''
          htmlElement.style.backgroundRepeat = ''
          htmlElement.style.backgroundAttachment = ''
          
          // Apply new background
          const imageUrl = data.background.image_url
          htmlElement.style.backgroundImage = `url('${imageUrl}')`
          htmlElement.style.backgroundSize = 'cover'
          htmlElement.style.backgroundPosition = 'center center'
          htmlElement.style.backgroundRepeat = 'no-repeat'
          htmlElement.style.backgroundAttachment = 'fixed'
          htmlElement.style.minHeight = '100vh'
          
          console.log('Active background loaded:', data.background.name)
        } else {
          // No active background found, use default black background
          const htmlElement = document.documentElement
          htmlElement.style.background = '#000000'
          htmlElement.style.minHeight = '100vh'
          
          console.log('No active background found, using default black background')
        }
        
      } catch (error) {
        console.error('Error loading background:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
        
        // Fallback to default black background on error
        const htmlElement = document.documentElement
        htmlElement.style.background = '#000000'
        htmlElement.style.minHeight = '100vh'
        
      } finally {
        setLoading(false)
      }
    }

    // Initial load
    loadActiveBackground()
    
    // Set up interval to check for background changes every 5 seconds
    const interval = setInterval(() => {
      loadActiveBackground()
    }, 5000)
    
    // Listen for storage events (when background changes in another tab)
    const handleStorageChange = () => {
      loadActiveBackground()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', loadActiveBackground)
    
    // Cleanup
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', loadActiveBackground)
    }
  }, [])
  
  // Optional: Show loading state or error (can be removed if not needed)
  if (loading) {
    return null // or a loading spinner if desired
  }
  
  if (error) {
    console.warn('BackgroundLoader error:', error)
    return null
  }
  
  return null
}