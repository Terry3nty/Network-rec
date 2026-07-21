'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchRecommendation, searchLocation, GeocodeResult } from '../../utils/api';
import RecommendationCard from '@/components/RecommendationCard';
import RankingList from '@/components/RankingList';
import LoadingAnimation from '@/components/LoadingAnimation';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Search,
  Navigation,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamic import of Leaflet Map to prevent SSR errors
const LeafletMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] w-full items-center justify-center rounded-2xl bg-input-bg border border-[var(--card-border)]">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  ),
});

function RecommendContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const isIPLocation = searchParams.get('source') === 'ip';

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    latParam && lngParam && !isNaN(parseFloat(latParam)) && !isNaN(parseFloat(lngParam))
      ? { lat: parseFloat(latParam), lng: parseFloat(lngParam) }
      : { lat: 7.2241, lng: 3.4497 } // Default to Osiele, Ogun State benchmark
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [geoError, setGeoError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [networkFilter, setNetworkFilter] = useState<'all' | 'carriers' | 'wifi'>('all');

  // Request browser geolocation with fallback to Osiele
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
        setCoords({ lat: latitude, lng: longitude });
        setNetworkFilter('all');
        setGeoError(null);
        setGpsLoading(false);
        router.push(`/recommend?lat=${latitude}&lng=${longitude}`);
      },
      (err) => {
        console.warn('Hardware GPS unavailable, reverting to Osiele benchmark...', err);
        setCoords({ lat: 7.2241, lng: 3.4497 });
        setNetworkFilter('all');
        setGeoError(null);
        setGpsLoading(false);
        router.push('/recommend?lat=7.2241&lng=3.4497');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [router]);

  // Synchronize URL parameters to react state
  useEffect(() => {
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        // Trigger coordinate update asynchronously to avoid state issues in render
        const timer = setTimeout(() => {
          setCoords({ lat, lng });
          setNetworkFilter('all');
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

  // Filtered providers based on selection
  const filteredProviders = data?.providers.filter((p) => {
    const name = p.name.toLowerCase();
    const isCarrier = ['mtn', 'airtel', 'glo', '9mobile'].includes(name);
    const isWifi = ['starlink', 'fiberone', 'spectranet', 'smile'].includes(name);
    if (networkFilter === 'carriers') return isCarrier;
    if (networkFilter === 'wifi') return isWifi;
    return true;
  }) || [];

  const recommendedProvider = filteredProviders.length > 0 ? filteredProviders[0].name : 'N/A';

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
      <div className="mx-auto max-w-[87.938rem] px-4 py-16 sm:px-6 lg:px-8 flex items-center justify-center min-h-[70vh]">
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
        <h2 className="text-2xl font-black text-foreground tracking-tight">Location Access Required</h2>
        <p className="mt-3 text-sm text-muted-txt max-w-md leading-relaxed">
          To rank the local mobile providers, please grant location access or search for your city name below.
        </p>

        {geoError && (
          <p className="mt-4 text-xs font-bold text-red-405 bg-red-955/10 p-3.5 rounded-xl border border-red-500/20">
            {geoError}
          </p>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={triggerGPS}
            className="flex items-center gap-2 rounded-2xl bg-orange-655 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-orange-600 border-0 cursor-pointer active:scale-98"
          >
            <Navigation size={16} />
            Try Accessing My GPS
          </button>
        </div>

        <div className="my-8 flex items-center justify-center gap-3 w-full max-w-md">
          <span className="h-px w-full bg-[var(--divider)]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-txt shrink-0">Or Search Manually</span>
          <span className="h-px w-full bg-[var(--divider)]" />
        </div>

        <form onSubmit={handleSearch} className="flex gap-2.5 w-full max-w-md relative">
          <input
            type="text"
            placeholder="Search by city e.g. Osiele..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow rounded-2xl bg-input-bg px-4 py-3.5 text-sm text-foreground placeholder-muted-txt outline-none focus:ring-1 focus:ring-orange-500/50 border border-[var(--card-border)]"
          />
          <button
            type="submit"
            disabled={searching}
            className="rounded-2xl bg-input-bg border border-[var(--card-border)] hover:bg-[var(--divider)] text-foreground px-4.5 transition-colors disabled:opacity-50 cursor-pointer"
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
                className="absolute left-0 top-full mt-2 z-50 w-full bg-card divide-y divide-[var(--divider)] rounded-2xl text-left overflow-hidden max-h-56 overflow-y-auto shadow-[var(--card-shadow)] border border-[var(--card-border)]"
              >
                {searchResults.map((res, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelectLocation(res)}
                    className="flex items-center justify-between px-4.5 py-3.5 text-sm text-foreground hover:bg-[var(--divider)] cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin size={14} className="text-muted-txt group-hover:text-orange-500 transition-colors shrink-0" />
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
        <h2 className="text-2xl font-black text-foreground tracking-tight">Recommendation Unavailable</h2>
        <p className="mt-3 text-sm text-muted-txt leading-relaxed max-w-md">
          {(apiError as Error).message || 'We could not fetch data for this region. Please verify your connection and try again.'}
        </p>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 rounded-xl bg-card border border-[var(--card-border)] px-5 py-3 text-sm font-semibold hover:bg-[var(--divider)] text-foreground transition-colors shadow-[var(--card-shadow)] cursor-pointer active:scale-98"
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
    <div className="mx-auto max-w-[87.938rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Search & Location Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-muted-txt mb-1 border-0">
            <span>Home</span>
            <ChevronRight size={11} />
            <span className="font-bold text-orange-500">Recommend</span>
          </nav>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2.5 tracking-tight">
            Coverage Analysis
            {isRefetching && <RefreshCw size={15} className="animate-spin text-orange-500" />}
          </h1>
        </div>

        {/* Search inline toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative">
          <button
            onClick={triggerGPS}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-input-bg border border-[var(--card-border)] px-4 py-2.5 text-sm font-bold text-foreground hover:bg-[var(--divider)] transition-colors cursor-pointer"
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
              className="rounded-xl bg-input-bg border border-[var(--card-border)] px-4 py-2.5 text-sm text-foreground placeholder-muted-txt outline-none focus:ring-1 focus:ring-orange-500/50 sm:w-60 transition-colors flex-grow"
            />
            <button
              type="submit"
              disabled={searching}
              className="rounded-xl bg-input-bg border border-[var(--card-border)] hover:bg-[var(--divider)] text-foreground px-3.5 transition-colors disabled:opacity-50 cursor-pointer"
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
                  className="absolute left-0 top-full mt-2.5 z-50 w-full bg-card divide-y divide-[var(--divider)] rounded-2xl text-left overflow-hidden max-h-56 overflow-y-auto shadow-[var(--card-shadow)] border border-[var(--card-border)]"
                >
                  {searchResults.map((res, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelectLocation(res)}
                      className="flex items-center justify-between px-4 py-3 text-xs text-foreground hover:bg-[var(--divider)] cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin size={13} className="text-muted-txt group-hover:text-orange-500 transition-colors shrink-0" />
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

      {/* IP Geolocation Fallback Warning Banner */}
      {isIPLocation && (
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-3.5 rounded-2xl bg-orange-500/5 border border-orange-500/15 p-4.5 text-xs sm:text-sm text-zinc-300 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <MapPin size={16} className="text-orange-500 shrink-0" />
            <span className="leading-relaxed">
              Showing rankings for your approximate **network IP location**. Mobile gateway routes can occasionally place you in a neighboring city.
            </span>
          </div>
          <button
            onClick={() => {
              const inputEl = document.querySelector('input[placeholder="Search other area..."]') as HTMLInputElement;
              if (inputEl) {
                inputEl.focus();
                inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="text-orange-500 hover:text-orange-400 font-extrabold underline shrink-0 cursor-pointer active:scale-98 transition-transform"
          >
            Correct Location Manually
          </button>
        </div>
      )}

      {/* Segment Switch Selector (Premium styling matching the dark orange aesthetic) */}
      {data && (
        <div className="mb-8 flex justify-center">
          <div className="relative flex rounded-2xl bg-zinc-900/60 p-1 border border-zinc-800/80 shadow-inner max-w-md w-full">
            {(['all', 'carriers', 'wifi'] as const).map((filter) => {
              const label =
                filter === 'all'
                  ? 'All Networks'
                  : filter === 'carriers'
                  ? 'Mobile'
                  : 'WiFi & ISPs';
              const isActive = networkFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setNetworkFilter(filter)}
                  className={`relative flex-1 py-2.5 px-3 text-xs font-bold rounded-xl cursor-pointer border-0 outline-none select-none text-center transition-colors duration-200 ${
                    isActive
                      ? 'bg-orange-655 text-white shadow-md font-extrabold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Results Grid */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Recommendations & Rankings */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {filteredProviders.length > 0 ? (
              <>
                <RecommendationCard
                  location={data.location}
                  recommended={recommendedProvider}
                  providers={filteredProviders}
                />
                <RankingList providers={filteredProviders} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/60 rounded-3xl border border-zinc-800/80 text-center min-h-[220px] shadow-lg">
                <AlertCircle className="h-10 w-10 text-orange-500 mb-3 animate-pulse" />
                <h4 className="text-white font-extrabold text-base">No Operators Found</h4>
                <p className="text-zinc-500 text-xs mt-1.5 max-w-xs leading-relaxed">
                  There are no active {networkFilter === 'carriers' ? 'mobile carriers' : 'WiFi ISPs'} detected in this zone.
                </p>
              </div>
            )}
          </div>

          {/* Right Panel: Map */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="rounded-3xl bg-card p-5 shadow-[var(--card-shadow)] border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-4.5">
                <div>
                  <h3 className="text-base font-extrabold text-foreground tracking-tight">Geographic Map</h3>
                  <p className="text-[10px] font-bold text-muted-txt uppercase tracking-wider mt-0.5">
                    Signal Coverage Visualizer
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-muted-txt font-bold uppercase tracking-wider block">Coords</span>
                  <span className="text-xs font-mono font-bold text-foreground bg-input-bg border border-[var(--card-border)] px-2 py-0.5 rounded-md shadow-inner">
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
      <div className="mx-auto max-w-[87.938rem] px-4 py-16 sm:px-6 lg:px-8 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <Loader2 size={32} className="animate-spin text-orange-500 mb-2" />
          <span className="text-muted-txt text-sm font-bold">Initializing views...</span>
        </div>
      </div>
    }>
      <RecommendContent />
    </Suspense>
  );
}
