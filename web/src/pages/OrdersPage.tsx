import { useState, useEffect } from 'react'

interface Order {
  id: string
  shop_id: string
  status: string
  payment_status: string
  total_kobo: number
  subtotal_kobo: number
  discount_kobo: number
  created_at: string
  confirmed_at?: string | null
  delivered_at?: string | null
  eta_at?: string | null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:8000/v1/orders')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      setOrders(Array.isArray(data) ? data : [])
      setError('')
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setError('Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)
    try {
      const response = await fetch(`http://localhost:8000/v1/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      // Refresh orders
      await fetchOrders()
    } catch (error) {
      console.error('Failed to update order:', error)
      alert('Failed to update order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const formatCurrency = (kobo: number) => `₦${(kobo / 100).toFixed(2)}`

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { class: 'badge-gray', text: 'Pending', emoji: '⏳' },
      confirmed: { class: 'badge-purple', text: 'Confirmed', emoji: '✅' },
      packed: { class: 'badge-purple', text: 'Packed', emoji: '📦' },
      out_for_delivery: { class: 'badge-warning', text: 'Out for Delivery', emoji: '🚚' },
      delivered: { class: 'badge-success', text: 'Delivered', emoji: '✨' },
      canceled: { class: 'badge-danger', text: 'Canceled', emoji: '❌' }
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  const getPaymentBadge = (status: string) => {
    const badges = {
      unpaid: { class: 'badge-danger', text: 'Unpaid' },
      paid: { class: 'badge-success', text: 'Paid' },
      refunded: { class: 'badge-warning', text: 'Refunded' }
    }
    return badges[status as keyof typeof badges] || badges.unpaid
  }

  const filteredOrders = orders.filter(order => {
    if (!order || !order.id) return false
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o && o.status === 'pending').length,
    confirmed: orders.filter(o => o && o.status === 'confirmed').length,
    packed: orders.filter(o => o && o.status === 'packed').length,
    out_for_delivery: orders.filter(o => o && o.status === 'out_for_delivery').length,
    delivered: orders.filter(o => o && o.status === 'delivered').length
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: 'var(--color-text-tertiary)'
      }}>
        <p>Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--spacing-2xl)',
        color: 'var(--color-danger)'
      }}>
        <p style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>⚠️</p>
        <p style={{ fontSize: '18px' }}>{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <h2 className="text-title-large">Orders</h2>
        <div style={{
          fontSize: '16px',
          color: 'var(--color-text-secondary)',
          fontWeight: 600
        }}>
          {filteredOrders.length} orders
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-lg)',
        overflowX: 'auto',
        paddingBottom: 'var(--spacing-sm)'
      }}>
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'pending', label: 'Pending' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'packed', label: 'Packed' },
          { key: 'out_for_delivery', label: 'Out for Delivery' },
          { key: 'delivered', label: 'Delivered' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: filterStatus === key ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
              background: filterStatus === key ? 'rgba(139, 92, 246, 0.1)' : 'var(--color-bg-primary)',
              color: filterStatus === key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minHeight: '44px',
              whiteSpace: 'nowrap',
              fontSize: '14px'
            }}
          >
            {label} ({statusCounts[key as keyof typeof statusCounts]})
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <input
          type="text"
          placeholder="🔍 Search by Order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '12px 16px',
            fontSize: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-primary)',
            minHeight: '44px'
          }}
        />
      </div>

      {filteredOrders.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Created</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                if (!order || !order.id) return null
                const statusBadge = getStatusBadge(order.status)
                const paymentBadge = getPaymentBadge(order.payment_status)
                const isUpdating = updatingOrderId === order.id
                
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      #{order.id.substring(0, 8)}
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                      {formatDate(order.created_at)}
                    </td>
                    <td>
                      <span className={`badge ${statusBadge.class}`}>
                        {statusBadge.emoji} {statusBadge.text}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${paymentBadge.class}`}>
                        {paymentBadge.text}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '16px' }}>
                      {formatCurrency(order.total_kobo)}
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={isUpdating}
                        style={{
                          padding: '6px 12px',
                          fontSize: '14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-bg-primary)',
                          cursor: 'pointer',
                          minHeight: '36px',
                          fontWeight: 600
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: 'var(--spacing-2xl)',
          color: 'var(--color-text-tertiary)',
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <p style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>📦</p>
          <p style={{ fontSize: '18px' }}>No orders yet</p>
          <p style={{ fontSize: '14px', marginTop: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
            Orders will appear here after checkout
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'products' }))}
          >
            <span>🛒</span>
            Create First Order
          </button>
        </div>
      )}
    </div>
  )
}
