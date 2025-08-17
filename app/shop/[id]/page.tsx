'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ShoppingCart, Download, Star, Tag, Calendar, Eye, ChevronLeft, ChevronRight, X, ExternalLink, Send, Upload, User, Mail, Phone, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'

interface Product {
  _id: string
  title: string
  description: string
  price: number
  original_price: number
  discount?: number
  discountAmount?: number
  category: string
  file_url: string
  watermark_url: string
  preview_images: string[]
  tags: string[]
  downloads: number
  active: boolean

  createdAt: string
}

interface ApiResponse {
  product: Product
  relatedProducts: Product[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    payment_proof: null as File | null
  })
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState('')
  const [orderError, setOrderError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${id}`)
      const data: ApiResponse = await response.json()

      if (response.ok) {
        setProduct(data.product)
        setRelatedProducts(data.relatedProducts)
      } else {
        console.error('Failed to fetch product:', (data as any).error)
        router.push('/404')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      router.push('/404')
    } finally {
      setLoading(false)
    }
  }

  const nextImage = () => {
    if (product && product.preview_images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.preview_images.length)
      setImageLoading(true)
    }
  }

  const prevImage = () => {
    if (product && product.preview_images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.preview_images.length) % product.preview_images.length)
      setImageLoading(true)
    }
  }

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index)
    setShowImageModal(true)
    setImageLoading(true)
  }

  const handleOrderNow = () => {
    setShowOrderModal(true)
  }

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setOrderLoading(true)
    setOrderError('')
    setOrderSuccess('')

    try {
      const formData = new FormData()
      formData.append('customer_name', orderForm.customer_name)
      formData.append('customer_email', orderForm.customer_email)
      formData.append('customer_phone', orderForm.customer_phone)
      formData.append('customer_address', orderForm.customer_address)
      formData.append('product_id', product._id)
      formData.append('quantity', quantity.toString())
      formData.append('total_amount', (product.price * quantity).toString())
      
      if (orderForm.payment_proof) {
        formData.append('payment_proof', orderForm.payment_proof)
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setOrderSuccess('Pesanan berhasil dibuat! Kami akan segera memproses pesanan Anda.')
        setOrderForm({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          customer_address: '',
          payment_proof: null
        })
        setTimeout(() => {
          setShowOrderModal(false)
          setOrderSuccess('')
        }, 3000)
      } else {
        setOrderError(data.error || 'Gagal membuat pesanan')
      }
    } catch (error) {
      console.error('Order error:', error)
      setOrderError('Network error. Silakan coba lagi.')
    } finally {
      setOrderLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setOrderForm(prev => ({ ...prev, payment_proof: file }))
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
        <Header />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-dark-700 rounded w-32 mb-8"></div>
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="aspect-square bg-dark-700 rounded-2xl"></div>
                <div className="space-y-6">
                  <div className="h-8 bg-dark-700 rounded w-3/4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-dark-700 rounded"></div>
                    <div className="h-4 bg-dark-700 rounded w-5/6"></div>
                    <div className="h-4 bg-dark-700 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Order Modal */}
      <AnimatePresence>
        {showOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Konfirmasi Pesanan</h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {product && (
                <div className="mb-6 p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                      <Image
                        src={product.preview_images[0] || '/placeholder.jpg'}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{product.title}</h4>
                      <p className="text-white/60 text-sm">Qty: {quantity}</p>
                      <p className="text-primary-400 font-bold">{formatPrice(product.price * quantity)}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    <User size={16} className="inline mr-2" />
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={orderForm.customer_name}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, customer_name: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={orderForm.customer_email}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, customer_email: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    <Phone size={16} className="inline mr-2" />
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    required
                    value={orderForm.customer_phone}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Alamat
                  </label>
                  <textarea
                    required
                    value={orderForm.customer_address}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, customer_address: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500 resize-none"
                    rows={3}
                    placeholder="Alamat lengkap untuk pengiriman"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    <Upload size={16} className="inline mr-2" />
                    Bukti Pembayaran
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="payment-proof"
                    />
                    <label
                      htmlFor="payment-proof"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white/60 cursor-pointer hover:bg-dark-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Upload size={16} />
                      <span>{orderForm.payment_proof ? orderForm.payment_proof.name : 'Pilih file gambar'}</span>
                    </label>
                  </div>
                  <p className="text-xs text-white/40 mt-1">Format: JPG, PNG, GIF (Max: 5MB)</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-300 text-sm font-medium mb-2">Informasi Pembayaran:</p>
                  <p className="text-blue-200 text-xs">
                    Transfer ke rekening: BCA 1234567890 a.n. Seratus Porto<br />
                    Nominal: {product && formatPrice(product.price * quantity)}<br />
                    Upload bukti transfer untuk verifikasi pembayaran.
                  </p>
                </div>

                {orderError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-300 text-sm">{orderError}</p>
                  </div>
                )}

                {orderSuccess && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-300 text-sm">{orderSuccess}</p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={orderLoading}
                    className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {orderLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Kirim Pesanan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Product Not Found</h1>
          <p className="text-dark-300 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/shop" className="btn-primary">
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  const hasDiscount = product.original_price > product.price
  const discountPercentage = hasDiscount ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0
  const discountAmount = hasDiscount ? product.original_price - product.price : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
      <Header />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-dark-300 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Shop</span>
          </motion.button>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                {/* Main Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-800 group cursor-pointer"
                     onClick={() => openImageModal(currentImageIndex)}>
                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                      -{discountPercentage}%
                    </div>
                  )}

                  {/* Download Count */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1 z-10">
                    <Download size={14} />
                    <span>{product.downloads}</span>
                  </div>

                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="loading-dots">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                  )}
                  
                  <Image
                    src={product.preview_images[currentImageIndex] || product.watermark_url || '/placeholder-product.jpg'}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    onLoad={() => setImageLoading(false)}
                  />

                  {/* Expand Icon */}
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={16} />
                  </div>

                  {/* Navigation Arrows */}
                  {product.preview_images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {product.preview_images.length > 1 && (
                  <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                    {product.preview_images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => { setCurrentImageIndex(index); setImageLoading(true); }}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex
                            ? 'border-primary-500 ring-2 ring-primary-500/30'
                            : 'border-dark-600 hover:border-dark-500'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Title and Meta */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-primary-400 font-medium uppercase tracking-wide">
                    {product.category}
                  </span>
                  <span className="text-dark-500">•</span>
                  <div className="flex items-center space-x-1 text-dark-400">
                    <Calendar size={14} />
                    <span className="text-sm">
                      {new Date(product.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-4">{product.title}</h1>
                
                {/* Price */}
                <div className="flex flex-col space-y-2 mb-6">
                  {hasDiscount ? (
                    <>
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl font-bold text-primary-400">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-xl text-dark-400 line-through">
                          {formatPrice(product.original_price)}
                        </span>
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                          -{discountPercentage}%
                        </span>
                      </div>
                      <div className="text-green-400 font-semibold text-lg">
                        Hemat {formatPrice(discountAmount)}
                      </div>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-primary-400">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                <p className="text-dark-200 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <Tag size={20} />
                    <span>Tags</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm border border-primary-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase Section */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Purchase</h3>
                
                {/* Quantity Selector */}
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-dark-300">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-dark-700 text-white rounded-lg flex items-center justify-center hover:bg-dark-600 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-white font-medium w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-dark-700 text-white rounded-lg flex items-center justify-center hover:bg-dark-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="flex items-center justify-between mb-6 p-4 bg-dark-700/50 rounded-lg">
                  <span className="text-lg font-semibold text-white">Total:</span>
                  <span className="text-2xl font-bold text-primary-400">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleOrderNow}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send size={20} />
                    <span>Pesan Sekarang</span>
                  </button>
                  
                  <Link
                    href="/shop"
                    className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Download Info */}
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Download size={16} className="text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-blue-300 text-sm font-medium">Digital Download</p>
                      <p className="text-blue-200 text-xs mt-1">
                        Download link akan dikirim ke email Anda setelah konfirmasi pembayaran
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-white mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct, index) => (
                  <ProductCard
                    key={relatedProduct._id}
                    product={relatedProduct}
                    index={index}
                    onAddToCart={() => alert(`Added ${relatedProduct.title} to cart!`)}
                  />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X size={32} />
              </button>

              {/* Modal Image */}
              <div className="relative aspect-square max-h-[80vh] rounded-lg overflow-hidden">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-dark-800">
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                )}
                <Image
                  src={product.preview_images[currentImageIndex] || product.watermark_url}
                  alt={product.title}
                  fill
                  className="object-contain"
                  onLoad={() => setImageLoading(false)}
                />

                {/* Navigation in Modal */}
                {product.preview_images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Image Counter */}
              {product.preview_images.length > 1 && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white text-sm">
                  {currentImageIndex + 1} / {product.preview_images.length}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}