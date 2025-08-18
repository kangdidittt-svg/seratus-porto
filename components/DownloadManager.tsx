'use client'

import { useState } from 'react'
import { Download, Mail, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface Order {
  _id: string
  customer_name: string
  customer_email: string
  product_id: {
    title: string
    _id: string
  }
  payment_status: string
  delivery_status: string
  download_link?: string
  download_expires?: string
  total_amount: number
  quantity: number
}

interface DownloadManagerProps {
  order: Order
  onUpdate: () => void
}

export default function DownloadManager({ order, onUpdate }: DownloadManagerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadType, setDownloadType] = useState<'url' | 'zip'>('url')
  const [watermarkOption, setWatermarkOption] = useState<'default' | 'none' | 'custom'>('default')
  const [customWatermarkFile, setCustomWatermarkFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  const canGenerateDownload = order.payment_status === 'paid' && order.delivery_status === 'delivered'
  const hasDownload = !!order.download_link
  const isExpired = order.download_expires && new Date() > new Date(order.download_expires)

  const generateDownload = async () => {
    if (!canGenerateDownload) {
      setMessage('Order must be paid and delivered first')
      return
    }

    setIsGenerating(true)
    setMessage('')

    try {
      // Prepare form data for potential file upload
      const formData = new FormData()
      formData.append('order_id', order._id)
      formData.append('download_type', downloadType)
      formData.append('watermark_option', watermarkOption)
      
      if (watermarkOption === 'custom' && customWatermarkFile) {
        formData.append('custom_watermark', customWatermarkFile)
      }

      const response = await fetch('/api/download', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Download link generated and email sent successfully!')
        onUpdate() // Refresh the order data
      } else {
        setMessage(data.error || 'Failed to generate download link')
      }
    } catch (error) {
      setMessage('Error generating download link')
      console.error('Download generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyDownloadLink = () => {
    if (order.download_link) {
      const fullUrl = `${window.location.origin}${order.download_link}`
      navigator.clipboard.writeText(fullUrl)
      setMessage('Download link copied to clipboard!')
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-sm border border-white/20">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Download Management</h3>
      </div>

      <div className="space-y-4">
        {/* Order Status */}
        <div className="flex items-center gap-4 text-sm">
          <div className={`flex items-center gap-1 ${
            order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'
          }`}>
            {order.payment_status === 'paid' ? 
              <CheckCircle className="w-4 h-4" /> : 
              <Clock className="w-4 h-4" />
            }
            Payment: {order.payment_status}
          </div>
          <div className={`flex items-center gap-1 ${
            order.delivery_status === 'delivered' ? 'text-green-600' : 'text-orange-600'
          }`}>
            {order.delivery_status === 'delivered' ? 
              <CheckCircle className="w-4 h-4" /> : 
              <Package className="w-4 h-4" />
            }
            Delivery: {order.delivery_status}
          </div>
        </div>

        {/* Download Type Selection */}
        {canGenerateDownload && !hasDownload && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Download Type:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="url"
                    checked={downloadType === 'url'}
                    onChange={(e) => setDownloadType(e.target.value as 'url' | 'zip')}
                    className="text-blue-400"
                  />
                  <span className="text-sm text-white">Direct URL</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="zip"
                    checked={downloadType === 'zip'}
                    onChange={(e) => setDownloadType(e.target.value as 'url' | 'zip')}
                    className="text-blue-400"
                  />
                  <span className="text-sm text-white">ZIP Package</span>
                </label>
              </div>
            </div>

            {/* Watermark Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Watermark:</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="default"
                    checked={watermarkOption === 'default'}
                    onChange={(e) => setWatermarkOption(e.target.value as 'default' | 'none' | 'custom')}
                    className="text-blue-400"
                  />
                  <span className="text-sm text-white">Use Default Watermark</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="none"
                    checked={watermarkOption === 'none'}
                    onChange={(e) => setWatermarkOption(e.target.value as 'default' | 'none' | 'custom')}
                    className="text-blue-400"
                  />
                  <span className="text-sm text-white">No Watermark</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="custom"
                    checked={watermarkOption === 'custom'}
                    onChange={(e) => setWatermarkOption(e.target.value as 'default' | 'none' | 'custom')}
                    className="text-blue-400"
                  />
                  <span className="text-sm text-white">Custom Watermark</span>
                </label>
              </div>

              {/* Custom Watermark Upload */}
              {watermarkOption === 'custom' && (
                <div className="mt-2 p-3 bg-white/10 rounded-lg border border-white/20">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => setCustomWatermarkFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    Upload PNG, JPG, or JPEG. PNG with transparency recommended.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generate Download Button */}
        {canGenerateDownload && !hasDownload && (
          <button
            onClick={generateDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Generate & Send Download
              </>
            )}
          </button>
        )}

        {/* Download Status */}
        {hasDownload && (
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-sm ${
              isExpired ? 'text-red-400' : 'text-green-400'
            }`}>
              {isExpired ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Download link expired
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Download link active
                </>
              )}
            </div>
            
            {order.download_expires && (
              <p className="text-sm text-white/60">
                Expires: {new Date(order.download_expires).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={copyDownloadLink}
                className="flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded text-sm hover:bg-white/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Copy Link
              </button>
              
              {isExpired && (
                <button
                  onClick={generateDownload}
                  disabled={isGenerating}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  Regenerate
                </button>
              )}
            </div>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm border ${
            message.includes('success') || message.includes('copied') 
              ? 'bg-green-500/20 text-green-300 border-green-500/30'
              : 'bg-red-500/20 text-red-300 border-red-500/30'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}