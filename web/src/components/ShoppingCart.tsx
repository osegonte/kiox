import { useCart } from '../context/CartContext'
import { useState } from 'react'
import { API_URL } from '../config'

export default function ShoppingCart() {
  const { items, removeItem, updateQuantity, totalPrice, isOpen, closeCart, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const formatCurrency = (kobo: number) => `₦${(kobo / 100).toFixed(2)}`

  const handleCheckout = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`${API_URL}/v1/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: '660e8400-e29b-41d4-a716-446655440000',
          items: items.map(item => ({
            product_id: item.id,
            qty: item.quantity
          }))
        })
      })

      if (response.ok) {
        setOrderSuccess(true)
        setTimeout(() => {
          clearCart()
          setOrderSuccess(false)
        }, 2000)
      }
    } catch (error) {
      console.error('Order failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease'
        }}
        onClick={closeCart}
      />

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '400px',
          maxWidth: '90vw',
          backgroundColor: 'var(--color-bg-primary)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease'
        }}
      >
        <div style={{
          padding: 'var(--spacing-lg)',
          borderBottom: '1px solid var(--color-separator)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 className="text-headline">Shopping Cart ({items.length})</h2>
          <button
            onClick={closeCart}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              minHeight: '44px',
              minWidth: '44px'
            }}
          >
            ✕
          </button>
        </div>

        {orderSuccess && (
          <div style={{
            padding: 'var(--spacing-md)',
            backgroundColor: 'rgba(52, 199, 89, 0.1)',
            color: 'var(--color-success)',
            textAlign: 'center',
            fontWeight: 600
          }}>
            ✅ Order created successfully!
          </div>
        )}

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--spacing-lg)'
        }}>
          {items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-2xl)',
              color: 'var(--color-text-tertiary)'
            }}>
              <p style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>🛒</p>
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                style={{
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  marginBottom: 'var(--spacing-md)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-danger)',
                      cursor: 'pointer',
                      fontSize: '18px',
                      padding: '4px'
                    }}
                  >
                    🗑️
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 12px', minHeight: '32px', fontSize: '18px' }}
                    >
                      −
                    </button>
                    <span style={{ fontWeight: 600, minWidth: '30px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 12px', minHeight: '32px', fontSize: '18px' }}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {formatCurrency(item.price_kobo * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{
            padding: 'var(--spacing-lg)',
            borderTop: '1px solid var(--color-separator)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 'var(--spacing-lg)',
              fontSize: '20px',
              fontWeight: 700
            }}>
              <span>Total:</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(totalPrice)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', fontSize: '18px' }}
            >
              {isSubmitting ? 'Processing...' : '🛍️ Checkout'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
