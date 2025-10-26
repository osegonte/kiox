import { useState, useEffect } from 'react'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'

function App() {
  const [page, setPage] = useState('products')

  useEffect(() => {
    const handlePopState = () => {
      setPage(window.location.pathname === '/orders' ? 'orders' : 'products')
    }

    window.addEventListener('popstate', handlePopState)
    handlePopState()

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    setPage(path === '/orders' ? 'orders' : 'products')
  }

  // Simple routing
  if (page === 'orders') {
    return <OrdersPage />
  }

  return <ProductsPage />
}

export default App
