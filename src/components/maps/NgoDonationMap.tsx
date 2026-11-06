import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
  createMapIcon,
} from './mapUtils';
import { calculateHaversineDistance, getOsrmRoute } from '../../services/geoService';
import { DonationRecord, UserProfile, DonationCategory } from '../../types';
import {
  MapPin,
  ListFilter,
  Layers,
  Clock,
  Utensils,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Navigation,
  Flame,
} from 'lucide-react';

interface NgoDonationMapProps {
  donations: DonationRecord[];
  ngo: UserProfile;
  onAcceptDonation: (donationId: string) => Promise<void>;
  onViewDetails?: (donation: DonationRecord) => void;
}

export const NgoDonationMap: React.FC<NgoDonationMapProps> = ({
  donations,
  ngo,
  onAcceptDonation,
  onViewDetails,
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(20);
  const [selectedDonation, setSelectedDonation] = useState<DonationRecord | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circleRadiusRef = useRef<L.Circle | null>(null);

  const ngoLat = ngo.latitude || DEFAULT_MAP_CENTER[0];
  const ngoLng = ngo.longitude || DEFAULT_MAP_CENTER[1];

  // Only consider 'Available' donations
  const availableDonations = useMemo(() => {
    return donations.filter((d) => d.status === 'Available');
  }, [donations]);

  // Attach calculated distance from NGO to each donation
  const donationsWithDistance = useMemo(() => {
    return availableDonations.map((d) => {
      const dist = calculateHaversineDistance(
        ngoLat,
        ngoLng,
        d.pickupLatitude,
        d.pickupLongitude
      );
      // Rough travel time approximation (~25 km/h urban speed)
      const approxMinutes = Math.max(4, Math.round((dist / 25) * 60));
      return {
        ...d,
        distanceKm: dist,
        approxMinutes,
      };
    });
  }, [availableDonations, ngoLat, ngoLng]);

  // Filtered and sorted by nearest distance
  const filteredDonations = useMemo(() => {
    return donationsWithDistance
      .filter((d) => {
        if (selectedCategory !== 'All' && d.category !== selectedCategory) {
          return false;
        }
        if (maxDistanceKm > 0 && d.distanceKm > maxDistanceKm) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [donationsWithDistance, selectedCategory, maxDistanceKm]);

  // Initialize Map
  useEffect(() => {
    if (viewMode !== 'map') return;
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [ngoLat, ngoLng],
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer(OSM_TILE_URL, {
        attribution: OSM_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);

      // NGO Base Center Marker
      const ngoIcon = createMapIcon({
        role: 'ngo',
        label: `${ngo.organizationName || 'My NGO Center'}`,
        pulsing: false,
      });

      L.marker([ngoLat, ngoLng], { icon: ngoIcon })
        .addTo(map)
        .bindPopup(
          `<div class="p-3 bg-[#123D2B] text-white rounded-xl shadow-xl min-w-[200px]">
            <div class="text-[10px] font-bold text-[#4EBE73] uppercase tracking-wider">Your Distribution Center</div>
            <div class="text-sm font-bold mt-0.5">${ngo.organizationName || ngo.fullName}</div>
            <div class="text-xs text-white/70 mt-1">${ngo.address || 'Bengaluru Center'}</div>
          </div>`,
          { closeButton: false }
        );

      // Proximity Radius Circle
      const radiusCircle = L.circle([ngoLat, ngoLng], {
        radius: maxDistanceKm * 1000,
        color: '#3C8D58',
        fillColor: '#3C8D58',
        fillOpacity: 0.06,
        weight: 1.5,
        dashArray: '6, 6',
      }).addTo(map);
      circleRadiusRef.current = radiusCircle;

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    // Refresh donations markers
    if (markersLayerRef.current && mapInstanceRef.current) {
      markersLayerRef.current.clearLayers();

      filteredDonations.forEach((d) => {
        const isUrgent =
          d.safeUntil.toLowerCase().includes('today') ||
          d.safeUntil.toLowerCase().includes('left') ||
          d.safeUntil.toLowerCase().includes('hour');

        const icon = createMapIcon({
          category: d.category,
          pulsing: isUrgent,
          label: `${d.distanceKm} km`,
        });

        const marker = L.marker([d.pickupLatitude, d.pickupLongitude], { icon });

        // Popup Content
        const popupContent = document.createElement('div');
        popupContent.className =
          'p-4 bg-white dark:bg-[#142318] text-[#202820] dark:text-white rounded-2xl shadow-2xl border border-[#123D2B]/15 dark:border-white/10 min-w-[260px] max-w-[300px] flex flex-col gap-2.5';

        popupContent.innerHTML = `
          <div class="flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/10 pb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3C8D58]/15 text-[#3C8D58] dark:bg-[#4EBE73]/20 dark:text-[#4EBE73]">
              ${d.category}
            </span>
            <span class="text-xs font-bold text-[#F4A259] flex items-center gap-1">
              📍 ${d.distanceKm} km away
            </span>
          </div>
          <div>
            <div class="text-sm font-bold text-[#123D2B] dark:text-white leading-snug">${d.foodName}</div>
            <div class="text-xs text-[#202820]/70 dark:text-white/70 mt-1">Quantity: <strong class="text-[#123D2B] dark:text-white">${d.quantity}</strong> (Serves ~${d.peopleServed})</div>
          </div>
          <div class="bg-[#F8F5EB] dark:bg-black/30 p-2 rounded-xl text-[11px] flex flex-col gap-1">
            <div class="flex items-center gap-1.5 text-[#202820]/80 dark:text-white/80">
              <span class="font-semibold">Donor:</span> ${d.donorOrg || d.donorName}
            </div>
            <div class="text-[10px] text-[#202820]/60 dark:text-white/60 line-clamp-1">
              ${d.pickupAddress}
            </div>
            <div class="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold text-[10px] mt-0.5">
              ⏱ Safe Until: ${d.safeUntil}
            </div>
          </div>
          <div class="flex items-center gap-2 pt-1">
            <button id="btn-accept-${d.id}" class="flex-grow py-2 px-3 bg-[#3C8D58] hover:bg-[#327749] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5">
              <span>Accept Donation</span>
            </button>
          </div>
        `;

        // Wire accept button inside Leaflet popup DOM
        const acceptBtn = popupContent.querySelector(`#btn-accept-${d.id}`);
        if (acceptBtn) {
          acceptBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleAccept(d.id);
          });
        }

        marker.bindPopup(popupContent, { maxWidth: 320 });
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // Update Circle Radius
    if (circleRadiusRef.current) {
      circleRadiusRef.current.setRadius(maxDistanceKm * 1000);
    }

    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  }, [viewMode, filteredDonations, ngoLat, ngoLng, maxDistanceKm]);

  // Clean map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleAccept = async (donationId: string) => {
    setAcceptingId(donationId);
    try {
      await onAcceptDonation(donationId);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.closePopup();
      }
    } finally {
      setAcceptingId(null);
    }
  };

  const categories = ['All', 'Cooked Food', 'Bakery', 'Fruits', 'Vegetables', 'Packaged Food'];

  return (
    <div className="flex flex-col gap-4">
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-[#142318] p-4 rounded-2xl border border-[#123D2B]/15 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* View Toggle */}
        <div className="flex items-center gap-1.5 bg-[#F8F5EB] dark:bg-black/30 p-1 rounded-xl border border-[#123D2B]/10 dark:border-white/10 self-start">
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-[#123D2B] text-white shadow-md'
                : 'text-[#202820]/70 dark:text-white/70 hover:text-[#123D2B]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#123D2B] text-white shadow-md'
                : 'text-[#202820]/70 dark:text-white/70 hover:text-[#123D2B]'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>List View ({filteredDonations.length})</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Distance Radius */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#123D2B]/80 dark:text-white/80">Radius:</span>
            <select
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="bg-[#F8F5EB] dark:bg-black/30 border border-[#123D2B]/20 dark:border-white/15 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#123D2B] dark:text-white focus:outline-none"
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={20}>Within 20 km</option>
              <option value={50}>Within 50 km</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#3C8D58] text-white shadow-sm'
                    : 'bg-[#123D2B]/5 dark:bg-white/5 text-[#202820]/70 dark:text-white/70 hover:bg-[#123D2B]/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="bg-white dark:bg-[#142318] p-4 rounded-2xl border border-[#123D2B]/15 dark:border-white/10 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-[#202820]/70 dark:text-white/70">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-[#3C8D58]" />
              Showing <strong>{filteredDonations.length}</strong> available batches within{' '}
              <strong>{maxDistanceKm} km</strong> of your center.
            </span>
            <span className="hidden sm:inline font-medium text-[11px]">
              Click any food pin to inspect or claim for rescue.
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-[#123D2B]/15 dark:border-white/10 shadow-inner foodbridge-map-container">
            <div
              ref={mapContainerRef}
              className="w-full h-[450px] sm:h-[550px] bg-[#EAE4D3] dark:bg-[#121B15] relative z-0"
            />

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-white/95 dark:bg-[#142318]/95 backdrop-blur-md p-2.5 rounded-xl border border-black/10 dark:border-white/10 shadow-lg flex flex-col gap-1.5 text-[11px]">
              <div className="font-bold text-[#123D2B] dark:text-white mb-0.5">Map Legend</div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#123D2B] border border-[#4EBE73]"></span>
                <span className="text-[#202820]/80 dark:text-white/80">Your NGO Center</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#D9534F]"></span>
                <span className="text-[#202820]/80 dark:text-white/80">Cooked Meals</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E08E45]"></span>
                <span className="text-[#202820]/80 dark:text-white/80">Bakery & Breads</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#3C8D58]"></span>
                <span className="text-[#202820]/80 dark:text-white/80">Fruits & Produce</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDonations.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-white dark:bg-[#142318] rounded-2xl border border-dashed border-[#123D2B]/20 dark:border-white/10">
              <Utensils className="w-10 h-10 text-[#3C8D58]/40 mx-auto mb-3" />
              <h4 className="font-bold text-base text-[#123D2B] dark:text-white">
                No Surplus Food Matches in Radius
              </h4>
              <p className="text-xs text-[#202820]/60 dark:text-white/60 mt-1 max-w-sm mx-auto">
                Try expanding your search radius to 20 km or clearing category filters.
              </p>
            </div>
          ) : (
            filteredDonations.map((d) => (
              <div
                key={d.id}
                className="bg-white dark:bg-[#142318] rounded-2xl border border-[#123D2B]/15 dark:border-white/10 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#3C8D58]/15 text-[#3C8D58] dark:bg-[#4EBE73]/20 dark:text-[#4EBE73]">
                      {d.category}
                    </span>
                    <span className="text-xs font-bold text-[#F4A259] bg-[#F4A259]/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      📍 {d.distanceKm} km (~{d.approxMinutes}m)
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-base text-[#123D2B] dark:text-white leading-snug group-hover:text-[#3C8D58] transition-colors">
                      {d.foodName}
                    </h4>
                    <p className="text-xs text-[#202820]/70 dark:text-white/70 mt-1">
                      {d.quantity} &bull; Feeds ~{d.peopleServed} individuals
                    </p>
                  </div>

                  <div className="bg-[#F8F5EB] dark:bg-black/30 p-3 rounded-xl flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-[#202820]/80 dark:text-white/80">
                      <Building2 className="w-3.5 h-3.5 text-[#3C8D58] shrink-0" />
                      <span className="font-semibold line-clamp-1">{d.donorOrg || d.donorName}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[#202820]/60 dark:text-white/60 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-[#3C8D58] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{d.pickupAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold text-[11px] pt-1 border-t border-black/5 dark:border-white/5">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Consume by: {d.safeUntil}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                  <button
                    onClick={() => handleAccept(d.id)}
                    disabled={acceptingId === d.id}
                    className="flex-grow py-2.5 px-4 bg-[#3C8D58] hover:bg-[#327749] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{acceptingId === d.id ? 'Claiming Batch...' : 'Accept Donation'}</span>
                  </button>
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(d)}
                      className="p-2.5 rounded-xl border border-[#123D2B]/15 dark:border-white/10 hover:bg-[#123D2B]/5 dark:hover:bg-white/5 text-[#123D2B] dark:text-white transition-colors"
                      title="Inspect details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
