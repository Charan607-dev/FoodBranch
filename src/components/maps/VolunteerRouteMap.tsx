import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
  createMapIcon,
} from './mapUtils';
import {
  calculateHaversineDistance,
  getOsrmRoute,
} from '../../services/geoService';
import { DonationRecord, UserProfile, RouteEstimate } from '../../types';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Clock,
  Truck,
  Building2,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Compass,
  X,
  Loader2,
} from 'lucide-react';

interface VolunteerRouteMapProps {
  donation: DonationRecord;
  volunteer: UserProfile;
  onClose?: () => void;
  onAcceptPickup?: (donationId: string) => Promise<void>;
  isAccepted?: boolean;
}

export const VolunteerRouteMap: React.FC<VolunteerRouteMapProps> = ({
  donation,
  volunteer,
  onClose,
  onAcceptPickup,
  isAccepted = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [routeData, setRouteData] = useState<RouteEstimate | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(true);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);

  const volLat = volunteer.latitude || 12.9345;
  const volLng = volunteer.longitude || 77.6265;

  const donorLat = donation.pickupLatitude || 12.9784;
  const donorLng = donation.pickupLongitude || 77.6408;

  const ngoLat = donation.ngoLatitude || 12.962;
  const ngoLng = donation.ngoLongitude || 77.6145;

  // Straight line calculations for reference
  const distVolToDonor = calculateHaversineDistance(volLat, volLng, donorLat, donorLng);
  const distDonorToNgo = calculateHaversineDistance(donorLat, donorLng, ngoLat, ngoLng);
  const totalStraightLine = Math.round((distVolToDonor + distDonorToNgo) * 10) / 10;

  // Fetch OSRM Road Route
  useEffect(() => {
    let isCancelled = false;

    async function loadRoute() {
      setIsLoadingRoute(true);
      try {
        const waypoints = [
          { lat: volLat, lng: volLng },
          { lat: donorLat, lng: donorLng },
          { lat: ngoLat, lng: ngoLng },
        ];
        const res = await getOsrmRoute(waypoints);
        if (!isCancelled) {
          setRouteData(res);
        }
      } catch (err) {
        console.warn('Failed to fetch OSRM route:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingRoute(false);
        }
      }
    }

    loadRoute();
    return () => {
      isCancelled = true;
    };
  }, [volLat, volLng, donorLat, donorLng, ngoLat, ngoLng]);

  // Render Leaflet Map & Polylines
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer(OSM_TILE_URL, {
        attribution: OSM_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // 1. Volunteer Marker (ORANGE)
    const volIcon = createMapIcon({
      role: 'volunteer',
      label: 'You (Courier)',
      pulsing: false,
    });
    const volMarker = L.marker([volLat, volLng], { icon: volIcon }).addTo(map);
    volMarker.bindPopup(
      `<div class="p-3 bg-[#F4A259] text-[#123D2B] rounded-xl shadow-xl font-bold text-xs">
        <div>Your Starting Location</div>
        <div class="text-[11px] font-normal opacity-90 mt-0.5">${volunteer.address || 'Courier Base'}</div>
      </div>`
    );

    // 2. Donor Pickup Marker (GREEN)
    const donorIcon = createMapIcon({
      role: 'donor',
      label: '1. Food Pickup',
      pulsing: true,
    });
    const donorMarker = L.marker([donorLat, donorLng], { icon: donorIcon }).addTo(map);
    donorMarker.bindPopup(
      `<div class="p-3 bg-[#123D2B] text-white rounded-xl shadow-xl text-xs">
        <div class="font-bold text-[#4EBE73] text-[10px] uppercase">Stop 1: Food Pickup</div>
        <div class="font-bold text-sm mt-0.5">${donation.donorOrg || donation.donorName}</div>
        <div class="text-white/80 text-[11px] mt-1">${donation.pickupAddress}</div>
        <div class="text-[#F4A259] font-semibold text-[11px] mt-1">Item: ${donation.foodName} (${donation.quantity})</div>
      </div>`
    );

    // 3. NGO Destination Marker (BLUE)
    const ngoIcon = createMapIcon({
      role: 'ngo',
      label: '2. NGO Destination',
      pulsing: false,
    });
    const ngoMarker = L.marker([ngoLat, ngoLng], { icon: ngoIcon }).addTo(map);
    ngoMarker.bindPopup(
      `<div class="p-3 bg-[#0E1611] text-white rounded-xl shadow-xl text-xs">
        <div class="font-bold text-[#4EBE73] text-[10px] uppercase">Stop 2: Delivery Destination</div>
        <div class="font-bold text-sm mt-0.5">${donation.ngoName || 'NGO Partner Center'}</div>
        <div class="text-white/80 text-[11px] mt-1">${donation.ngoAddress || 'Community Center'}</div>
      </div>`
    );

    // Draw Route Polyline
    if (routeData && routeData.geometry && routeData.geometry.length > 0) {
      // Split into two polyline visuals or a unified line
      const polyline = L.polyline(routeData.geometry, {
        color: '#3C8D58',
        weight: 5,
        opacity: 0.85,
        dashArray: routeData.isRoadRoute ? undefined : '8, 8',
      }).addTo(map);

      // Fit map bounds to encompass all markers and route
      const bounds = L.latLngBounds([
        [volLat, volLng],
        [donorLat, donorLng],
        [ngoLat, ngoLng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Fallback direct bounds
      const bounds = L.latLngBounds([
        [volLat, volLng],
        [donorLat, donorLng],
        [ngoLat, ngoLng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Keep map instance or clean up
    };
  }, [volLat, volLng, donorLat, donorLng, ngoLat, ngoLng, routeData, donation, volunteer]);

  // Clean map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleAcceptClick = async () => {
    if (!onAcceptPickup) return;
    setIsAccepting(true);
    try {
      await onAcceptPickup(donation.id);
    } finally {
      setIsAccepting(false);
    }
  };

  // Google Maps / OSM external direction link
  const openExternalNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${volLat},${volLng}&destination=${ngoLat},${ngoLng}&waypoints=${donorLat},${donorLng}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white dark:bg-[#142318] rounded-2xl border border-[#123D2B]/15 dark:border-white/10 shadow-xl overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#123D2B] to-[#1A543C] text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F4A259] shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base sm:text-lg">
                Multi-Stop Rescue Route #{donation.id}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-[#F4A259]">
                {donation.category}
              </span>
            </div>
            <p className="text-xs text-white/70 mt-0.5">
              Pickup from <strong className="text-white">{donation.donorOrg || donation.donorName}</strong> &rarr; Deliver to <strong className="text-white">{donation.ngoName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openExternalNavigation}
            className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open Turn-by-Turn in External Navigation"
          >
            <Compass className="w-4 h-4 text-[#F4A259]" />
            <span className="hidden sm:inline">External Nav</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/70" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#123D2B]/10 dark:divide-white/10 bg-[#F8F5EB] dark:bg-black/30 border-b border-[#123D2B]/10 dark:border-white/10 text-xs">
        <div className="p-3 sm:p-4 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#123D2B]/60 dark:text-white/50">
            Leg 1 (You &rarr; Donor)
          </span>
          <span className="font-bold text-sm text-[#123D2B] dark:text-white mt-0.5">
            {distVolToDonor} km
          </span>
          <span className="text-[10px] text-[#202820]/60 dark:text-white/60">
            Straight-line
          </span>
        </div>

        <div className="p-3 sm:p-4 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#123D2B]/60 dark:text-white/50">
            Leg 2 (Donor &rarr; NGO)
          </span>
          <span className="font-bold text-sm text-[#123D2B] dark:text-white mt-0.5">
            {distDonorToNgo} km
          </span>
          <span className="text-[10px] text-[#202820]/60 dark:text-white/60">
            Transit cargo leg
          </span>
        </div>

        <div className="p-3 sm:p-4 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#123D2B]/60 dark:text-white/50">
            Total Road Distance
          </span>
          <span className="font-bold text-sm text-[#3C8D58] dark:text-[#4EBE73] mt-0.5">
            {isLoadingRoute ? (
              <span className="inline-flex items-center gap-1 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" /> Calculating...
              </span>
            ) : routeData?.roadKm ? (
              `${routeData.roadKm} km`
            ) : (
              `${totalStraightLine} km (approx)`
            )}
          </span>
          <span className="text-[10px] text-[#202820]/60 dark:text-white/60">
            {routeData?.isRoadRoute ? 'Actual Road Navigation' : 'Straight-Line Fallback'}
          </span>
        </div>

        <div className="p-3 sm:p-4 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#123D2B]/60 dark:text-white/50">
            Est. Driving Duration
          </span>
          <span className="font-bold text-sm text-[#F4A259] mt-0.5">
            {isLoadingRoute ? (
              'Calculating...'
            ) : routeData?.durationMinutes ? (
              `~${routeData.durationMinutes} mins`
            ) : (
              '~15-20 mins'
            )}
          </span>
          <span className="text-[10px] text-[#202820]/60 dark:text-white/60">
            Based on city traffic flow
          </span>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="relative foodbridge-map-container">
        <div
          ref={mapContainerRef}
          className="w-full h-72 sm:h-96 bg-[#EAE4D3] dark:bg-[#121B15] relative z-0"
        />

        {/* Legend Overlay */}
        <div className="absolute top-3 right-3 z-10 bg-white/95 dark:bg-[#142318]/95 backdrop-blur-md p-2.5 rounded-xl border border-black/10 dark:border-white/10 shadow-lg flex flex-col gap-1 text-[11px]">
          <div className="font-bold text-[#123D2B] dark:text-white">Route Key</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F4A259]"></span>
            <span>You (Volunteer Base)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3C8D58]"></span>
            <span>Stop 1: Food Pickup</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#123D2B]"></span>
            <span>Stop 2: NGO Delivery</span>
          </div>
        </div>
      </div>

      {/* Stop Waypoint Sequence Breakdown */}
      <div className="p-4 sm:p-5 flex flex-col gap-3 bg-white dark:bg-[#142318]">
        <div className="text-xs font-bold uppercase tracking-wider text-[#123D2B]/70 dark:text-white/60">
          Delivery Itinerary & Handover Points:
        </div>

        <div className="space-y-3">
          {/* Stop 1 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#3C8D58]/10 border border-[#3C8D58]/20">
            <div className="w-6 h-6 rounded-full bg-[#3C8D58] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-grow flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs sm:text-sm text-[#123D2B] dark:text-white">
                  Pickup: {donation.donorOrg || donation.donorName}
                </span>
                <span className="text-[11px] font-semibold text-[#3C8D58]">
                  {distVolToDonor} km from you
                </span>
              </div>
              <p className="text-xs text-[#202820]/70 dark:text-white/70 mt-0.5">
                {donation.pickupAddress}
              </p>
              <div className="text-[11px] text-[#202820]/60 dark:text-white/60 mt-1 flex items-center gap-2">
                <span>Contact: {donation.contactNumber}</span>
                <span>&bull;</span>
                <span>Safe until: {donation.safeUntil}</span>
              </div>
            </div>
          </div>

          {/* Stop 2 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#123D2B]/10 dark:bg-white/5 border border-[#123D2B]/15 dark:border-white/10">
            <div className="w-6 h-6 rounded-full bg-[#123D2B] dark:bg-white text-white dark:text-[#123D2B] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              2
            </div>
            <div className="flex-grow flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs sm:text-sm text-[#123D2B] dark:text-white">
                  Destination: {donation.ngoName}
                </span>
                <span className="text-[11px] font-semibold text-[#123D2B] dark:text-white">
                  {distDonorToNgo} km transit
                </span>
              </div>
              <p className="text-xs text-[#202820]/70 dark:text-white/70 mt-0.5">
                {donation.ngoAddress || 'Community Center, Bengaluru'}
              </p>
              <p className="text-[11px] text-[#202820]/60 dark:text-white/60 mt-0.5">
                Cargo: {donation.foodName} ({donation.quantity}) &bull; Serves ~{donation.peopleServed}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/10">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#123D2B]/20 dark:border-white/15 text-xs font-semibold text-[#202820] dark:text-white hover:bg-black/5 transition-colors cursor-pointer"
            >
              Close Map
            </button>
          )}

          {!isAccepted && onAcceptPickup && (
            <button
              onClick={handleAcceptClick}
              disabled={isAccepting}
              className="px-6 py-2.5 rounded-xl bg-[#F4A259] hover:bg-[#E89143] text-[#123D2B] font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAccepting ? 'Assigning Task...' : 'Accept Pickup Task'}</span>
            </button>
          )}

          {isAccepted && (
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Task Assigned to You</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
