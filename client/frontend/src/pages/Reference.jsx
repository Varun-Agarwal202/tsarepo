import React from 'react'
import RootLayout from '../layouts/RootLayout'

export default function Reference() {
  return (
    <div className="min-h-screen flex flex-col">
      <RootLayout />
      <main className="bf-page-shell flex-1 max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-slate-50">
            Reference & Attribution
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Learn more about the tools, frameworks, and resources that power this community hub.
          </p>
        </header>

        <section className="space-y-6">
          <div className="bf-card p-5 md:p-6">
            <h2 className="text-xl font-semibold text-slate-100 mb-3">Sources &amp; Attribution</h2>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-slate-200/90">
              <li>
                React –{' '}
                <a
                  href="https://react.dev"
                  className="text-sky-300 underline hover:text-sky-200"
                  target="_blank"
                  rel="noreferrer"
                >
                  react.dev
                </a>
              </li>
              <li>
                Django REST Framework –{' '}
                <a
                  href="https://www.django-rest-framework.org/"
                  className="text-sky-300 underline hover:text-sky-200"
                  target="_blank"
                  rel="noreferrer"
                >
                  django-rest-framework.org
                </a>
              </li>
              <li>
                Tailwind CSS –{' '}
                <a
                  href="https://tailwindcss.com"
                  className="text-sky-300 underline hover:text-sky-200"
                  target="_blank"
                  rel="noreferrer"
                >
                  tailwindcss.com
                </a>
              </li>
              <li>Google Maps API (for maps and location features, where applicable)</li>
              <li>Community resource data sourced from local non-profit and community directories</li>
            </ul>
          </div>

          <div className="bf-card p-5 md:p-6">
            <h2 className="text-xl font-semibold text-slate-100 mb-3">Copyright &amp; Permissions</h2>
            <p className="text-sm md:text-base text-slate-200/90">
              All original content is created by the development team and contributors. External
              libraries and services are used under their respective licenses.
            </p>
            <div className="mt-4 space-y-2">
              <a
                href="/copyright-checklist.pdf"
                className="inline-flex items-center text-sm md:text-base text-sky-300 underline hover:text-sky-200"
              >
                Download Student Copyright Checklist (PDF)
              </a>
              <br />
              <a
                href="/work-log.pdf"
                className="inline-flex items-center text-sm md:text-base text-sky-300 underline hover:text-sky-200"
              >
                Download Work Log (PDF)
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

