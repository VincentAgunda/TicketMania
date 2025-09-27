import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/globals.css'
import { testConnection } from './lib/supabase.js'

// Test Supabase connection on startup
testConnection().then(success => {
  if (!success) {
    console.warn('Supabase connection failed. Some features may not work.')
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
