import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => {
        setHealth(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('API health check failed:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="App">
      <h1>Kiox Admin</h1>
      <div className="card">
        {loading ? (
          <p>Checking API connection...</p>
        ) : health ? (
          <div>
            <p>✅ API Status: {health.status}</p>
            <p>Version: {health.version}</p>
          </div>
        ) : (
          <p>❌ API connection failed</p>
        )}
      </div>
    </div>
  )
}

export default App
