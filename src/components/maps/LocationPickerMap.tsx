import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
  createMapIcon,
} from './mapUtils';
import {
  searchAddress,
  reverseGeocode,
  getBrowserCurrentPosition,
} from '../../services/geoService';
import { GeocodingResult } from '../../types';
import {
  MapPin,
  Search,
  Crosshair,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Navigation2,
  Sparkles,
} from 'lucide-react';

interface LocationPickerMapProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onConfirmLocation: (loc: {
    address: string;
    lat: number;
    lng: number;
    city?: string;
  }) => void;
  title?: string;
  helperText?: string;
  confirmButtonText?: string;
  roleTheme?: 'donor' | 'ngo' | 'volunteer';
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  initialLat,
  initialLng,
  initialAddress = '',
  onConfirmLocation,
  title = 'Select Food Pickup Location',
  helperText = 'Search your address, click on the map, or drag the marker to your exact dispatch point.',
  confirmButtonText = 'Confirm Pickup Location',
  roleTheme = 'donor',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [lat, setLat] = useState<number>(
    initialLat && !isNaN(initialLat) ? initialLat : DEFAULT_MAP_CENTER[0]
  );
  const [lng, setLng] = useState<number>(
    initialLng && !isNaN(initialLng) ? initialLng : DEFAULT_MAP_CENTER[1]
  );
  const [address, setAddress] = useState<string>(initialAddress);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: DEFAULT_MAP_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    // Initial marker
    const icon = createMapIcon({
      role: roleTheme,
      isDraggable: true,
      pulsing: true,
      label: 'Drag to adjust point',
    });

    const marker = L.marker([lat, lng], {
      icon,
      draggable: true,
    }).addTo(map);

    // Marker drag end event
    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      setLat(pos.lat);
      setLng(pos.lng);
      setIsConfirmed(false);
      setIsGeocoding(true);
      const resolved = await reverseGeocode(pos.lat, pos.lng);
      setAddress(resolved);
      setIsGeocoding(false);
      setStatusMessage({
        text: 'Marker moved. Address updated.',
        type: 'info',
      });
    });

    // Map click event
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      marker.setLatLng([clickLat, clickLng]);
      setLat(clickLat);
      setLng(clickLng);
      setIsConfirmed(false);
      setIsGeocoding(true);
      const resolved = await reverseGeocode(clickLat, clickLng);
      setAddress(resolved);
      setIsGeocoding(false);
      setStatusMessage({
        text: 'Location set at clicked point.',
        type: 'info',
      });
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Invalidate size once rendered inside layout
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Sync marker position if coordinates change externally
  const updateMapPosition = (newLat: number, newLng: number, zoom = 15) => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      mapInstanceRef.current.flyTo([newLat, newLng], zoom, {
        duration: 1.2,
      });
    }
    setLat(newLat);
    setLng(newLng);
    setIsConfirmed(false);
  };

  // Address search via Nominatim
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setStatusMessage(null);
    try {
      const results = await searchAddress(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setStatusMessage({
          text: `No locations found matching "${searchQuery}". Try adding a city name.`,
          type: 'error',
        });
      }
    } catch {
      setStatusMessage({
        text: 'Search service momentarily unavailable. Please click your position on the map.',
        type: 'error',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (res: GeocodingResult) => {
    setAddress(res.displayName);
    updateMapPosition(res.lat, res.lng, 16);
    setSearchResults([]);
    setSearchQuery('');
    setStatusMessage({
      text: `Location mapped to ${res.displayName.split(',')[0]}`,
      type: 'success',
    });
  };

  // "Use My Current Location" via browser GPS
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setStatusMessage(null);
    try {
      const pos = await getBrowserCurrentPosition();
      updateMapPosition(pos.lat, pos.lng, 16);
      setIsGeocoding(true);
      const resolved = await reverseGeocode(pos.lat, pos.lng);
      setAddress(resolved);
      setIsGeocoding(false);
      setStatusMessage({
        text: 'Current GPS location detected and pinned successfully!',
        type: 'success',
      });
    } catch (err: any) {
      setStatusMessage({
        text: err.message || 'GPS request failed. You can search or click on the map.',
        type: 'error',
      });
    } finally {
      setIsLocating(false);
    }
  };

  const handleConfirm = () => {
    if (!lat || !lng) {
      setStatusMessage({
        text: 'Please select a valid point on the map.',
        type: 'error',
      });
      return;
    }

    const finalAddress =
      address.trim() || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

    onConfirmLocation({
      address: finalAddress,
      lat,
      lng,
      city: finalAddress.includes('Bengaluru')
        ? 'Bengaluru'
        : finalAddress.split(',').slice(-2, -1)[0]?.trim() || '',
    });

    setIsConfirmed(true);
    setStatusMessage({
      text: 'Location confirmed! Ready for rescue matching.',
      type: 'success',
    });
  };

  return (
    <div className="bg-white dark:bg-[#142318] rounded-2xl border border-[#123D2B]/15 dark:border-white/10 p-4 sm:p-6 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#123D2B]/10 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#3C8D58]/15 text-[#3C8D58] dark:bg-[#4EBE73]/20 dark:text-[#4EBE73] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-[#123D2B] dark:text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                Required
              </span>
            </h3>
            <p className="text-xs text-[#202820]/70 dark:text-white/60">
              {helperText}
            </p>
          </div>
        </div>

        {/* Current Location Quick Action */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#123D2B] dark:text-[#F8F5EB] bg-[#123D2B]/5 hover:bg-[#123D2B]/10 dark:bg-white/10 dark:hover:bg-white/15 rounded-xl border border-[#123D2B]/10 dark:border-white/15 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3C8D58]" />
          ) : (
            <Crosshair className="w-3.5 h-3.5 text-[#3C8D58] dark:text-[#4EBE73]" />
          )}
          <span>{isLocating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
        </button>
      </div>

      {/* Address Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-[#202820]/40 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearch();
                }
              }}
              placeholder="Search address, landmark, area, or road (e.g. Indiranagar, Bengaluru)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#123D2B]/20 dark:border-white/15 bg-[#F8F5EB]/60 dark:bg-black/20 text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSearch();
            }}
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2.5 bg-[#123D2B] dark:bg-[#3C8D58] hover:bg-[#1A543C] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search</span>}
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1.5 bg-white dark:bg-[#17231B] rounded-xl shadow-2xl border border-[#123D2B]/20 dark:border-white/15 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-2 border-b border-black/5 dark:border-white/5 text-[11px] font-semibold text-[#202820]/60 dark:text-white/60">
              Matching Addresses (Click to Pin):
            </div>
            <div className="max-h-56 overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left p-3 hover:bg-[#3C8D58]/10 dark:hover:bg-white/10 transition-colors flex items-start gap-2.5 text-xs"
                >
                  <MapPin className="w-4 h-4 text-[#3C8D58] dark:text-[#4EBE73] shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#123D2B] dark:text-white">
                      {res.displayName.split(',')[0]}
                    </span>
                    <span className="text-[11px] text-[#202820]/60 dark:text-white/60 line-clamp-1">
                      {res.displayName}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-[#123D2B]/15 dark:border-white/10 shadow-inner foodbridge-map-container">
        <div
          ref={mapContainerRef}
          className="w-full h-64 sm:h-80 bg-[#EAE4D3] dark:bg-[#121B15] relative z-0"
        />

        {/* Map Overlay Badge */}
        <div className="absolute top-3 left-3 z-10 bg-white/95 dark:bg-[#142318]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 shadow-md flex items-center gap-2 pointer-events-none text-xs">
          <Navigation2 className="w-3.5 h-3.5 text-[#3C8D58] dark:text-[#4EBE73]" />
          <span className="font-medium text-[#123D2B] dark:text-white">
            Click map or drag pin to position
          </span>
        </div>

        {/* Geocoding indicator overlay */}
        {isGeocoding && (
          <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-white dark:bg-[#142318] px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold text-[#123D2B] dark:text-white">
              <Loader2 className="w-4 h-4 animate-spin text-[#3C8D58]" />
              <span>Resolving street address...</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Address Display & Confirmation Zone */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F8F5EB] dark:bg-black/30 p-3.5 rounded-xl border border-[#123D2B]/10 dark:border-white/10">
        <div className="flex items-start gap-2.5 flex-grow">
          <MapPin className="w-4 h-4 text-[#3C8D58] dark:text-[#4EBE73] shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#123D2B]/70 dark:text-white/60">
              Selected Address & Coordinates:
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#123D2B] dark:text-white line-clamp-2">
              {address || 'Position marker on the map to set address'}
            </span>
            <span className="text-[10px] font-mono text-[#202820]/50 dark:text-white/40 mt-0.5">
              Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-md ${
            isConfirmed
              ? 'bg-[#3C8D58] text-white shadow-[#3C8D58]/20'
              : 'bg-[#F4A259] hover:bg-[#E89143] text-[#123D2B] shadow-[#F4A259]/25 hover:-translate-y-0.5'
          }`}
        >
          {isConfirmed ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Location Confirmed</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{confirmButtonText}</span>
            </>
          )}
        </button>
      </div>

      {/* Feedback Toast Banner */}
      {statusMessage && (
        <div
          className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
              : statusMessage.type === 'error'
              ? 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800/40'
              : 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
};
