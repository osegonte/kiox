import { useState, useEffect } from 'react'
import Layout from '../components/Layout'

interface Product {
  id: string
  sku: string
  name: string
  brand: string
  category: string
  unit: string
  price_kobo: number
  active: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/v1/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load products:', err)
        setLoading(false)
      })
  }, [])

  const formatPrice = (kobo: number) => {
    return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <Layout title="Products">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-2xl)' }}>
          <div className="spinner"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Products">
      {/* Stats cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
          <div className="text-caption" style={{ marginBottom: 'var(--spacing-xs)' }}>
            Total Products
          </div>
          <div className="text-title">{products.length}</div>
        </div>
        
        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
          <div className="text-caption" style={{ marginBottom: 'var(--spacing-xs)' }}>
            Active
          </div>
          <div className="text-title" style={{ color: 'var(--color-success)' }}>
            {products.filter(p => p.active).length}
          </div>
        </div>
        
        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
          <div className="text-caption" style={{ marginBottom: 'var(--spacing-xs)' }}>
            Categories
          </div>
          <div className="text-title">
            {new Set(products.map(p => p.category)).size}
          </div>
        </div>
      </div>

      {/* Products table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Price</th>
              <th>Unit</th>
              <th style={{ textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>{product.name}</div>
                  <div className="text-caption">{product.sku}</div>
                </td>
                <td>{product.brand}</td>
                <td>{product.category}</td>
                <td style={{ fontWeight: 600, fontSize: '18px' }}>{formatPrice(product.price_kobo)}</td>
                <td className="text-callout" style={{ color: 'var(--color-text-secondary)' }}>{product.unit}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={product.active ? 'badge badge-success' : 'badge badge-danger'}>
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
