import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  title: string
}

export default function Layout({ children, title }: LayoutProps) {
  const currentPath = window.location.pathname

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
          
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            
              href="/"
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                color: currentPath === '/' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                backgroundColor: currentPath === '/' ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              Products
            </a>
            
              href="/orders"
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                color: currentPath === '/orders' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                backgroundColor: currentPath === '/orders' ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              Orders
            </a>
          </div>
        </div>
      </nav>

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--spacing-xl) var(--spacing-lg)'
      }}>
        <h2 className="text-title-large" style={{ marginBottom: 'var(--spacing-xl)' }}>
          {title}
        </h2>
        {children}
      </main>
    </div>
  )
}
