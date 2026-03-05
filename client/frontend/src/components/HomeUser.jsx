import React, { useEffect, useState, useContext } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { TfiNewWindow } from "react-icons/tfi";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faMapMarkerAlt, faTimes } from '@fortawesome/free-solid-svg-icons'
import { AuthContext } from '../context/AuthContext';

const DEFAULT_LOCATION = { latitude: 51.5074, longitude: -0.1278 };

const HomeUser = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState(() => {
    const stored = localStorage.getItem('manualLocation');
    return stored ? JSON.parse(stored) : null;
  });
  const [manualLocationAddress, setManualLocationAddress] = useState(() => {
    return localStorage.getItem('manualLocationAddress') || '';
  });
  const [showManualLocationInput, setShowManualLocationInput] = useState(false);
  const [manualLocationInput, setManualLocationInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [nearbyBusinesses, setNearbyBusinesses] = useState([]);
  const [radius, setRadius] = useState(() => {
    const stored = localStorage.getItem('userRadius');
    return stored ? Number(stored) : 10;
  });
  const [locationError, setLocationError] = useState(null);

  // computed effective location: prioritize manual location > userLocation (geolocation/localStorage)
  const effectiveLocation = manualLocation || userLocation;
  
  const { isAuthenticated, user } = useContext(AuthContext);
  
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  // NEW: state for custom text query
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadBookmarks = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const res = await fetch('http://localhost:8000/api/user_bookmarks/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Token ${token}` } : {}),
          },
          credentials: token ? undefined : 'include',
        });
        if (res.ok) {
          const json = await res.json();
          console.log('Loaded bookmarks:', json);
          setBookmarkedIds(json.bookmarks || []);
        } else {
          setBookmarkedIds([]); 
        }
      } catch (err) {
        console.error('Error loading bookmarks:', err);
        setBookmarkedIds([]);
      }
    };
    loadBookmarks();
  }, [isAuthenticated, user]);
  
  useEffect(() => {
    if (user?.id) localStorage.setItem(`bookmarks_${user.id}`, JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds, user]);

  const navigate = useNavigate();

  // Geocode an address to get coordinates
  const geocodeAddress = async (address) => {
    if (!address.trim()) return null;
    
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyCoxkur1IMrFgWYnTrdWANhisU2VBM9HaQ`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const coords = { latitude: location.lat, longitude: location.lng };
        setManualLocation(coords);
        setManualLocationAddress(data.results[0].formatted_address);
        localStorage.setItem('manualLocation', JSON.stringify(coords));
        localStorage.setItem('manualLocationAddress', data.results[0].formatted_address);
        // Dispatch event to notify CommunitySpotlight
        window.dispatchEvent(new CustomEvent('manualLocationChanged', { detail: { location: coords } }));
        setLocationError(null);
        setShowManualLocationInput(false);
        setManualLocationInput('');
        return coords;
      } else {
        setLocationError(`Could not find location: ${data.status}`);
        return null;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setLocationError('Error looking up address. Please try again.');
      return null;
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSetManualLocation = () => {
    geocodeAddress(manualLocationInput);
  };

  const clearManualLocation = () => {
    setManualLocation(null);
    setManualLocationAddress('');
    localStorage.removeItem('manualLocation');
    localStorage.removeItem('manualLocationAddress');
    // If we had a userLocation, it will now be used
    if (!userLocation) {
      requestLocation();
    }
  };

  const requestLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      // Fall back to localStorage if geolocation is not supported
      const stored = localStorage.getItem("userLocation");
      if (stored) {
        try {
          setUserLocation(JSON.parse(stored));
        } catch (_) {}
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const loc = { latitude, longitude };
        setUserLocation(loc);
        localStorage.setItem("userLocation", JSON.stringify(loc));
        setLocationError(null);
        setLoading(false);
      },
      (error) => {
        console.error("Error obtaining location:", error);
        // Fall back to localStorage if geolocation fails
        const stored = localStorage.getItem("userLocation");
        if (stored) {
          try {
            setUserLocation(JSON.parse(stored));
            setLocationError("Using previously saved location. Allow location access for more accurate results.");
          } catch (_) {
            setLocationError("Location unavailable. Allow location in your browser to see nearby businesses.");
          }
        } else {
          setLocationError("Location unavailable. Allow location in your browser to see nearby businesses.");
        }
        setLoading(false);
      },
      { enableHighAccuracy: false, maximumAge: Infinity, timeout: 20000 }
    );
  };

  // Request location on mount - try geolocation first, fall back to localStorage if it fails
  useEffect(() => {
    requestLocation();
  }, []);

  // call getNearby only after we know whether we have a location
  // Priority: manualLocation > userLocation > DEFAULT_LOCATION
  useEffect(() => {
    const locToUse = effectiveLocation;
    if (locToUse) {
      getNearby(locToUse);
      return;
    }
    // if we've finished trying to get location and none available, use default
    if (!loading && !effectiveLocation) {
      getNearby(DEFAULT_LOCATION);
    }
  }, [effectiveLocation, loading, filter, radius]);

  // updated: accept optional text query (uses Places Text Search when provided)
  const getNearby = async (location = effectiveLocation, { query } = {}) => {
    if (!location) return;
    try {
      setIsSearching(true);
      const body = {
        lat: location.latitude,
        lng: location.longitude,
        radius,
      };
      if (query) body.query = query;
      else if (filter) body.type = filter;

      const response = await fetch('http://localhost:8000/api/nearby_businesses/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      console.log('Nearby Businesses (raw):', data);

      // Normalize response: accept either an array or an object with `results`
      const normalized = Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : []);
      setNearbyBusinesses(normalized);
    } catch (error) {
      console.error('Error fetching nearby businesses:', error);
      setNearbyBusinesses([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Simple bookmark toggle (works without auth, saves to localStorage)
  const addBookmark = (placeId) => {
    const already = bookmarkedIds.includes(placeId);
    setBookmarkedIds(prev => (already ? prev.filter(id => id !== placeId) : [...prev, placeId]));
  };

  const center = effectiveLocation
    ? { lat: effectiveLocation.latitude, lng: effectiveLocation.longitude }
    : null;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        {/* Manual Location Button */}
        <button
          onClick={() => setShowManualLocationInput(true)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800/60 border border-slate-600 text-sm text-slate-200 hover:bg-slate-700/60 hover:border-sky-500/50 transition-colors"
          title="Set a custom location"
        >
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          {manualLocationAddress ? `Location: ${manualLocationAddress.substring(0, 20)}...` : 'Set Location'}
        </button>

        {manualLocation && (
          <button
            onClick={clearManualLocation}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md bg-slate-700/60 text-xs text-slate-300 hover:bg-slate-600/60 transition-colors"
            title="Clear manual location and use your current location"
          >
            <FontAwesomeIcon icon={faTimes} />
            Clear
          </button>
        )}

        <div className="flex items-center gap-2">
          <label htmlFor="business-type" className="text-xs font-medium text-slate-300 uppercase tracking-wide">
            Type
          </label>
          <select
            onChange={(e) => setFilter(e.target.value)}
            id="business-type"
            value={filter}
            className="min-w-[11rem] rounded-md border border-slate-600 bg-slate-900/60 px-2.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="restaurant">Restaurants</option>
            <option value="cafe">Cafes</option>
            <option value="bar">Bars</option>
            <option value="park">Parks</option>
            <option value="museum">Museums</option>
            <option value="gym">Gyms</option>
            <option value="hospital">Hospitals</option>
            <option value="pharmacy">Pharmacies</option>
            <option value="supermarket">Supermarkets</option>
            <option value="shopping_mall">Shopping Malls</option>
            <option value="movie_theater">Theaters</option>
            <option value="library">Libraries</option>
            <option value="bank">Banks</option>
            <option value="post_office">Post Offices</option>
            <option value="gas_station">Gas Stations</option>
            <option value="lodging">Hotels</option>
            <option value="custom">Custom text query…</option>
          </select>
        </div>

        {filter === 'custom' && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder='e.g. "pizza near Seattle" or "123 Main St"'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-md border border-slate-600 bg-slate-900/60 px-2.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <button
              onClick={() => getNearby(effectiveLocation, { query: searchQuery })}
              disabled={!searchQuery.trim() || isSearching}
              className="inline-flex items-center rounded-md bg-sky-500 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-70"
            >
              {isSearching ? 'Searching…' : 'Search'}
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label htmlFor="radius" className="text-xs font-medium text-slate-300 uppercase tracking-wide">
            Radius (km)
          </label>
          <input
            type="text"
            id="radius"
            value={radius}
            onChange={(e) => {
              const newRadius = Number(e.target.value);
              setRadius(newRadius);
              localStorage.setItem('userRadius', newRadius.toString());
              // Dispatch custom event to notify CommunitySpotlight
              window.dispatchEvent(new CustomEvent('radiusChanged', { detail: { radius: newRadius } }));
            }}
            className="w-20 rounded-md border border-slate-600 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Map + list */}
      <div className="mt-2 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
        <div className="bf-card h-[380px] md:h-[420px] overflow-hidden">
          {center ? (
            <div className="h-full w-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-400">
                  {locationError
                    ? <span className="text-amber-300">{locationError}</span>
                    : manualLocation
                    ? `Showing places around ${manualLocationAddress || 'your selected location'}.`
                    : 'Showing places around your location.'}
                </div>
                {!effectiveLocation && !loading && (
                  <button
                    type="button"
                    onClick={requestLocation}
                    className="px-3 py-1.5 rounded-md bg-sky-500 text-xs font-medium text-slate-950 hover:bg-sky-400"
                  >
                    Use my location
                  </button>
                )}
              </div>
              <div className="flex-1 rounded-xl overflow-hidden">
                <LoadScript googleMapsApiKey="AIzaSyCoxkur1IMrFgWYnTrdWANhisU2VBM9HaQ">
                  <GoogleMap mapContainerStyle={{ height: "100%", width: "100%" }} center={center} zoom={15}>
                    <Marker position={center} />
                    {nearbyBusinesses.map((business, index) =>
                      business.geometry?.location?.lat && business.geometry?.location?.lng ? (
                        <Marker key={index} position={{ lat: business.geometry.location.lat, lng: business.geometry.location.lng }} />
                      ) : null
                    )}
                  </GoogleMap>
                </LoadScript>
              </div>
            </div>
          ) : loading ? (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              Getting your location…
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              Location not available.
            </div>
          )}
        </div>

        <div className="bf-card h-[380px] md:h-[420px] p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-100">Nearby businesses</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <label htmlFor="sort-dropdown">Sort by</label>
              <select
                id="sort-dropdown"
                onChange={(e) => {
                  const sortBy = e.target.value;
                  const sortedBusinesses = [...nearbyBusinesses];
                  if (sortBy === 'name') {
                    sortedBusinesses.sort((a, b) => a.name.localeCompare(b.name));
                  } else if (sortBy === 'rating') {
                    sortedBusinesses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                  }
                  setNearbyBusinesses(sortedBusinesses);
                }}
                className="rounded-md border border-slate-600 bg-slate-900/80 px-2 py-1 text-xs text-slate-100"
              >
                <option value="">Default</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          <ul className="space-y-2 overflow-y-auto bf-scroll-soft text-sm flex-1 pr-1">
            {nearbyBusinesses.map((business, index) => {
              const isBookmarked = bookmarkedIds.includes(business.place_id);
              return (
                <li
                  key={index}
                  className="relative rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-2.5 hover:border-sky-500/70 transition-colors"
                >
                  <button
                    className="absolute right-2 top-2"
                    onClick={() => addBookmark(business.place_id)}
                    aria-pressed={isBookmarked}
                    title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <FontAwesomeIcon icon={faBookmark} style={{ color: isBookmarked ? '#facc15' : '#64748b' }} />
                  </button>
                  <div className="pr-7">
                    <div className="font-semibold text-slate-100">{business.name}</div>
                    <div className="text-xs text-slate-400">{business.vicinity}</div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                      <span>Rating: {business.rating ? business.rating : 'N/A'}</span>
                      <button
                        className="inline-flex items-center gap-1 rounded-md bg-sky-500/90 px-2 py-1 text-[11px] font-medium text-slate-950 hover:bg-sky-400"
                        onClick={() => {
                          const id = business.place_id;
                          navigate(`/business/${id}`);
                        }}
                      >
                        View
                        <TfiNewWindow style={{ verticalAlign: 'middle' }} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Manual Location Input Modal */}
      {showManualLocationInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bf-card p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Set Custom Location</h3>
              <button
                onClick={() => {
                  setShowManualLocationInput(false);
                  setManualLocationInput('');
                  setLocationError(null);
                }}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="location-input" className="block text-sm font-medium text-slate-300 mb-2">
                  Enter an address or location
                </label>
                <input
                  id="location-input"
                  type="text"
                  value={manualLocationInput}
                  onChange={(e) => setManualLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isGeocoding) {
                      handleSetManualLocation();
                    }
                  }}
                  placeholder="e.g., 123 Main St, New York, NY or Seattle, WA"
                  className="w-full px-3 py-2 rounded-md border border-slate-600 bg-slate-900/60 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  disabled={isGeocoding}
                />
                <p className="mt-1 text-xs text-slate-400">
                  Enter a full address, city name, or landmark
                </p>
              </div>

              {locationError && (
                <div className="text-sm text-amber-300 bg-amber-900/20 border border-amber-800 rounded-md p-2">
                  {locationError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleSetManualLocation}
                  disabled={!manualLocationInput.trim() || isGeocoding}
                  className="flex-1 px-4 py-2 rounded-md bg-sky-500 text-sm font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeocoding ? 'Looking up...' : 'Set Location'}
                </button>
                <button
                  onClick={() => {
                    setShowManualLocationInput(false);
                    setManualLocationInput('');
                    setLocationError(null);
                  }}
                  className="px-4 py-2 rounded-md border border-slate-600 bg-slate-800/60 text-sm font-medium text-slate-300 hover:bg-slate-700/60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeUser;
