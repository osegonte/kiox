import { useState, useEffect } from 'react'

interface Order {
  id: string
  shop_id: string
  status: string
  total_kobo: number
  created_at: string
  payment_status: string
}

interface Stats {
  todayOrders: number
  todayRevenue: number
  pendingDeliveries: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingDeliveries: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:8000/v1/orders')
      const orders: Order[] = await response.json()

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at)
        orderDate.setHours(0, 0, 0, 0)
        return orderDate.getTime() === today.getTime()
      })

      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_kobo, 0)

      const pendingDeliveries = orders.filter(order => 
        order.status === 'pending' || 
        order.status === 'confirmed' || 
        order.status === 'packed' ||
        order.status === 'out_for_delivery'
      ).length

      setStats({
        todayOrders: todayOrders.length,
        todayRevenue,
        pendingDeliveries
      })

      setRecentOrders(orders.slice(0, 5))
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setLoading(false)
    }
  }

  const formatCurrency = (kobo: number) => `₦${(kobo / 100).toFixed(2)}`

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { class: 'badge-gray', text: 'Pending' },
      confirmed: { class: 'badge-purple', text: 'Confirmed' },
      packed: { class: 'badge-purple', text: 'Packed' },
      out_for_delivery: { class: 'badge-warning', text: 'Out for Delivery' },
      delivered: { class: 'badge-success', text: 'Delivered' },
      canceled: { class: 'badge-danger', text: 'Canceled' }
    }
    return badges[status as keyof typeof badges] || badges.pending
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
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-title-large" style={{ marginBottom: 'var(--spacing-xl)' }}>
        Dashboard
      </h2>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div className="stat-label">Today's Orders</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            {stats.todayOrders}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-xs)' }}>
            {stats.todayOrders > 0 ? 'Great progress!' : 'No orders yet today'}
          </p>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div className="stat-label">Today's Revenue</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            {formatCurrency(stats.todayRevenue)}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-xs)' }}>
            {stats.todayRevenue > 0 ? 'Keep it up!' : 'First sale coming soon'}
          </p>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div className="stat-label">Pending Deliveries</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            {stats.pendingDeliveries}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-xs)' }}>
            {stats.pendingDeliveries > 0 ? 'Needs attention' : 'All caught up!'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'products' }))}
        >
          <span>➕</span>
          New Order
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'products' }))}
        >
          <span>📦</span>
          View Products
        </button>
      </div>

      <div>
        <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-lg)' }}>
          Recent Orders
        </h3>
        
        {recentOrders.length > 0 ? (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const badge = getStatusBadge(order.status)
                    return (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                          #{order.id.slice(0, 8)}
                        </td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>
                          {formatTime(order.created_at)}
                        </td>
                        <td>
                          <span className={`badge ${badge.class}`}>
                            {badge.text}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {formatCurrency(order.total_kobo)}
                        </td>
                        <td>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 16px', fontSize: '14px', minHeight: '36px' }}
                            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'orders' }))}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'orders' }))}
              >
                View All Orders
              </button>
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-2xl)',
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--color-text-tertiary)'
          }}>
            <p style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>📦</p>
            <p style={{ fontSize: '18px', marginBottom: 'var(--spacing-sm)' }}>No orders yet</p>
            <p style={{ fontSize: '14px', marginBottom: 'var(--spacing-lg)' }}>
              Create your first order to get started!
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'products' }))}
            >
              <span>🛒</span>
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
