import React, { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
const Navbar = () => {
  const [isDark, setIsDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext)
  const navLinkClass = "block py-2 px-3 md:p-0 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent text-gray-900 dark:text-gray-300";
  const activeClass = "text-blue-700 md:dark:text-blue-500 font-medium";

  const handleLogout = () => {
    logout()
    navigate('/')
  }
  useEffect(() => {
    const localTheme = localStorage.getItem('color-theme')
    if (
      localTheme === 'dark' ||
      (!localTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light')
      document.documentElement.classList.remove('dark')
      localStorage.setItem('color-theme', 'light')
      setIsDark(false)
    } else {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.documentElement.classList.add('dark')
      localStorage.setItem('color-theme', 'dark')
      setIsDark(true)
    }
  }

  return (
    <div>
      <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-screen-xl flex flex-wrap items-center mx-auto px-4 py-3 gap-4">
          {/* Left: Logo */}
          <Link to="/" className="shrink-0">
            <span className="text-xl md:text-2xl font-semibold whitespace-nowrap text-gray-900 dark:text-white">BusinessFinder</span>
          </Link>

          {/* Center: Nav links - takes remaining space, centered; on mobile shown below when menu open */}
          <div className={`flex-1 min-w-0 flex justify-center ${menuOpen ? 'flex' : 'hidden'} md:!flex`} id="navbar-cta">
            <ul className="flex flex-col md:flex-row font-medium gap-1 md:gap-0 md:space-x-6 lg:space-x-8 p-4 md:p-0 mt-0 md:mt-0 border border-gray-200 md:border-0 rounded-lg bg-gray-100 md:bg-transparent dark:bg-gray-800 md:dark:bg-transparent dark:border-gray-600">
              <li><Link to="/" className={`${navLinkClass} ${location.pathname === '/' ? activeClass : ''}`} aria-current={location.pathname === '/' ? 'page' : undefined}>Home</Link></li>
              <li><Link to="/about" className={`${navLinkClass} ${location.pathname === '/about' ? activeClass : ''}`}>FAQ</Link></li>
              <li><Link to="/services" className={`${navLinkClass} ${location.pathname === '/services' ? activeClass : ''}`}>Services</Link></li>
              <li><Link to="/contact" className={`${navLinkClass} ${location.pathname === '/contact' ? activeClass : ''}`}>Contact</Link></li>
              <li><Link to="/directory" className={`${navLinkClass} ${location.pathname === '/directory' ? activeClass : ''}`}>Directory</Link></li>
            </ul>
          </div>

          {/* Right: Log Out + theme toggle - always visible */}
          <div className="flex items-center shrink-0 gap-3 ml-auto md:ml-0">
            <button onClick={() => setMenuOpen(!menuOpen)} type="button" className="md:hidden inline-flex items-center p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-expanded={menuOpen} aria-label="Toggle menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <button onClick={handleLogout} type="button" className="whitespace-nowrap text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700">Log Out</button>
            <button type="button" onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0" aria-label="Toggle theme">
              {isDark ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" clipRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/></svg>
              )}
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar