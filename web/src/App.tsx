import { useState, useEffect } from 'react'
import { CartProvider, useCart } from './context/CartContext'
import ShoppingCart from './components/ShoppingCart'
import Dashboard from './pages/Dashboard'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'

function AppContent() {
  const [page, setPage] = useState('dashboard')
  const { totalItems } = useCart()

  useEffect(() => {
    const handleNavigate = (e: any) => {
      setPage(e.detail)
    }
    window.addEventListener('navigate', handleNavigate)
    return () => window.removeEventListener('navigate', handleNavigate)
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-secondary)' }}>
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
          <h1 className="text-title" style={{ color: 'var(--color-text-primary)' }}>
            Kiox
          </h1>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            {['dashboard', 'products', 'orders'].map((item) => (
              <button
                key={item}
                onClick={() => setPage(item)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: page === item ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  color: page === item ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                  minHeight: '44px',
                  position: 'relative'
                }}
              >
                {item}
                {item === 'products' && totalItems > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    {totalItems}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--spacing-xl) var(--spacing-lg)' }}>
        {page === 'dashboard' && <Dashboard />}
        {page === 'products' && <ProductsPage />}
        {page === 'orders' && <OrdersPage />}
      </main>

      <ShoppingCart />
    </div>
  )
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  )
}

export default App
