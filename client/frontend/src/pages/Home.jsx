import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccessibility } from '../context/AccessibilityContext'
import { t } from '../utils/translations'
import RootLayout from '../layouts/RootLayout'
import HomeUser from '../components/HomeUser'
import CommunitySpotlight from '../components/CommunitySpotlight'

const Home = () => {
  const navigate = useNavigate()
  const { language } = useAccessibility()

  return (
    <div className="min-h-screen flex flex-col">
      <RootLayout />

      {/* Hero section for logged out users */}
      <main id="main-content" className="flex-1 bf-hero-gradient" role="main">
        <section className="bf-page-shell max-w-6xl mx-auto grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center pt-10 pb-16 lg:pt-16 lg:pb-24">
          <div className="space-y-7 text-left max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-sky-300 bf-pill">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              Community Resource Hub
            </span>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {t('home.title', language)}
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-xl">
              {t('home.subtitle', language)}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/directory')}
                className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-sm hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 focus-visible:ring-offset-slate-950 transition-colors"
                aria-label={t('home.browseDirectory', language)}
              >
                {t('home.browseDirectory', language)}
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex items-center justify-center rounded-lg border border-slate-600/80 bg-slate-900/40 px-5 py-2.5 text-sm font-medium text-slate-100 hover:border-sky-500/80 hover:text-sky-200 transition-colors dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-200"
                aria-label={t('home.suggestResource', language)}
              >
                {t('home.suggestResource', language)}
              </button>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-500">
              <span>• {t('home.features.interactiveMap', language)}</span>
              <span>• {t('home.features.searchFilter', language)}</span>
              <span>• {t('home.features.spotlight', language)}</span>
            </div>
          </div>

          <div className="bf-card p-5 md:p-6 lg:p-7">
            <CommunitySpotlight />
          </div>
        </section>

        {/* Map and nearby businesses section */}
        <section className="bf-page-shell max-w-6xl mx-auto pb-16">
          <HomeUser />
        </section>
      </main>
    </div>
  )
}

export default Home