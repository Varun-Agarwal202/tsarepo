import React, { useContext } from 'react'
import RootLayout from '../layouts/RootLayout';
import { AuthContext } from '../context/AuthContext';
import HomeUser from '../components/HomeUser';
import HomeBusiness from '../components/HomeBusiness'; // NEW
import CommunitySpotlight from '../components/CommunitySpotlight';

const Home = () => {
  const { isAuthenticated, role } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col">
      <RootLayout />

      {!isAuthenticated && (
        <main className="flex-1 bf-hero-gradient">
          <section className="bf-page-shell max-w-6xl mx-auto grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center pt-10 pb-16 lg:pt-16 lg:pb-24">
            <div className="space-y-7 text-left max-w-xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-sky-300 bf-pill">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Built for discovering local businesses
              </span>
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Find places you&apos;ll love,
                <span className="text-sky-400"> right around the corner.</span>
              </h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-xl">
                BusinessFinder helps you explore nearby restaurants, cafés, shops, and more—while
                supporting the local businesses that keep your community unique.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-sm hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 focus-visible:ring-offset-slate-950 transition-colors"
                >
                  Get started
                </a>
                <a
                  href="/directory"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-600/80 bg-slate-900/40 px-5 py-2.5 text-sm font-medium text-slate-100 hover:border-sky-500/80 hover:text-sky-200 transition-colors"
                >
                  Browse directory
                </a>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-500">
                <span>• Real reviews from real people</span>
                <span>• Personalized bookmarks</span>
                <span>• Role-based business tools</span>
              </div>
            </div>

            <div className="bf-card p-5 md:p-6 lg:p-7">
              <CommunitySpotlight />
            </div>
          </section>
        </main>
      )}

      {isAuthenticated && (
        <main className="bf-page-shell flex-1">
          {role === 'business' ? <HomeBusiness /> : <HomeUser />}
        </main>
      )}
    </div>
  )
}

export default Home