import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RootLayout from '../layouts/RootLayout'

const Contact = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    submitter_name: '',
    submitter_email: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    try {
      const res = await fetch('https://tsarepo-production.up.railway.app/api/submissions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('Thank you! Your resource submission has been received and will be reviewed.')
        setFormData({
          name: '',
          category: '',
          description: '',
          phone: '',
          email: '',
          address: '',
          website: '',
          submitter_name: '',
          submitter_email: '',
        })
      } else {
        setError(data.error || 'Failed to submit resource. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
      console.error('Submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <RootLayout />
      <main className="bf-page-shell flex-1 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-slate-50">
          Suggest a Community Resource
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Know of a community resource that should be featured? Submit it below and we'll review it for inclusion in our directory.
        </p>

        {message && (
          <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-700/50 rounded-lg text-emerald-300 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-950/40 border border-rose-700/50 rounded-lg text-rose-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bf-card p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-slate-300 uppercase tracking-wide mb-2">
              Resource Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Community Food Bank"
              required
              className="bf-input w-full"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-xs font-medium text-slate-300 uppercase tracking-wide mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="bf-input w-full"
            >
              <option value="">Select Category</option>
              <option value="nonprofit">Non-Profit Organization</option>
              <option value="support">Support Service</option>
              <option value="event">Community Event</option>
              <option value="program">Community Program</option>
              <option value="health">Health & Wellness</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-medium text-slate-300 uppercase tracking-wide mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this resource offers..."
              required
              rows={4}
              className="bf-input w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-xs font-medium text-slate-300 uppercase tracking-wide mb-2">
                Phone (optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                className="bf-input w-full"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-300 uppercase tracking-wide mb-2">
                Resource Email (optional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="resource@example.com"
                className="bf-input w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-xs font-medium text-slate-300 uppercase tracking-wide mb-2">
              Address (optional)
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, City, State"
              className="bf-input w-full"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-xs font-medium text-slate-300 uppercase tracking-wide mb-2">
              Website (optional)
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="bf-input w-full"
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="submitter_name" className="block text-xs font-medium text-slate-300 uppercase tracking-wide mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="submitter_name"
                  name="submitter_name"
                  value={formData.submitter_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="bf-input w-full"
                />
              </div>

              <div>
                <label htmlFor="submitter_email" className="block text-xs font-medium text-slate-300 uppercase tracking-wide mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="submitter_email"
                  name="submitter_email"
                  value={formData.submitter_email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="bf-input w-full"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bf-button-primary w-full mt-6"
          >
            {submitting ? 'Submitting...' : 'Submit Resource'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default Contact
