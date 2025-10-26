import { API_URL } from '../config'
import { API_URL } from '../config'
import { useState, useEffect } from 'react'

interface ProductFormProps {
  product?: any
  onClose: () => void
  onSave: () => void
}

export default function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    brand: '',
    category: '',
    unit: 'piece',
    price_kobo: 0,
    active: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        brand: product.brand || '',
        category: product.category || '',
        unit: product.unit || 'piece',
        price_kobo: product.price_kobo || 0,
        active: product.active ?? true
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const url = product 
        ? `${API_URL}/v1/products/${product.id}`
        : '${API_URL}/v1/products'
      
      const method = product ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to save product')
      }

      onSave()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePriceChange = (nairaValue: string) => {
    const numValue = parseFloat(nairaValue) || 0
    setFormData({ ...formData, price_kobo: Math.round(numValue * 100) })
  }

  return (
    <>
      {/* Backdrop */}
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
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: 'var(--spacing-lg)',
          borderBottom: '1px solid var(--color-separator)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 className="text-headline">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-lg)' }}>
          {error && (
            <div style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'rgba(255, 59, 48, 0.1)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-md)'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            {/* Product Name */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: 'var(--spacing-xs)',
                fontSize: '14px'
              }}>
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Coca-Cola 50cl"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  minHeight: '44px'
                }}
              />
            </div>

            {/* SKU */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: 'var(--spacing-xs)',
                fontSize: '14px'
              }}>
                SKU (Product Code) *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g., COKE-50CL"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  minHeight: '44px'
                }}
              />
            </div>

            {/* Brand & Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '14px'
                }}>
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g., Coca-Cola"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    minHeight: '44px'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '14px'
                }}>
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Beverages"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    minHeight: '44px'
                  }}
                />
              </div>
            </div>

            {/* Unit & Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '14px'
                }}>
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    minHeight: '44px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="piece">Piece</option>
                  <option value="pack">Pack</option>
                  <option value="carton">Carton</option>
                  <option value="kg">Kilogram</option>
                  <option value="liter">Liter</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '14px'
                }}>
                  Price (₦) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={(formData.price_kobo / 100).toFixed(2)}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    minHeight: '44px'
                  }}
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)'
            }}>
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer'
                }}
              />
              <label htmlFor="active" style={{
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                Product is active and available for orders
              </label>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            marginTop: 'var(--spacing-xl)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  )
}
