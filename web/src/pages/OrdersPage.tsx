import { useState, useEffect } from 'react'
import Layout from '../components/Layout'

interface Product {
  id: string
  name: string
  price_kobo: number
}

interface OrderItem {
  product_id: string
  qty: number
}

export default function OrdersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [items, setItems] = useState<OrderItem[]>([{ product_id: '', qty: 1 }])
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const shopId = '660e8400-e29b-41d4-a716-446655440000'

  useEffect(() => {
    fetch('http://localhost:8000/v1/products')
      .then(res => res.json())
      .then(setProducts)
  }, [])

  const addItem = () => {
    setItems([...items, { product_id: '', qty: 1 }])
  }

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id)
      return sum + (product ? product.price_kobo * item.qty : 0)
    }, 0)
  }

  const formatPrice = (kobo: number) => {
    return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const createOrder = async () => {
    const validItems = items.filter(item => item.product_id && item.qty > 0)
    
    if (validItems.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one item' })
      return
    }

    setCreating(true)
    setMessage(null)

    try {
      const response = await fetch('http://localhost:8000/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          items: validItems
        })
      })

      if (response.ok) {
        const order = await response.json()
        setMessage({ 
          type: 'success', 
          text: `Order created successfully! Total: ${formatPrice(order.total_kobo)}`
        })
        setItems([{ product_id: '', qty: 1 }])
      } else {
        setMessage({ type: 'error', text: 'Failed to create order' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <Layout title="Create Order">
      <div style={{ maxWidth: '800px' }}>
        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <h3 className="text-headline" style={{ marginBottom: 'var(--spacing-lg)' }}>
            Order Items
          </h3>
          
          {items.map((item, index) => (
            <div key={index} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px auto',
              gap: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-md)',
              alignItems: 'center'
            }}>
              <select
                value={item.product_id}
                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
              >
                <option value="">Select product...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} — {formatPrice(product.price_kobo)}
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                value={item.qty}
                onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 1)}
                min="1"
                placeholder="Qty"
              />
              
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(index)}
                  className="btn btn-danger btn-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button
            onClick={addItem}
            className="btn btn-secondary"
            style={{ marginTop: 'var(--spacing-sm)' }}
          >
            + Add Item
          </button>

          {/* Total section */}
          <div style={{
            marginTop: 'var(--spacing-xl)',
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-headline">Total</span>
              <span className="text-title">{formatPrice(calculateTotal())}</span>
            </div>
          </div>

          <button
            onClick={createOrder}
            disabled={creating}
            className="btn btn-primary"
            style={{ marginTop: 'var(--spacing-xl)', width: '100%' }}
          >
            {creating ? (
              <>
                <div className="spinner"></div>
                Creating Order...
              </>
            ) : (
              'Create Order'
            )}
          </button>

          {message && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: 'var(--spacing-md)' }}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
