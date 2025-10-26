import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  price_kobo: number
}

export default function OrdersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [qty, setQty] = useState(1)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('http://localhost:8000/v1/products')
      .then(res => res.json())
      .then(setProducts)
  }, [])

  const createOrder = async () => {
    const res = await fetch('http://localhost:8000/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shop_id: '660e8400-e29b-41d4-a716-446655440000',
        items: [{ product_id: selectedProduct, qty }]
      })
    })
    
    if (res.ok) {
      const order = await res.json()
      setMessage(`✅ Order created! Total: ₦${(order.total_kobo / 100).toFixed(2)}`)
      setSelectedProduct('')
      setQty(1)
    }
  }

  return (
    <div>
      <h2 className="text-title-large" style={{ marginBottom: 'var(--spacing-xl)' }}>Create Order</h2>
      
      <div className="card" style={{ maxWidth: '600px' }}>
        <select 
          value={selectedProduct} 
          onChange={e => setSelectedProduct(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '16px', fontSize: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}
        >
          <option value="">Select product...</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name} - ₦{(p.price_kobo / 100).toFixed(2)}</option>
          ))}
        </select>
        
        <input 
          type="number" 
          value={qty} 
          onChange={e => setQty(parseInt(e.target.value))}
          min="1"
          style={{ width: '100%', padding: '12px', marginBottom: '16px', fontSize: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}
        />
        
        <button onClick={createOrder} className="btn btn-primary" style={{ width: '100%' }}>
          Create Order
        </button>
        
        {message && <p style={{ marginTop: '16px', color: 'var(--color-success)' }}>{message}</p>}
      </div>
    </div>
  )
}
