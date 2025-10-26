import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  brand: string
  category: string
  price_kobo: number
  active: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('http://localhost:8000/v1/products')
      .then(res => res.json())
      .then(setProducts)
  }, [])

  return (
    <div>
      <h2 className="text-title-large" style={{ marginBottom: 'var(--spacing-xl)' }}>Products</h2>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>{p.brand}</td>
                <td>{p.category}</td>
                <td style={{ fontWeight: 600 }}>₦{(p.price_kobo / 100).toFixed(2)}</td>
                <td><span className="badge-success">{p.active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
