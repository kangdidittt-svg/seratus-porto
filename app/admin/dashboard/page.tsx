'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  Image, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  LogOut,
  Settings,
  TrendingUp,
  DollarSign,
  Package,
  Download
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface User {
  _id: string
  username: string
  email: string
  role: string
}

interface Artwork {
  _id: string
  title: string
  description: string
  images: string[]
  tags: string[]
  featured: boolean
  createdAt: string
}

interface Product {
  _id: string
  title: string
  description: string
  price: number
  discount: number
  category: string
  preview_images: string[]
  tags: string[]
  downloads: number
  active: boolean
  createdAt: string
}

interface Order {
  _id: string
  customer_name: string
  customer_email: string
  product_id: Product
  quantity: number
  total_amount: number
  payment_status: 'pending' | 'paid' | 'failed'
  delivery_status: 'pending' | 'processing' | 'delivered'
  createdAt: string
}

interface Stats {
  totalArtworks: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  recentOrders: Order[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    checkAuthentication()
  }, [])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user, activeTab])

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.user && data.user.role === 'admin') {
          setUser(data.user)
        } else {
          router.push('/admin')
        }
      } else {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async () => {
    try {
      if (activeTab === 'dashboard') {
        // Load stats
        const [artworksRes, productsRes, ordersRes] = await Promise.all([
          fetch('/api/artworks?limit=1'),
          fetch('/api/products?limit=1'),
          fetch('/api/orders?limit=5')
        ])

        const artworksData = await artworksRes.json()
        const productsData = await productsRes.json()
        const ordersData = await ordersRes.json()

        const totalRevenue = ordersData.orders?.reduce((sum: number, order: Order) => 
          order.payment_status === 'paid' ? sum + order.total_amount : sum, 0) || 0

        setStats({
          totalArtworks: artworksData.total || 0,
          totalProducts: productsData.total || 0,
          totalOrders: ordersData.total || 0,
          totalRevenue,
          recentOrders: ordersData.orders || []
        })
      } else if (activeTab === 'artworks') {
        const response = await fetch('/api/artworks?limit=20')
        const data = await response.json()
        setArtworks(data.artworks || [])
      } else if (activeTab === 'products') {
        const response = await fetch('/api/products?limit=20')
        const data = await response.json()
        setProducts(data.products || [])
      } else if (activeTab === 'orders') {
        const response = await fetch('/api/orders?limit=20')
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'DELETE',
        credentials: 'include'
      })
      router.push('/admin')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const deleteItem = async (type: 'artworks' | 'products' | 'orders', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/${type}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        loadDashboardData()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'artworks', label: 'Artworks', icon: Image },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag }
  ]

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <span className="text-dark-400">Welcome, {user?.username}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-dark-400 hover:text-white transition-colors"
              >
                View Site
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-dark-400 hover:text-white transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-dark-800 p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-dark-400 hover:text-white hover:bg-dark-700'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Dashboard Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-effect rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-dark-400 text-sm">Total Artworks</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalArtworks || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <Image className="text-primary-400" size={24} />
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-dark-400 text-sm">Total Products</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalProducts || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Package className="text-green-400" size={24} />
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-dark-400 text-sm">Total Orders</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalOrders || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="text-blue-400" size={24} />
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-dark-400 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">${stats?.totalRevenue || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-yellow-400" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  {stats?.recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{order.customer_name}</p>
                        <p className="text-dark-400 text-sm">{order.customer_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">${order.total_amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' :
                          order.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Artworks Tab */}
          {activeTab === 'artworks' && (
            <motion.div
              key="artworks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Artworks Management</h2>
                <button 
                  onClick={() => router.push('/admin/artworks/create')}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus size={18} />
                  <span>Add Artwork</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((artwork) => (
                  <div key={artwork._id} className="glass-effect rounded-xl overflow-hidden">
                    <div className="aspect-video bg-dark-800 relative">
                      {artwork.images[0] && (
                        <img
                          src={artwork.images[0]}
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {artwork.featured && (
                        <span className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2">{artwork.title}</h3>
                      <p className="text-dark-400 text-sm mb-3 line-clamp-2">{artwork.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <button className="text-primary-400 hover:text-primary-300 transition-colors">
                            <Eye size={16} />
                          </button>
                          <button className="text-blue-400 hover:text-blue-300 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => deleteItem('artworks', artwork._id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <span className="text-dark-400 text-xs">
                          {new Date(artwork.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Products Management</h2>
                <button 
                  onClick={() => router.push('/admin/products/create')}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus size={18} />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="glass-effect rounded-xl overflow-hidden">
                    <div className="aspect-video bg-dark-800 relative">
                      {product.preview_images[0] && (
                        <img
                          src={product.preview_images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {product.discount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          -{product.discount}%
                        </span>
                      )}
                      {!product.active && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-semibold">Inactive</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2">{product.title}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-primary-400 font-bold">${product.price}</span>
                        <div className="flex items-center space-x-1 text-dark-400 text-sm">
                          <Download size={14} />
                          <span>{product.downloads}</span>
                        </div>
                      </div>
                      <p className="text-dark-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <button className="text-primary-400 hover:text-primary-300 transition-colors">
                            <Eye size={16} />
                          </button>
                          <button className="text-blue-400 hover:text-blue-300 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => deleteItem('products', product._id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <span className="text-dark-400 text-xs">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">Orders Management</h2>
              
              <div className="glass-effect rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-800">
                      <tr>
                        <th className="text-left p-4 text-dark-300">Customer</th>
                        <th className="text-left p-4 text-dark-300">Product</th>
                        <th className="text-left p-4 text-dark-300">Amount</th>
                        <th className="text-left p-4 text-dark-300">Payment</th>
                        <th className="text-left p-4 text-dark-300">Delivery</th>
                        <th className="text-left p-4 text-dark-300">Date</th>
                        <th className="text-left p-4 text-dark-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id} className="border-t border-dark-700">
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{order.customer_name}</p>
                              <p className="text-dark-400 text-sm">{order.customer_email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-white">{order.product_id?.title || 'N/A'}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-white font-medium">${order.total_amount}</p>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' :
                              order.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {order.payment_status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.delivery_status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                              order.delivery_status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {order.delivery_status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-dark-400 text-sm">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button className="text-primary-400 hover:text-primary-300 transition-colors">
                                <Eye size={16} />
                              </button>
                              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => deleteItem('orders', order._id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}