import React from 'react'
import RootLayout from '../layouts/RootLayout'

const FAQ = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <RootLayout />
      <main className="bf-page-shell flex-1 max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-slate-50">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Learn more about how this website works.
          </p>
        </header>

        <section className="space-y-6">
          <div className="bf-card p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              What is this website for?
            </h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200/90">
              This site is a community resource finder. It helps you discover local organizations,
              services, and community resources in your area so you can quickly see what support and
              opportunities are available nearby.
            </p>
          </div>

          <div className="bf-card p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              How does it find businesses and resources?
            </h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200/90">
              We combine a curated directory of community resources with map data. When you search,
              we use your chosen location and filters (like category or search keywords) to show
              relevant results on the map and in the list.
            </p>
          </div>

          <div className="bf-card p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Do I have to share my location?
            </h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200/90">
              Location sharing is optional. If you allow location access, we can automatically show
              resources near you. If you prefer not to, you can still set your location manually.
            </p>
          </div>

          <div className="bf-card p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              How do bookmarks and favourites work?
            </h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200/90">
              You can bookmark resources you want to remember. Your
              bookmarks are saved to your account so you can come back later from the same or a
              different device and quickly find them again.
            </p>
          </div>

          <div className="bf-card p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              How can I suggest a new resource?
            </h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200/90">
              If you know about a community resource that is not yet listed, you can suggest it
              using the &quot;Suggest a Community Resource&quot; form on the Contact page. We review
              submissions before they appear in the directory to keep information accurate and
              helpful.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default FAQ
