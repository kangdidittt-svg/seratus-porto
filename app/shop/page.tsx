'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ShoppingCart, X, Plus, Minus, CreditCard, Package, Star, SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'
import Header from '@/components/Header'
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard'
import { IProduct } from '@/models/Product'

interface CartItem {
  _id: string
  title: string
  description: string
  price: number
  original_price?: number
  finalPrice: number
  category: string
  watermark_url: string
  preview_images: string[]
  downloads: number
  active: boolean
  quantity: number
}

interface ApiResponse {
  products: IProduct[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    categories: string[]
    priceRange: {
      min: number
      max: number
    }
  }
}

export default function ShopPage() {
  const [products, setProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // Filter options
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(1000000)
  
  // Cart
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  // Checkout form
  const [checkoutForm, setCheckoutForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    notes: ''
  })

  // Fetch products
  const fetchProducts = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedTags.length > 0 && { tags: selectedTags.join(',') }),
        ...(priceRange[0] > 0 && { minPrice: priceRange[0].toString() }),
        ...(priceRange[1] < maxPrice && { maxPrice: priceRange[1].toString() }),
        sort: sortBy
      })

      const response = await fetch(`/api/products?${params}`)
      const data: ApiResponse = await response.json()

      if (response.ok) {
        if (reset || pageNum === 1) {
          setProducts(data.products)
        } else {
          setProducts(prev => [...prev, ...data.products])
        }
        
        setAvailableCategories(data.filters.categories)
        setAvailableTags(data.filters.tags)
        setMaxPrice(data.filters.priceRange.max)
        setHasMore(pageNum < data.pagination.pages)
        setPage(pageNum)
      } else {
        console.error('Failed to fetch products:', (data as any).error)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchProducts(1, true)
  }, [searchTerm, selectedCategory, selectedTags, priceRange, sortBy])

  // Load more
  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchProducts(page + 1)
    }
  }

  // Cart functions
  const addToCart = (product: IProduct) => {
    setCart(prev => {
      const existingItem = prev.find(item => item._id === product._id)
      if (existingItem) {
        return prev.map(item => 
          item._id === product._id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, { ...product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item._id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(prev => prev.map(item => 
        item._id === productId 
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  // Handle checkout
  const handleCheckout = async () => {
    try {
      const orders = cart.map(item => ({
        customer_name: checkoutForm.customer_name,
        customer_email: checkoutForm.customer_email,
        customer_phone: checkoutForm.customer_phone || '-',
        customer_address: checkoutForm.customer_address || '-',
        product_id: item._id,
        quantity: item.quantity,
        total_amount: item.price * item.quantity,
        notes: checkoutForm.notes
      }))

      for (const order of orders) {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        })

        if (!response.ok) {
          throw new Error('Failed to create order')
        }
      }

      // Clear cart and close modals
      setCart([])
      setShowCheckout(false)
      setShowCart(false)
      setCheckoutForm({ customer_name: '', customer_email: '', customer_phone: '', customer_address: '', notes: '' })
      
      alert('Order berhasil dibuat! Kami akan mengirimkan link download ke email Anda.')
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Terjadi kesalahan saat checkout. Silakan coba lagi.')
    }
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedTags([])
    setPriceRange([0, maxPrice])
    setSortBy('newest')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-web bg-cover bg-center bg-fixed">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Digital Shop
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Koleksi premium designs dan digital assets untuk kebutuhan kreatif Anda
            </p>
          </div>
        </div>
      </section>





      {/* Products Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={index}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white px-8 py-3 text-lg rounded-lg font-medium transition-colors"
                  >
                    {loadingMore ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Package size={18} />
                        <span>Load More Products</span>
                      </div>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
                <Package size={32} className="text-white/60" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">No Products Found</h3>
              <p className="text-white/70 mb-6">Try adjusting your search or filter criteria</p>
              <button onClick={clearFilters} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-white/20">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart Button */}
      <motion.button
        onClick={() => setShowCart(true)}
        className="fixed bottom-6 right-6 bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-2xl z-40 transition-all duration-300 hover:scale-110"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ShoppingCart size={24} />
        {getTotalItems() > 0 && (
          <motion.span
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {getTotalItems()}
          </motion.span>
        )}
      </motion.button>

      {/* Cart Modal */}
      {showCart && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCart(false)}
        >
          <div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <ShoppingCart size={24} />
                  <span>Shopping Cart ({getTotalItems()})</span>
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart size={48} className="text-white/60 mx-auto mb-4" />
                  <p className="text-white/70">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item._id} className="flex items-center space-x-4 bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={item.watermark_url || '/placeholder-product.jpg'}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{item.title}</h3>
                          <p className="text-primary-400 font-medium">{formatPrice(item.price)}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors border border-white/20"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors border border-white/20"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-semibold text-white">Total:</span>
                      <span className="text-2xl font-bold text-primary-400">{formatPrice(getTotalPrice())}</span>
                    </div>
                    
                    <button
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <CreditCard size={20} />
                      <span>Proceed to Checkout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCheckout(false)}
        >
          <div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Checkout</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCheckout(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.customer_name}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, customer_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={checkoutForm.customer_email}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, customer_email: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Phone</label>
                  <input
                    type="tel"
                    required
                    value={checkoutForm.customer_phone}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Address</label>
                  <textarea
                    required
                    value={checkoutForm.customer_address}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, customer_address: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-16 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Notes (Optional)</label>
                  <textarea
                    value={checkoutForm.notes}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-20 resize-none"
                  />
                </div>

                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-white">Total:</span>
                    <span className="text-xl font-bold text-primary-400">{formatPrice(getTotalPrice())}</span>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Place Order
                  </button>
                  
                  <p className="text-xs text-white/60 mt-2 text-center">
                    Download link akan dikirim ke email Anda setelah konfirmasi pembayaran
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  )
}