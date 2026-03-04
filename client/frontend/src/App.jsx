import { Routes, Route } from 'react-router-dom'
import { useAccessibility } from './context/AccessibilityContext'
import { t } from './utils/translations'
import Home from './pages/Home'
import Directory from './pages/Directory'
import SubmitResource from './pages/SubmitResource'
import Reference from './pages/Reference'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import BusinessPage from './pages/BusinessPage'
import Services from './pages/Services'
import './App.css'

function App() {
  const { language } = useAccessibility()
  
  return (
    <>
      <a href="#main-content" className="skip-to-main">
        {t('common.skipToMain', language) || 'Skip to main content'}
      </a>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/business/:id" element={<BusinessPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/submit" element={<SubmitResource />} />
        <Route path="/reference" element={<Reference />} />
        <Route path="*" element={<h2>{t('common.pageNotFound', language) || 'Page Not Found'}</h2>} />
      </Routes>
    </>
  )
}

export default App
