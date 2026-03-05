import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CommunitySpotlight = () => {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Get location and radius from localStorage - prioritize manualLocation over userLocation
        const manualLoc = localStorage.getItem('manualLocation')
        const userLoc = localStorage.getItem('userLocation')
        const storedLocation = manualLoc || userLoc // Use manual location if available, otherwise user location
        const storedRadius = localStorage.getItem('userRadius') || '10'
        
        let url = 'https://tsarepo-production.up.railway.app/api/resources/featured/'
        
        if (storedLocation) {
          try {
            const location = JSON.parse(storedLocation)
            const params = new URLSearchParams({
              latitude: location.latitude.toString(),
              longitude: location.longitude.toString(),
              radius: storedRadius
            })
            url += `?${params.toString()}`
          } catch (e) {
            // If parsing fails, use default URL without params
            console.error('Error parsing stored location:', e)
          }
        }
        
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setFeatured(data)
        }
      } catch (err) {
        console.error('Error fetching featured resources:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFeatured()
    
    // Refetch when location or radius changes in localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'userLocation' || e.key === 'manualLocation' || e.key === 'userRadius') {
        fetchFeatured()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom event when radius changes (since storage event only fires in other tabs)
    // Use a custom event that HomeUser can dispatch
    const handleCustomStorageChange = () => {
      fetchFeatured()
    }
    
    window.addEventListener('radiusChanged', handleCustomStorageChange)
    
    // Also listen for manual location changes via custom event
    window.addEventListener('manualLocationChanged', handleCustomStorageChange)
    
    // Poll for changes every 3 seconds (less frequent to reduce load)
    const interval = setInterval(() => {
      fetchFeatured()
    }, 3000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('radiusChanged', handleCustomStorageChange)
      window.removeEventListener('manualLocationChanged', handleCustomStorageChange)
      clearInterval(interval)
    }
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        <p className="mt-2 text-sm text-slate-400">Loading featured resources...</p>
      </div>
    )
  }

  if (featured.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-slate-400">No featured resources yet. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Community Spotlight</h3>
      <div className="space-y-3">
        {featured.map((resource) => (
          <div
            key={resource.id || resource.place_id}
            onClick={() => navigate(`/business/${resource.place_id}`)}
            className="p-4 rounded-lg border border-slate-700/70 bg-slate-900/70 hover:border-sky-500/70 hover:bg-slate-800/70 transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              {resource.photo && (
                <img
                  src={resource.photo}
                  alt={resource.name}
                  className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-100 group-hover:text-sky-300 transition-colors truncate">
                  {resource.name}
                </h4>
                <p className="text-xs text-sky-400 mb-1">{resource.category}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{resource.description}</p>
                {resource.rating && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-yellow-400 text-xs">⭐</span>
                    <span className="text-xs text-slate-400">{resource.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate('/directory')}
        className="w-full mt-4 px-4 py-2 text-sm font-medium text-sky-300 border border-sky-500/50 rounded-lg hover:bg-sky-500/10 transition-colors"
      >
        View All Resources →
      </button>
    </div>
  )
}

export default CommunitySpotlight