import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccessibility } from '../context/AccessibilityContext'
import { t } from '../utils/translations'

const Navbar = () => {
  const [isDark, setIsDark] = useState(false)
  const navigate = useNavigate()
  const { language } = useAccessibility()

  useEffect(() => {
    const localTheme = localStorage.getItem('color-theme')
    if (
      localTheme === 'dark' ||
      (!localTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.documentElement.classList.add('dark')
      setIsDark(true)
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
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-semibold dark:text-white"
          aria-label={t('nav.home', language)}
        >
          Community Resource Hub
        </button>

        <div className="flex md:order-2 space-x-3">
          <button
            onClick={() => navigate('/submit')}
            className="text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-sm px-4 py-2"
            aria-label={t('nav.submit', language)}
          >
            {t('nav.submit', language)}
          </button>
          <button
            onClick={toggleTheme}
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm p-2.5"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
          <ul className="flex flex-col md:flex-row md:space-x-8 font-medium">
            <li>
              <button
                onClick={() => navigate('/')}
                className="py-2 px-3 dark:text-white"
                aria-label={t('nav.home', language)}
              >
                {t('nav.home', language)}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/directory')}
                className="py-2 px-3 dark:text-white"
                aria-label={t('nav.directory', language)}
              >
                {t('nav.directory', language)}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/about')}
                className="py-2 px-3 dark:text-white"
                aria-label={t('nav.about', language)}
              >
                {t('nav.about', language)}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/contact')}
                className="py-2 px-3 dark:text-white"
                aria-label={t('nav.contact', language)}
              >
                {t('nav.contact', language)}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/reference')}
                className="py-2 px-3 dark:text-white"
                aria-label={t('nav.reference', language)}
              >
                {t('nav.reference', language)}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
