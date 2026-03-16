import { Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null }
  static getDerivedStateFromError(err) {
    return { hasError: true, error: err }
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
    this.setState((s) => ({ ...s, errorInfo: info }))
  }
  render() {
    if (this.state.hasError) {
      const err = this.state.error
      const isDev = import.meta.env.DEV
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif", padding: 24, background: '#f7f8fa', color: '#102a43'
        }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <h1 style={{ fontSize: 20, marginBottom: 12 }}>Something went wrong</h1>
            <p style={{ color: '#4f6478', marginBottom: 16 }}>
              We&apos;re sorry. Please refresh the page or try again later.
            </p>
            {isDev && err && (
              <pre style={{ textAlign: 'left', fontSize: 11, background: '#eee', padding: 12, borderRadius: 8, overflow: 'auto', marginBottom: 16, color: '#c00', maxHeight: 200 }}>
                {err.message}
                {this.state.errorInfo?.componentStack && `\n\n${this.state.errorInfo.componentStack}`}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px', background: '#1f9d8b', color: '#fff', border: 'none',
                borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14
              }}
            >
              Refresh page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:24px;font-family:sans-serif">Failed to load app: root element not found.</div>'
} else {
  createRoot(rootEl).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  )
  try {
    window.__TAXED_LOADED = true
  } catch (_) {}
}
