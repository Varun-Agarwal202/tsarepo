import React, { useEffect, useState, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faMapMarkerAlt, faStar, faSearch } from '@fortawesome/free-solid-svg-icons'
import RootLayout from '../layouts/RootLayout'
import { AuthContext } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'

const Directory = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useContext(AuthContext)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)
  const [bookmarkedIds, setBookmarkedIds] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState(null)
  const [radiusKm, setRadiusKm] = useState(10)
  const [nearOnly, setNearOnly] = useState(true)
  const [resources, setResources] = useState([])
  const [category, setCategory] = useState('')
  const [sortByCategory, setSortByCategory] = useState('')
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 }) // default to NYC
  const [selectedResource, setSelectedResource] = useState(null)
  const [selectedMapPin, setSelectedMapPin] = useState(null)
  const [mapListings, setMapListings] = useState([]) // Google Places results for map only
  const mapRef = useRef(null)
  const resourceRefs = useRef({})

  const effectiveLocation = userLocation ?? (() => {
    const stored = localStorage.getItem('userLocation')
    if (!stored) return null
    try { return JSON.parse(stored) } catch { return null }
  })()

  const requestLocation = () => {
    setLocationError(null)
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      setLocationLoading(false)
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
        setUserLocation(loc)
        localStorage.setItem('userLocation', JSON.stringify(loc))
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }) // Update center for map
        setLocationLoading(false)
      },
      (err) => {
        console.error('Location error:', err)
        setLocationError('Location unavailable. Turn on location to filter nearby results.')
        setLocationLoading(false)
      },
      { enableHighAccuracy: false, maximumAge: Infinity, timeout: 20000 }
    )
  }

  // Haversine distance in km
  const distanceKm = (a, b) => {
    const R = 6371
    const dLat = ((b.latitude - a.latitude) * Math.PI) / 180
    const dLon = ((b.longitude - a.longitude) * Math.PI) / 180
    const lat1 = (a.latitude * Math.PI) / 180
    const lat2 = (b.latitude * Math.PI) / 180
    const sinDLat = Math.sin(dLat / 2)
    const sinDLon = Math.sin(dLon / 2)
    const h =
      sinDLat * sinDLat +
      Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
  }

  // Load bookmarks if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const loadBookmarks = async () => {
        const token = localStorage.getItem('authToken')
        try {
          const res = await fetch('https://tsarepo-production.up.railway.app/api/user_bookmarks/', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Token ${token}` } : {}),
            },
            credentials: token ? undefined : 'include',
          })
          if (res.ok) {
            const json = await res.json()
            setBookmarkedIds(json.bookmarks || [])
          }
        } catch (err) {
          console.error('Error loading bookmarks:', err)
        }
      }
      loadBookmarks()
    }
  }, [isAuthenticated])

  // Load (or request) location once
  useEffect(() => {
    const stored = localStorage.getItem('userLocation')
    if (stored) {
      try { setUserLocation(JSON.parse(stored)) } catch { /* ignore */ }
      setLocationLoading(false)
      return
    }
    requestLocation()
  }, [])

  const getListings = async (q = '', type = '') => {
    setError(null)
    if (!isSearching) setLoading(true)
    try {
      // bookmarked businesses (per-user)
      if (type === 'bookmarks') {
        const token = localStorage.getItem('authToken')
        const res = await fetch('https://tsarepo-production.up.railway.app/api/user_bookmarks/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Token ${token}` } : {}),
          },
          credentials: token ? undefined : 'include',
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const placeIds = json.bookmarks || []

        // fetch full business objects for each bookmarked place_id
        const businesses = await Promise.all(
          placeIds.map(async (pid) => {
            try {
              const r = await fetch('https://tsarepo-production.up.railway.app/api/getBusiness/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ place_id: pid }),
              })
              if (!r.ok) return null
              return await r.json()
            } catch {
              return null
            }
          })
        )
        setListings(businesses.filter(Boolean))
        return
      }

      // normal search via backend
      const params = new URLSearchParams()
      if (q) params.append('q', q)
      const url = `https://tsarepo-production.up.railway.app/api/businesses/${params.toString() ? `?${params.toString()}` : ''}`

      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setListings(data)
    } catch (err) {
      console.error('Failed to load listings', err)
      setError('Failed to load results')
      setListings([])
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }

  const withDistance = (arr) => {
    if (!effectiveLocation) return arr.map(b => ({ ...b, _distanceKm: null }))
    return arr.map(b => {
      const lat = b?.latitude
      const lng = b?.longitude
      if (typeof lat !== 'number' || typeof lng !== 'number') return { ...b, _distanceKm: null }
      const d = distanceKm(effectiveLocation, { latitude: lat, longitude: lng })
      return { ...b, _distanceKm: d }
    })
  }

  // Helper function to check if a business matches a category
  const matchesCategory = (business, category) => {
    if (!category) return true
    const types = business.types || []
    const categoryLower = category.toLowerCase()
    
    // Map user-friendly category names to database types
    const categoryMap = {
      'non-profit': ['nonprofit', 'non_profit', 'non-profit', 'non_profit_organization'],
      'community event': ['event', 'community_event', 'community-event', 'community_events'],
      'support program': ['support', 'program', 'support_program', 'support-program', 'support_service'],
      'community service': ['service', 'community_service', 'community-service', 'community_services']
    }
    
    const searchTerms = categoryMap[categoryLower] || [categoryLower]
    
    // Check if any type matches any search term
    return searchTerms.some(term => 
      types.some(type => {
        const typeLower = type.toLowerCase()
        return typeLower === term || typeLower.includes(term) || term.includes(typeLower)
      })
    )
  }

  const applyNearFilterAndSort = (arr) => {
    const enriched = withDistance(arr)
    
    // Filter by category if selected
    let filtered = enriched
    if (sortByCategory) {
      filtered = enriched.filter(b => matchesCategory(b, sortByCategory))
    }
    
    if (nearOnly && effectiveLocation) {
      filtered = filtered
        .filter(b => b._distanceKm == null ? false : b._distanceKm <= radiusKm)
        .sort((a, b) => (a._distanceKm ?? 1e9) - (b._distanceKm ?? 1e9))
    } else if (effectiveLocation) {
      filtered = filtered.sort((a, b) => (a._distanceKm ?? 1e9) - (b._distanceKm ?? 1e9))
    }
    
    return filtered
  }

  const splitBookmarksFirst = (arr) => {
    if (!isAuthenticated || bookmarkedIds.length === 0) return { bookmarked: [], rest: arr }
    const bookmarked = []
    const rest = []
    for (const b of arr) {
      if (b?.place_id && bookmarkedIds.includes(b.place_id)) bookmarked.push(b)
      else rest.push(b)
    }
    return { bookmarked, rest }
  }

  useEffect(() => {
    // initial load
    getListings()
  }, [])

  const handleSearch = async () => {
    setIsSearching(true)
    await getListings(searchQuery.trim())
  }

  const addBookmark = async (placeId, e) => {
    e.stopPropagation()
    const already = bookmarkedIds.includes(placeId)
    setBookmarkedIds(prev => (already ? prev.filter(id => id !== placeId) : [...prev, placeId]))

    const token = localStorage.getItem('authToken')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Token ${token}`

    try {
      const res = await fetch('https://tsarepo-production.up.railway.app/api/add_bookmark/', {
        method: 'POST',
        headers,
        body: JSON.stringify({ business: placeId }),
      })
      if (!res.ok) throw new Error(`Bookmark request failed: ${res.status}`)
    } catch (err) {
      console.error('Bookmark error:', err)
      setBookmarkedIds(prev => (already ? [...prev, placeId] : prev.filter(id => id !== placeId)))
      if (!isAuthenticated) alert('Please log in to save bookmarks.')
    }
  }

  useEffect(() => {
    let url = 'https://tsarepo-production.up.railway.app/api/resources/?'
    if (category) url += `category=${category}&`
    fetch(url).then(r => r.json()).then(data => setResources(data.results || data))
  }, [category])

  // Fetch nearby businesses from Google Places when location/center changes
  useEffect(() => {
    if (!center) return
    
    const fetchNearbyBusinesses = async () => {
      try {
        const res = await fetch('https://tsarepo-production.up.railway.app/api/nearby_businesses/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: center.lat,
            longitude: center.lng,
            radius: radiusKm * 1000, // convert km to meters
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setMapListings(data.results || [])
        }
      } catch (err) {
        console.error('Failed to fetch nearby businesses for map:', err)
      }
    }

    fetchNearbyBusinesses()
  }, [center, radiusKm])

  // Scroll to resource when clicked from map
  const handlePinClick = (resource) => {
    setSelectedMapPin(resource.id)
    setSelectedResource(resource)
    // Scroll to the resource in the list
    if (resourceRefs.current[resource.id]) {
      resourceRefs.current[resource.id].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Highlight resource when clicked in list
  const handleResourceClick = (resource) => {
    setSelectedResource(resource)
    setSelectedMapPin(resource.id)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <RootLayout />
      <main className="bf-page-shell flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Business Directory
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Discover and explore local businesses in your area</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bf-card mb-8 p-6">
          {/* Near me controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNearOnly(v => !v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  nearOnly
                    ? 'bg-sky-500/20 border-sky-400/50 text-sky-700 dark:text-sky-200'
                    : 'bg-transparent border-slate-500/40 text-slate-700 dark:text-slate-300'
                }`}
                title="Toggle filtering to nearby results"
              >
                {nearOnly ? 'Near me: ON' : 'Near me: OFF'}
              </button>

              <div className="flex items-center gap-2">
                <label htmlFor="radius-km" className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Radius
                </label>
                <input
                  id="radius-km"
                  type="number"
                  min="1"
                  max="100"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value) || 1)}
                  className="bf-input w-24 py-2"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">km</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={requestLocation}
                className="bf-button-primary"
                disabled={locationLoading}
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}
              >
                {locationLoading ? 'Locating…' : 'Use my location'}
              </button>
              {locationError && (
                <span className="text-xs text-amber-600 dark:text-amber-300">
                  {locationError}
                </span>
              )}
              {!locationError && effectiveLocation && (
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Location ready
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            {/* Search Input */}
            <div className="flex-1 w-full md:w-auto">
              <label htmlFor="search-input" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Search Businesses
              </label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"
                />
        <input
                  id="search-input"
          type="text"
                  placeholder="Search by name, address, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                  className="bf-input pl-10 w-full"
                />
              </div>
            </div>

            {/* Category Sort Dropdown */}
            <div className="w-full md:w-auto">
              <label htmlFor="category-sort" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Sort by Category
              </label>
        <select
                id="category-sort"
                value={sortByCategory}
                onChange={(e) => setSortByCategory(e.target.value)}
                className="bf-input min-w-[200px]"
              >
                <option value="">All Categories</option>
                <option value="Non-Profit">Non-Profit</option>
                <option value="Community Event">Community Event</option>
                <option value="Support Program">Support Program</option>
                <option value="Community Service">Community Service</option>
        </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bf-button-primary whitespace-nowrap"
            >
              {isSearching ? 'Searching…' : 'Search'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div>
        {loading ? (
            <div className="bf-card p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading businesses...</p>
            </div>
        ) : error ? (
            <div className="bf-card p-6 bg-red-900/20 border-red-500/50">
              <p className="text-red-400">{error}</p>
            </div>
        ) : listings.length === 0 ? (
            <div className="bf-card p-12 text-center">
              <p className="text-slate-700 dark:text-slate-300 text-lg">No businesses found</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              {(() => {
                const nearFiltered = applyNearFilterAndSort(listings)
                const { bookmarked, rest } = splitBookmarksFirst(nearFiltered)
                const showBookmarksSection = isAuthenticated && bookmarked.length > 0

                return (
                  <>
                    {showBookmarksSection && (
                      <div className="mb-8">
                        <div className="flex items-end justify-between mb-3">
                          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Bookmarked
                          </h2>
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {bookmarked.length} saved
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {bookmarked.map((business) => {
                            const isBookmarked = true
                            return (
                              <div
                                key={`bm_${business.id || business.place_id}`}
                                onClick={() => navigate(`/business/${business.place_id}`)}
                                className="bf-card p-6 hover:scale-[1.02] transition-transform cursor-pointer group"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors flex-1 pr-2">
                                    {business.name}
                                  </h3>
                                  <button
                                    onClick={(e) => addBookmark(business.place_id, e)}
                                    className="text-gray-400 hover:text-yellow-400 transition-colors p-1"
                                    title="Remove bookmark"
                                  >
                                    <FontAwesomeIcon icon={faBookmark} className={isBookmarked ? 'text-yellow-400' : ''} />
                                  </button>
                                </div>

                                {typeof business._distanceKm === 'number' && (
                                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                    {business._distanceKm.toFixed(1)} km away
                                  </div>
                                )}

                                {business.address && (
                                  <div className="flex items-start gap-2 mb-3 text-gray-600 dark:text-gray-400 text-sm">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-0.5" />
                                    <span className="flex-1">{business.address}</span>
                                  </div>
                                )}

                                {business.rating && (
                                  <div className="flex items-center gap-2 mb-4">
                                    <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                                    <span className="text-slate-900 dark:text-white font-semibold">{business.rating}</span>
                                    {business.user_ratings_total && (
                                      <span className="text-gray-500 text-sm">
                                        ({business.user_ratings_total} {business.user_ratings_total === 1 ? 'review' : 'reviews'})
                                      </span>
                                    )}
                                  </div>
                                )}

                                {business.types && business.types.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {business.types.slice(0, 3).map((type, idx) => (
                                      <span key={idx} className="bf-pill">
                                        {type.replace(/_/g, ' ')}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <div className="text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                                  View Details →
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mb-4 text-gray-600 dark:text-gray-400">
                      Found <span className="font-semibold text-slate-900 dark:text-white">{nearFiltered.length}</span> {nearFiltered.length === 1 ? 'business' : 'businesses'}
                      {nearOnly && effectiveLocation && (
                        <span className="ml-2 text-xs text-slate-600 dark:text-slate-400">
                          within {radiusKm} km
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(showBookmarksSection ? rest : nearFiltered).map((business) => {
                        const isBookmarked = bookmarkedIds.includes(business.place_id)
                        return (
                          <div
                            key={business.id || business.place_id}
                            onClick={() => navigate(`/business/${business.place_id}`)}
                            className="bf-card p-6 hover:scale-[1.02] transition-transform cursor-pointer group"
                          >
                            {/* Header with bookmark */}
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors flex-1 pr-2">
                                {business.name}
                              </h3>
                              {isAuthenticated && (
                                <button
                                  onClick={(e) => addBookmark(business.place_id, e)}
                                  className="text-gray-400 hover:text-yellow-400 transition-colors p-1"
                                  title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                                >
                                  <FontAwesomeIcon
                                    icon={faBookmark}
                                    className={isBookmarked ? 'text-yellow-400' : ''}
                                  />
                                </button>
                              )}
                            </div>

                            {typeof business._distanceKm === 'number' && (
                              <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                {business._distanceKm.toFixed(1)} km away
                              </div>
                            )}

                            {/* Address */}
                            {business.address && (
                              <div className="flex items-start gap-2 mb-3 text-gray-600 dark:text-gray-400 text-sm">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-0.5" />
                                <span className="flex-1">{business.address}</span>
                              </div>
                            )}

                            {/* Rating */}
                            {business.rating && (
                              <div className="flex items-center gap-2 mb-4">
                                <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                                <span className="text-slate-900 dark:text-white font-semibold">{business.rating}</span>
                                {business.user_ratings_total && (
                                  <span className="text-gray-500 text-sm">
                                    ({business.user_ratings_total} {business.user_ratings_total === 1 ? 'review' : 'reviews'})
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Types/Categories */}
                            {business.types && business.types.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {business.types.slice(0, 3).map((type, idx) => (
                                  <span key={idx} className="bf-pill">
                                    {type.replace(/_/g, ' ')}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* View Details Link */}
                            <div className="text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                              View Details →
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )
              })()}
            </>
        )}
      </div>

      {/* Map Section - Always show map on the right */}
      <div className="h-full lg:block lg:w-1/2">
        <LoadScript googleMapsApiKey="AIzaSyCoxkur1IMrFgWYnTrdWANhisU2VBM9HaQ">
          <GoogleMap
            mapContainerStyle={{ height: "100%", width: "100%" }}
            center={center}
            zoom={15}
            ref={mapRef}
          >
            <Marker position={center} title="Your Location" />
            {mapListings.map((business) => (
              <Marker
                key={business.place_id}
                position={{ lat: business.geometry.location.lat, lng: business.geometry.location.lng }}
                onClick={() => handlePinClick(business)}
                icon={selectedMapPin === business.place_id ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' : undefined}
              />
            ))}
            {selectedMapPin && selectedResource && selectedResource.geometry && (
              <InfoWindow
                position={{ lat: selectedResource.geometry.location.lat, lng: selectedResource.geometry.location.lng }}
                onCloseClick={() => setSelectedMapPin(null)}
              >
                <div className="text-sm p-2">
                  <h4 className="font-bold">{selectedResource.name}</h4>
                  <p className="text-xs">{selectedResource.formatted_address}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
        </div>
      </main>
    </div>
  )
}

export default Directory