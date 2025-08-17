'use client'

import { useEffect } from 'react'

export default function FaviconUpdater() {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const response = await fetch('/api/settings/logo')
        if (response.ok) {
          const data = await response.json()
          
          if (data.hasCustomLogo && data.logoUrl) {
            // Update favicon with custom logo
            const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
            if (favicon) {
              favicon.href = data.logoUrl
            } else {
              // Create favicon link if it doesn't exist
              const newFavicon = document.createElement('link')
              newFavicon.rel = 'icon'
              newFavicon.href = data.logoUrl
              document.head.appendChild(newFavicon)
            }
            
            // Update apple-touch-icon
            const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement
            if (appleTouchIcon) {
              appleTouchIcon.href = data.logoUrl
            } else {
              const newAppleTouchIcon = document.createElement('link')
              newAppleTouchIcon.rel = 'apple-touch-icon'
              newAppleTouchIcon.href = data.logoUrl
              document.head.appendChild(newAppleTouchIcon)
            }
          } else {
            // Reset to default favicon
            const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
            if (favicon) {
              favicon.href = '/favicon.ico'
            }
            
            const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement
            if (appleTouchIcon) {
              appleTouchIcon.href = '/favicon.ico'
            }
          }
        }
      } catch (error) {
        console.log('Failed to update favicon')
      }
    }

    updateFavicon()
  }, [])

  return null
}