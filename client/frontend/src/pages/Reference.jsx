import React from 'react';
import RootLayout from '../layouts/RootLayout';

export default function Reference() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <RootLayout />
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Reference Page</h1>

        <section className="mt-6">
          <h2 className="text-2xl font-bold">Sources & Attribution</h2>
          <ul className="mt-4 space-y-2">
            <li>React - https://react.dev</li>
            <li>Django REST Framework - https://www.django-rest-framework.org/</li>
            <li>Tailwind CSS - https://tailwindcss.com</li>
            <li>Google Maps API (if used for location data)</li>
            <li>Community resource data sourced from local non-profit directories</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-2xl font-bold">Copyright & Permissions</h2>
          <p>All original content created by the development team.</p>
          <p className="mt-4">
            <a href="/copyright-checklist.pdf" className="text-blue-500 underline">
              Download Student Copyright Checklist (PDF)
            </a>
          </p>
          <p className="mt-2">
            <a href="/work-log.pdf" className="text-blue-500 underline">
              Download Work Log (PDF)
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}

