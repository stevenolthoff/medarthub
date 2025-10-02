import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  const [healthData, setHealthData] = React.useState<any>(null)

  React.useEffect(() => {
    // Fetch health check from API
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealthData(data))
      .catch(err => setHealthData({ error: err.message }))
  }, [])

  return (
    <main style={{ padding: 24 }}>
      <h1>MedArtHub</h1>
      <p>Vite + React + Express API</p>
      <pre id="health">
        {healthData ? JSON.stringify(healthData, null, 2) : 'Loading...'}
      </pre>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
