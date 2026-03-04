import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AccessibilityProvider } from './context/AccessibilityContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <AccessibilityProvider>
        <App />
      </AccessibilityProvider>
    </AuthProvider>
  </BrowserRouter>
)
