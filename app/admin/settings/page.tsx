'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Database, 
  ShoppingBag, 
  Users, 
  Monitor,
  Trash2,
  Eye,
  Edit,
  Download,
  Plus,
  AlertTriangle
} from 'lucide-react'

interface User {
  _id: string
  username: string
  email: string
  role: string
  createdAt: string
}

interface Order {
  _id: string
  customerName: string
  customerEmail: string
  productTitle: string
  amount: number
  paymentStatus: string
  proofImage?: string
  deliveryStatus: string
  downloadLink?: string
  notes?: string
  createdAt: string
}

export default function AdminSettings() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const sections = [
    { id: 'orders', label: 'Kelola Pesanan', icon: ShoppingBag },
    { id: 'users', label: 'Kelola Pengguna', icon: Users },
    { id: 'backgrounds', label: 'Background', icon: Monitor },
    { id: 'data', label: 'Kelola Data', icon: Database }
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ordersRes, usersRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/users')
      ])
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }
      
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearAllData = async () => {
    try {
      const response = await fetch('/api/admin/clear-all', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        alert('Semua data berhasil dihapus!')
        fetchData()
      } else {
        alert('Gagal menghapus data')
      }
    } catch (error) {
      console.error('Error clearing data:', error)
      alert('Terjadi kesalahan saat menghapus data')
    }
    setShowClearConfirm(false)
  }

  const deleteItem = async (type: string, id: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${type} ini?`)) return
    
    try {
      const response = await fetch(`/api/${type}/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchData()
      } else {
        alert(`Gagal menghapus ${type}`)
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      alert(`Terjadi kesalahan saat menghapus ${type}`)
    }
  }

  const updateOrder = async (orderId: string, updates: any) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        fetchData()
        setShowEditModal(false)
        setEditingOrder(null)
      } else {
        alert('Gagal mengupdate order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Terjadi kesalahan saat mengupdate order')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Pengaturan Admin</h1>
                <span className="text-white/70 text-sm">Kelola fitur tambahan</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-sm p-2 rounded-2xl border border-white/20">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => {
                  if (section.id === 'backgrounds') {
                    router.push('/admin/backgrounds')
                  } else {
                    setActiveSection(section.id)
                  }
                }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={18} />
                <span>{section.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* Orders Section */}
          {activeSection === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">Kelola Pesanan</h2>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Payment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Proof</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Delivery</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">{order.customerName}</div>
                              <div className="text-sm text-white/60">{order.customerEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{order.productTitle}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">Rp {order.amount.toLocaleString('id-ID')}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                              order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {order.proofImage ? (
                              <a href={order.proofImage} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">
                                View Proof
                              </a>
                            ) : (
                              <span className="text-white/40">No proof</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.deliveryStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.deliveryStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.deliveryStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-primary-400 hover:text-primary-300">
                                <Eye size={16} />
                              </button>
                              {order.paymentStatus === 'pending' && (
                                <button 
                                  onClick={() => updateOrder(order._id, { paymentStatus: 'paid' })}
                                  className="text-green-400 hover:text-green-300"
                                  title="Accept Order"
                                >
                                  <Plus size={16} />
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  setEditingOrder(order)
                                  setShowEditModal(true)
                                }}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => deleteItem('orders', order._id)}
                                className="text-red-400 hover:text-red-300"
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

          {/* Users Section */}
          {activeSection === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">Kelola Pengguna</h2>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => deleteItem('users', user._id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Data Management Section */}
          {activeSection === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">Kelola Data</h2>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center space-x-4 mb-4">
                  <AlertTriangle className="text-red-400" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Bersihkan Semua Data</h3>
                    <p className="text-white/60 text-sm">Hapus semua data produk, karya, pesanan, dan pengguna dari database</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Database size={18} />
                  <span>Bersihkan Semua Data</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="text-red-400" size={24} />
              <h3 className="text-lg font-semibold text-white">Konfirmasi Penghapusan</h3>
            </div>
            <p className="text-white/70 mb-6">
              Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={clearAllData}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Order</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Payment Status</label>
                <select 
                  value={editingOrder.paymentStatus}
                  onChange={(e) => setEditingOrder({...editingOrder, paymentStatus: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white/70 text-sm mb-2">Delivery Status</label>
                <select 
                  value={editingOrder.deliveryStatus}
                  onChange={(e) => setEditingOrder({...editingOrder, deliveryStatus: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white/70 text-sm mb-2">Download Link (Optional)</label>
                <input 
                  type="url"
                  value={editingOrder.downloadLink || ''}
                  onChange={(e) => setEditingOrder({...editingOrder, downloadLink: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40"
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-sm mb-2">Notes (Optional)</label>
                <textarea 
                  value={editingOrder.notes || ''}
                  onChange={(e) => setEditingOrder({...editingOrder, notes: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 h-20 resize-none"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingOrder(null)
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateOrder(editingOrder._id, {
                  paymentStatus: editingOrder.paymentStatus,
                  deliveryStatus: editingOrder.deliveryStatus,
                  downloadLink: editingOrder.downloadLink,
                  notes: editingOrder.notes
                })}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}