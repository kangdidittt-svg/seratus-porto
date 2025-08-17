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
  Download,
  X,
  Monitor,
  Check,
  Database
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import DownloadManager from '@/components/DownloadManager'

interface User {
  _id: string
  username: string
  email: string
  role: string
  createdAt?: string
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
  original_price: number
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
  customer_phone: string
  customer_address: string
  product_id: Product
  quantity: number
  total_amount: number
  payment_status: 'pending' | 'paid' | 'failed'
  delivery_status: 'pending' | 'processing' | 'delivered'
  payment_proof?: string | null
  download_link?: string
  download_expires?: string
  notes?: string
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  })

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
          totalArtworks: artworksData.pagination?.total || 0,
          totalProducts: productsData.pagination?.total || 0,
          totalOrders: ordersData.pagination?.total || 0,
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
      } else if (activeTab === 'users') {
        loadUsers()
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
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return

    try {
      const response = await fetch(`/api/${type}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`${type.slice(0, -1)} berhasil dihapus!`)
        setTimeout(() => setSuccess(''), 3000)
        loadDashboardData()
      } else {
        setError(data.error || `Gagal menghapus ${type.slice(0, -1)}`)
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      console.error('Delete error:', error)
      setError('Network error. Silakan coba lagi.')
      setTimeout(() => setError(''), 5000)
    }
  }

  const acceptOrder = async (orderId: string) => {
    if (!confirm('Apakah Anda yakin ingin menerima pesanan ini?')) return

    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: orderId, 
          delivery_status: 'processing',
          payment_status: 'paid'
        }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Pesanan berhasil diterima!')
        setTimeout(() => setSuccess(''), 3000)
        loadDashboardData()
      } else {
        setError(data.error || 'Gagal menerima pesanan')
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      console.error('Accept order error:', error)
      setError('Network error. Silakan coba lagi.')
      setTimeout(() => setError(''), 5000)
    }
  }

  const clearAllData = async () => {
    const confirmMessage = 'PERINGATAN: Ini akan menghapus SEMUA data produk dan karya dari database. Ketik "HAPUS SEMUA" untuk konfirmasi:'
    const userInput = prompt(confirmMessage)
    
    if (userInput !== 'HAPUS SEMUA') {
      alert('Operasi dibatalkan. Teks konfirmasi tidak sesuai.')
      return
    }

    if (!confirm('Apakah Anda BENAR-BENAR yakin? Tindakan ini tidak dapat dibatalkan!')) {
      return
    }

    try {
      setLoading(true)
      
      // Hapus semua produk
      const productsResponse = await fetch('/api/admin/cleanup/products', {
        method: 'DELETE',
        credentials: 'include'
      })
      
      // Hapus semua artworks
      const artworksResponse = await fetch('/api/admin/cleanup/artworks', {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (productsResponse.ok && artworksResponse.ok) {
        setSuccess('Semua data produk dan karya berhasil dihapus!')
        setTimeout(() => setSuccess(''), 5000)
        loadDashboardData()
      } else {
        setError('Gagal menghapus beberapa data. Silakan coba lagi.')
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      console.error('Clear all data error:', error)
      setError('Network error. Silakan coba lagi.')
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data || [])
      } else {
        setError('Gagal memuat data users')
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      console.error('Load users error:', error)
      setError('Network error saat memuat users')
      setTimeout(() => setError(''), 5000)
    }
  }

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setSuccess('User berhasil dihapus')
        setTimeout(() => setSuccess(''), 3000)
        loadUsers() // Reload users list
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Gagal menghapus user')
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      console.error('Delete user error:', error)
      setError('Network error saat menghapus user')
      setTimeout(() => setError(''), 5000)
    }
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUserForm.username || !newUserForm.email || !newUserForm.password) {
      setError('Semua field harus diisi')
      setTimeout(() => setError(''), 5000)
      return
    }

    try {
      setLoading(true)
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUserForm)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess('User berhasil ditambahkan!')
        setTimeout(() => setSuccess(''), 5000)
        setNewUserForm({ username: '', email: '', password: '', role: 'user' })
        setShowAddUserModal(false)
        loadUsers()
      } else {
        setError(data.error || 'Gagal menambahkan user')
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      console.error('Create user error:', error)
      setError('Network error. Silakan coba lagi.')
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'artworks', label: 'Artworks', icon: Image },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'backgrounds', label: 'Backgrounds', icon: Monitor }
  ]

  return (
    <div className="min-h-screen">
      
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <span className="text-white/70 text-sm">Welcome, {user?.username}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-white/70 hover:text-white transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10"
              >
                View Site
              </button>
              <button
                onClick={clearAllData}
                className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10"
                title="Hapus semua data produk dan karya"
              >
                <Database size={18} />
                <span>Clear All</span>
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10"
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 flex items-center justify-between">
            <span>{success}</span>
            <button 
              onClick={() => setSuccess('')}
              className="text-green-300 hover:text-green-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              className="text-red-300 hover:text-red-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-sm p-2 rounded-2xl border border-white/20">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'backgrounds') {
                    router.push('/admin/backgrounds')
                  } else {
                    setActiveTab(tab.id)
                  }
                }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
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
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Total Artworks</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalArtworks || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <Image className="text-primary-400" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Total Products</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalProducts || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Package className="text-green-400" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Total Orders</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalOrders || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="text-blue-400" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">Rp {(stats?.totalRevenue || 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-yellow-400" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  {stats?.recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <p className="text-white font-medium">{order.customer_name}</p>
                        <p className="text-white/60 text-sm">{order.customer_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">Rp {order.total_amount.toLocaleString('id-ID')}</p>
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
                  <div key={artwork._id} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
                    <div className="aspect-video bg-white/5 relative">
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
                      <p className="text-white/60 text-sm mb-3 line-clamp-2">{artwork.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => router.push(`/admin/artworks/view/${artwork._id}`)}
                            className="text-primary-400 hover:text-primary-300 transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => router.push(`/admin/artworks/edit/${artwork._id}`)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit Artwork"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => deleteItem('artworks', artwork._id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Hapus Artwork"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <span className="text-white/50 text-xs">
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
                  <div key={product._id} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
                    <div className="aspect-video bg-white/5 relative">
                      {product.preview_images[0] && (
                        <img
                          src={product.preview_images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {product.original_price > product.price && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
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
                        <span className="text-primary-400 font-bold">Rp {product.price.toLocaleString('id-ID')}</span>
                        <div className="flex items-center space-x-1 text-white/60 text-sm">
                          <Download size={14} />
                          <span>{product.downloads}</span>
                        </div>
                      </div>
                      <p className="text-white/60 text-sm mb-3 line-clamp-2">{product.description}</p>
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
                        <span className="text-white/50 text-xs">
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
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-white/70">Customer</th>
                        <th className="text-left p-4 text-white/70">Product</th>
                        <th className="text-left p-4 text-white/70">Amount</th>
                        <th className="text-left p-4 text-white/70">Payment</th>
                        <th className="text-left p-4 text-white/70">Proof</th>
                        <th className="text-left p-4 text-white/70">Delivery</th>
                        <th className="text-left p-4 text-white/70">Date</th>
                        <th className="text-left p-4 text-white/70">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id} className="border-t border-white/10">
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{order.customer_name}</p>
                              <p className="text-white/60 text-sm">{order.customer_email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-white">{order.product_id?.title || 'N/A'}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-white font-medium">Rp {order.total_amount.toLocaleString('id-ID')}</p>
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
                            {order.payment_proof ? (
                              <button
                                onClick={() => window.open(order.payment_proof!, '_blank')}
                                className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded bg-blue-500/20 transition-colors"
                              >
                                View Proof
                              </button>
                            ) : (
                              <span className="text-white/40 text-xs">No proof</span>
                            )}
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
                            <span className="text-white/50 text-sm">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setShowOrderModal(true)
                                }}
                                className="text-primary-400 hover:text-primary-300 transition-colors"
                                title="Lihat Detail"
                              >
                                <Eye size={16} />
                              </button>
                              {order.delivery_status === 'pending' && (
                                <button 
                                  onClick={() => acceptOrder(order._id)}
                                  className="text-green-400 hover:text-green-300 transition-colors"
                                  title="Terima Pesanan"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  setEditingOrder(order)
                                  setShowEditModal(true)
                                }}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Edit Pesanan"
                              >
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

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Users Management</h2>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <Plus size={18} />
                  <span>Add User</span>
                </button>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-white/70">Username</th>
                        <th className="text-left p-4 text-white/70">Email</th>
                        <th className="text-left p-4 text-white/70">Role</th>
                        <th className="text-left p-4 text-white/70">Created</th>
                        <th className="text-left p-4 text-white/70">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <tr key={userItem._id} className="border-t border-white/10">
                          <td className="p-4">
                            <p className="text-white font-medium">{userItem.username}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-white">{userItem.email}</p>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              userItem.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {userItem.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="text-white/70 text-sm">
                              {new Date(userItem.createdAt || '').toLocaleDateString('id-ID')}
                            </p>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => deleteUser(userItem._id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-white/50">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View Order Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Order Details</h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Customer Name</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Customer Email</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg">{selectedOrder.customer_email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Customer Phone</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Customer Address</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg">{selectedOrder.customer_address}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Product</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg">{selectedOrder.product_id?.title || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Quantity</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg">{selectedOrder.quantity}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Total Amount</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg font-semibold">Rp {selectedOrder.total_amount.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Order Date</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg">{new Date(selectedOrder.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Payment Status</label>
                  <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium ${
                    selectedOrder.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' :
                    selectedOrder.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    selectedOrder.payment_status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedOrder.payment_status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Delivery Status</label>
                  <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium ${
                    selectedOrder.delivery_status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                    selectedOrder.delivery_status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                    selectedOrder.delivery_status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {selectedOrder.delivery_status}
                  </span>
                </div>
              </div>
              
              {selectedOrder.notes && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Notes</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}
              
              {selectedOrder.download_link && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Download Link</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg break-all">{selectedOrder.download_link}</p>
                </div>
              )}
              
              {selectedOrder.payment_proof && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Payment Proof</label>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <img 
                      src={selectedOrder.payment_proof} 
                      alt="Payment Proof" 
                      className="max-w-full h-auto max-h-64 rounded-lg cursor-pointer"
                      onClick={() => window.open(selectedOrder.payment_proof!, '_blank')}
                    />
                    <p className="text-white/60 text-xs mt-2">Click to view full size</p>
                  </div>
                </div>
              )}
              
              {/* Download Management */}
              <div className="mt-6">
                <DownloadManager 
                  order={selectedOrder} 
                  onUpdate={() => {
                    // Refresh orders data
                    fetchOrders()
                  }} 
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-white/20">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Close
              </button>
              {selectedOrder.delivery_status === 'pending' && (
                <button 
                  onClick={() => {
                    acceptOrder(selectedOrder._id)
                    setShowOrderModal(false)
                  }}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Check size={16} />
                  <span>Konfirmasi Pesanan</span>
                </button>
              )}
              {selectedOrder.delivery_status === 'processing' && selectedOrder.payment_status === 'paid' && (
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/orders', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          id: selectedOrder._id, 
                          delivery_status: 'delivered'
                        }),
                        credentials: 'include'
                      })
                      
                      if (response.ok) {
                        setSuccess('Pesanan berhasil diselesaikan!')
                        setTimeout(() => setSuccess(''), 3000)
                        loadDashboardData()
                        setShowOrderModal(false)
                      }
                    } catch (error) {
                      console.error('Complete order error:', error)
                    }
                  }}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Selesaikan Pesanan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Edit Order</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              try {
                const response = await fetch('/api/orders', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    id: editingOrder._id,
                    payment_status: editingOrder.payment_status,
                    delivery_status: editingOrder.delivery_status,
                    download_link: editingOrder.download_link,
                    notes: editingOrder.notes
                  })
                })
                
                if (response.ok) {
                  // Refresh orders
                  loadDashboardData()
                  setShowEditModal(false)
                  setEditingOrder(null)
                } else {
                  console.error('Failed to update order')
                }
              } catch (error) {
                console.error('Error updating order:', error)
              }
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Customer Name</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg">{editingOrder.customer_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Customer Email</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg">{editingOrder.customer_email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Payment Status</label>
                  <select
                    value={editingOrder.payment_status}
                    onChange={(e) => setEditingOrder({...editingOrder, payment_status: e.target.value as any})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Delivery Status</label>
                  <select
                    value={editingOrder.delivery_status}
                    onChange={(e) => setEditingOrder({...editingOrder, delivery_status: e.target.value as any})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Download Link (Optional)</label>
                <input
                  type="url"
                  value={editingOrder.download_link || ''}
                  onChange={(e) => setEditingOrder({...editingOrder, download_link: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Notes (Optional)</label>
                <textarea
                  value={editingOrder.notes || ''}
                  onChange={(e) => setEditingOrder({...editingOrder, notes: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 h-20 resize-none"
                  placeholder="Add notes about this order..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                >
                  Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md w-full border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Add New User</h3>
              <button
                onClick={() => {
                  setShowAddUserModal(false)
                  setNewUserForm({ username: '', email: '', password: '', role: 'user' })
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={createUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Username</label>
                <input
                  type="text"
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter username"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Password</label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="user" className="bg-gray-800 text-white">User</option>
                  <option value="admin" className="bg-gray-800 text-white">Admin</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false)
                    setNewUserForm({ username: '', email: '', password: '', role: 'user' })
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}