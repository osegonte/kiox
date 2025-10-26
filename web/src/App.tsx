import { useState } from 'react'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'
import ComingSoon from './pages/ComingSoon'

function App() {
  const [page, setPage] = useState('products')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'var(--color-bg-primary)',
        borderBottom: '1px solid var(--color-separator)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h1 className="text-title">Kiox</h1>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            {['products', 'orders', 'inventory', 'payments', 'analytics'].map((item) => (
              <button
                key={item}
                onClick={() => setPage(item)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: page === item ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                  color: page === item ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--spacing-xl) var(--spacing-lg)' }}>
        {page === 'products' && <ProductsPage />}
        {page === 'orders' && <OrdersPage />}
        {(page === 'inventory' || page === 'payments' || page === 'analytics') && <ComingSoon feature={page} />}
      </main>
    </div>
  )
}

export default App
