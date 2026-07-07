'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, AlertCircle, Search, ChevronRight, RefreshCw, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRecommendation, searchLocation, GeocodeResult } from '../../utils/api';
import LoadingAnimation from '@/components/LoadingAnimation';
import RecommendationCard from '@/components/RecommendationCard';
import RankingList from '@/components/RankingList';

// Dynamically import Leaflet Map to avoid SSR errors
const LeafletMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-900 rounded-2xl min-h-[300px] md:min-h-[400px] shadow-inner animate-pulse">
      <span className="text-xs text-zinc-500 font-bold">Booting map renderer...</span>
    </div>
  ),
});

function RecommendContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Request browser geolocation
  const triggerGPS = useCallback(() => {
    setGpsLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsLoading(false);
        router.push(`/recommend?lat=${latitude}&lng=${longitude}`);
      },
      (err) => {
        console.error('GPS error:', err);
        let msg = 'Could not access geolocation sensor.';
        if (err.code === 1) {
          msg = 'Location permission was denied. Please search manually below.';
        }
        setGeoError(msg);
        setGpsLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000 }
    );
  }, [router]);

  // Sync coords state with URL search parameters
  useEffect(() => {
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        const timer = setTimeout(() => {
          setCoords({ lat, lng });
          setGeoError(null);
        }, 0);
        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => {
        triggerGPS();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [latParam, lngParam, triggerGPS]);

  // React Query recommendation call
  const {
    data,
    isLoading,
    error: apiError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['recommendation', coords?.lat, coords?.lng],
    queryFn: () => {
      if (!coords) throw new Error('No coordinates specified.');
      return fetchRecommendation(coords.lat, coords.lng);
    },
    enabled: !!coords,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await searchLocation(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectLocation = (loc: GeocodeResult) => {
    setSearchResults([]);
    setSearchQuery('');
    router.push(`/recommend?lat=${loc.lat}&lng=${loc.lon}`);
  };

  // 1. loading geolocator state (when no url params and requesting GPS)
  if (gpsLoading || (isLoading && !data)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex items-center justify-center min-h-[70vh]">
        <LoadingAnimation customLocation={data?.location} />
      </div>
    );
  }

  // 2. error state (GPS permission denied and no url params)
  if (!coords) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 mb-6 border-0 shadow-md animate-pulse">
          <MapPin size={28} />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Location Access Required</h2>
        <p className="mt-3 text-sm text-zinc-400 max-w-md leading-relaxed">
          To rank the local mobile providers, please grant location access or search for your city name below.
        </p>

        {geoError && (
          <p className="mt-4 text-xs font-bold text-red-400 bg-red-950/20 p-3 rounded-xl border-0">
            {geoError}
          </p>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={triggerGPS}
            className="flex items-center gap-2 rounded-2xl bg-orange-650 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-orange-600 border-0 cursor-pointer active:scale-98"
          >
            <Navigation size={16} />
            Try Accessing My GPS
          </button>
        </div>

        <div className="my-8 flex items-center justify-center gap-3 w-full max-w-md">
          <span className="h-px w-full bg-zinc-800/80" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 shrink-0">Or Search Manually</span>
          <span className="h-px w-full bg-zinc-800/80" />
        </div>

        <form onSubmit={handleSearch} className="flex gap-2.5 w-full max-w-md relative">
          <input
            type="text"
            placeholder="Search by city e.g. Osiele..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow rounded-2xl bg-zinc-900 px-4 py-3.5 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-orange-500/50 border-0"
          />
          <button
            type="submit"
            disabled={searching}
            className="rounded-2xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white px-4.5 border-0 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Search size={18} />
          </button>

          {/* Search Dropdown inside manual location search */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute left-0 top-full mt-2 z-50 w-full bg-zinc-900 divide-y divide-zinc-800 rounded-2xl text-left overflow-hidden max-h-56 overflow-y-auto shadow-2xl border-0"
              >
                {searchResults.map((res, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelectLocation(res)}
                    className="flex items-center justify-between px-4.5 py-3.5 text-sm text-zinc-300 hover:bg-zinc-800/50 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin size={14} className="text-zinc-500 group-hover:text-orange-500 transition-colors shrink-0" />
                      <span className="truncate pr-2">{res.display_name}</span>
                    </div>
                    <ChevronRight size={12} className="text-zinc-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </form>
      </div>
    );
  }

  // 3. API Error Fallback
  if (apiError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/20 text-red-400 mb-6 border-0 shadow-md">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Recommendation Unavailable</h2>
        <p className="mt-3 text-sm text-zinc-450 leading-relaxed max-w-md">
          {(apiError as Error).message || 'We could not fetch data for this region. This happens when the coordinates are outside supported coverage maps.'}
        </p>
        <p className="mt-4 text-xs font-bold text-orange-500 bg-orange-500/10 px-3.5 py-1.5 rounded-full border-0 shadow-sm">
          Seeded: Osiele, Computer Village, Lekki, UI Area, Wuse II, Independent Layout.
        </p>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold hover:bg-zinc-800 text-zinc-300 transition-colors border-0 cursor-pointer active:scale-98"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl bg-orange-655 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 shadow-lg shadow-orange-650/10 transition-colors border-0 cursor-pointer active:scale-98"
          >
            <RefreshCw size={15} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search & Location Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1 border-0">
            <span>Home</span>
            <ChevronRight size={11} />
            <span className="font-bold text-orange-500">Recommend</span>
          </nav>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5 tracking-tight">
            Coverage Analysis
            {isRefetching && <RefreshCw size={15} className="animate-spin text-orange-500" />}
          </h1>
        </div>

        {/* Search inline toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative">
          <button
            onClick={triggerGPS}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors border-0 cursor-pointer"
          >
            <Navigation size={13} />
            Locate Me
          </button>

          <form onSubmit={handleSearch} className="flex gap-2 flex-grow sm:flex-none relative">
            <input
              type="text"
              placeholder="Search other area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-orange-500/50 sm:w-60 transition-colors border-0 flex-grow"
            />
            <button
              type="submit"
              disabled={searching}
              className="rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white px-3.5 border-0 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Search size={15} />
            </button>

            {/* Search Dropdown inside Result Page Form (Resolves mobile overlap) */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 top-full mt-2.5 z-50 w-full bg-zinc-900 divide-y divide-zinc-800 rounded-2xl text-left overflow-hidden max-h-56 overflow-y-auto shadow-2xl border-0"
                >
                  {searchResults.map((res, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelectLocation(res)}
                      className="flex items-center justify-between px-4 py-3 text-xs text-zinc-300 hover:bg-zinc-800/50 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin size={13} className="text-zinc-500 group-hover:text-orange-500 transition-colors shrink-0" />
                        <span className="truncate pr-1">{res.display_name}</span>
                      </div>
                      <ChevronRight size={12} className="text-zinc-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>

      {/* Main Results Grid */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Recommendations & Rankings */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <RecommendationCard
              location={data.location}
              recommended={data.recommended}
              providers={data.providers}
            />
            <RankingList providers={data.providers} />
          </div>

          {/* Right Panel: Map */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="rounded-3xl bg-zinc-900/60 p-5 shadow-2xl backdrop-blur-md border-0">
              <div className="flex items-center justify-between mb-4.5">
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">Geographic Map</h3>
                  <p className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider mt-0.5">
                    Signal Coverage Visualizer
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Coords</span>
                  <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded-md border-0 shadow-inner">
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </span>
                </div>
              </div>
              <LeafletMap
                latitude={coords.lat}
                longitude={coords.lng}
                locationName={data.location}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecommendPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <Loader2 size={32} className="animate-spin text-orange-500 mb-2" />
          <span className="text-zinc-500 text-sm font-bold">Initializing views...</span>
        </div>
      </div>
    }>
      <RecommendContent />
    </Suspense>
  );
}
