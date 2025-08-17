'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Download, Clock, CheckCircle, AlertCircle, Package, Mail } from 'lucide-react'
import Link from 'next/link'

interface DownloadData {
  has_download: boolean
  download_url?: string
  expires_at?: string
  is_expired: boolean
  product_title: string
}

export default function DownloadPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [downloadData, setDownloadData] = useState<DownloadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchDownloadData()
    }
  }, [orderId])

  const fetchDownloadData = async () => {
    try {
      const response = await fetch(`/api/download?order_id=${orderId}`)
      const data = await response.json()

      if (response.ok) {
        setDownloadData(data)
      } else {
        setError(data.error || 'Failed to fetch download data')
      }
    } catch (error) {
      setError('Error fetching download data')
      console.error('Download fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!downloadData?.download_url) return

    setDownloading(true)
    try {
      // Create a temporary link to trigger download
      const link = document.createElement('a')
      link.href = downloadData.download_url
      link.download = `${downloadData.product_title}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4" />
          <p className="text-white">Loading download information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!downloadData?.has_download) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
          <Package className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Download Not Available</h1>
          <p className="text-white/70 mb-6">
            Your download is not ready yet. Please wait for your order to be processed and delivered.
          </p>
          <div className="space-y-2 text-sm text-white/60">
            <p>• Make sure your payment has been confirmed</p>
            <p>• Wait for order delivery confirmation</p>
            <p>• Check your email for download notification</p>
          </div>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mt-6"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (downloadData.is_expired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
          <Clock className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Download Expired</h1>
          <p className="text-white/70 mb-6">
            Your download link has expired. Please contact support to request a new download link.
          </p>
          <div className="space-y-3">
            <a 
              href="mailto:support@seratusstudio.com"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </a>
            <Link 
              href="/"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Download Ready!</h1>
        <h2 className="text-lg text-white/80 mb-6">{downloadData.product_title}</h2>
        
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Download Available</span>
          </div>
          {downloadData.expires_at && (
            <p className="text-white/60 text-sm">
              Expires: {new Date(downloadData.expires_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
        >
          {downloading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Preparing Download...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download File
            </>
          )}
        </button>

        <div className="text-xs text-white/50 space-y-1">
          <p>• Save the file in a secure location</p>
          <p>• Download link will expire after the specified date</p>
          <p>• Contact support if you encounter any issues</p>
        </div>

        <Link 
          href="/"
          className="block text-white/70 hover:text-white transition-colors mt-6"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}