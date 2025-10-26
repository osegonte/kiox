import { API_URL } from '../config'
export default function ComingSoon({ feature }: { feature: string }) {
  return (
    <div className="coming-soon">
      <h2 className="text-title-large" style={{ marginBottom: 'var(--spacing-md)' }}>
        {feature.charAt(0).toUpperCase() + feature.slice(1)}
      </h2>
      <p style={{ fontSize: '18px' }}>Coming Soon 🚀</p>
    </div>
  )
}
