import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

const NavbarBusiness = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  useEffect(() => {
    const localTheme = localStorage.getItem('color-theme');
    if (localTheme === 'dark' || (!localTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('color-theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('color-theme', 'dark');
      setIsDark(true);
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 relative">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="w-5 h-5" />
          </button>
          <button onClick={() => handleNavClick('/')} className="text-2xl font-semibold dark:text-white">
            BusinessFinder
          </button>
        </div>
        
        <div className="flex gap-3 items-center">
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-3 items-center">
            <Link to="/business/dashboard" className="py-2 px-3 text-gray-700 dark:text-gray-300 hover:text-sky-400 transition-colors">
              Dashboard
            </Link>
            <Link to="/directory" className="py-2 px-3 text-gray-700 dark:text-gray-300 hover:text-sky-400 transition-colors">
              Directory
            </Link>
          </div>
          
          <button 
            type="button" 
            onClick={toggleTheme} 
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0" 
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
              </svg>
            )}
          </button>
          <button 
            onClick={handleLogout} 
            className="text-white bg-blue-700 px-3 py-1 rounded dark:bg-blue-600 dark:hover:bg-blue-700 hover:bg-blue-800 dark:hover:bg-blue-800 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <ul className="flex flex-col space-y-2 font-medium">
            <li>
              <button
                onClick={() => handleNavClick('/business/dashboard')}
                className="w-full text-left py-3 px-3 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('/directory')}
                className="w-full text-left py-3 px-3 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Directory
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarBusiness;