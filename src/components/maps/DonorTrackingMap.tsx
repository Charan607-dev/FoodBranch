import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
  createMapIcon,
} from './mapUtils';
import { DonationRecord } from '../../types';
import {
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  ShieldCheck,
  Radio,
  EyeOff,
  Sparkles,
  X,
} from 'lucide-react';

interface DonorTrackingMapProps {
  donation: DonationRecord;
  onClose?: () => void;
}

export const DonorTrackingMap: React.FC<DonorTrackingMapProps> = ({
  donation,
  onClose,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const donorLat = donation.pickupLatitude || 12.9784;
  const donorLng = donation.pickupLongitude || 77.6408;

  const ngoLat = donation.ngoLatitude;
  const ngoLng = donation.ngoLongitude;

  const volunteerLat = donation.volunteerLatitude;
  const volunteerLng = donation.volunteerLongitude;
  const hasLiveVolunteerLocation =
    Boolean(donation.volunteerShareLocation) &&
    typeof volunteerLat === 'number' &&
    typeof volunteerLng === 'number' &&
    (donation.status === 'Volunteer Assigned' ||
      donation.status === 'Pickup in Progress');

  // Stages of the rescue lifecycle
  const stages = [
    { key: 'Published', label: 'Published', reached: true },
    {
      key: 'NGO Accepted',
      label: 'NGO Claimed',
      reached: [
        'NGO Accepted',
        'Volunteer Assigned',
        'Pickup in Progress',
        'Delivered',
        'Completed',
      ].includes(donation.status),
    },
    {
      key: 'Volunteer Assigned',
      label: 'Courier Assigned',
      reached: [
        'Volunteer Assigned',
        'Pickup in Progress',
        'Delivered',
        'Completed',
      ].includes(donation.status),
    },
    {
      key: 'Pickup in Progress',
      label: 'Food Picked Up',
      reached: ['Pickup in Progress', 'Delivered', 'Completed'].includes(
        donation.status
      ),
    },
    {
      key: 'Delivered',
      label: 'Delivered',
      reached: ['Delivered', 'Completed'].includes(donation.status),
    },
    {
      key: 'Completed',
      label: 'NGO Confirmed',
      reached: donation.status === 'Completed',
    },
  ];

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

    // Clear previous markers/polylines
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const latLngPoints: [number, number][] = [[donorLat, donorLng]];

    // 1. Donor Pickup Marker
    const donorIcon = createMapIcon({
      role: 'donor',
      label: 'Pickup Point',
      pulsing: false,
    });
    L.marker([donorLat, donorLng], { icon: donorIcon })
      .addTo(map)
      .bindPopup(
        `<div class="p-3 bg-[#123D2B] text-white rounded-xl shadow-lg text-xs">
          <div class="text-[10px] text-[#4EBE73] font-bold uppercase">Pickup Location</div>
          <div class="font-bold text-sm mt-0.5">${donation.donorOrg || donation.donorName}</div>
          <div class="text-white/80 text-[11px] mt-1">${donation.pickupAddress}</div>
        </div>`
      );

    // 2. NGO Destination Marker (if accepted)
    if (ngoLat && ngoLng) {
      latLngPoints.push([ngoLat, ngoLng]);
      const ngoIcon = createMapIcon({
        role: 'ngo',
        label: 'Destination',
        pulsing: false,
      });
      L.marker([ngoLat, ngoLng], { icon: ngoIcon })
        .addTo(map)
        .bindPopup(
          `<div class="p-3 bg-[#0E1611] text-white rounded-xl shadow-lg text-xs">
            <div class="text-[10px] text-[#4EBE73] font-bold uppercase">Delivery Center</div>
            <div class="font-bold text-sm mt-0.5">${donation.ngoName || 'NGO Partner'}</div>
            <div class="text-white/80 text-[11px] mt-1">${donation.ngoAddress || 'Community Center'}</div>
          </div>`
        );

      // Connect Donor to NGO
      L.polyline([[donorLat, donorLng], [ngoLat, ngoLng]], {
        color: '#3C8D58',
        weight: 3.5,
        dashArray: '8, 8',
        opacity: 0.7,
      }).addTo(map);
    }

    // 3. Volunteer Courier Marker (ONLY if explicit consent enabled)
    if (hasLiveVolunteerLocation && volunteerLat && volunteerLng) {
      latLngPoints.push([volunteerLat, volunteerLng]);
      const volIcon = createMapIcon({
        role: 'volunteer',
        label: 'Courier GPS',
        pulsing: true,
      });
      L.marker([volunteerLat, volunteerLng], { icon: volIcon })
        .addTo(map)
        .bindPopup(
          `<div class="p-3 bg-[#F4A259] text-[#123D2B] rounded-xl shadow-lg text-xs font-bold">
            <div class="text-[10px] uppercase tracking-wider">Live Courier GPS</div>
            <div class="text-sm mt-0.5">${donation.volunteerName}</div>
            <div class="text-[11px] font-normal opacity-90 mt-1">Status: ${donation.status}</div>
          </div>`
        );
    }

    // Auto-fit bounds
    if (latLngPoints.length === 1) {
      map.setView(latLngPoints[0], 14);
    } else {
      const bounds = L.latLngBounds(latLngPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [donorLat, donorLng, ngoLat, ngoLng, volunteerLat, volunteerLng, hasLiveVolunteerLocation, donation]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-white dark:bg-[#142318] rounded-2xl border border-[#123D2B]/15 dark:border-white/10 shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#123D2B] to-[#1F553D] text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F4A259] shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base sm:text-lg">
                Rescue Journey & Tracking: #{donation.id}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#3C8D58]/30 border border-[#4EBE73]/40 text-[#4EBE73]">
                {donation.status}
              </span>
            </div>
            <p className="text-xs text-white/70 mt-0.5">
              {donation.foodName} ({donation.quantity}) &bull; Serves ~{donation.peopleServed}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress Timeline */}
      <div className="p-4 sm:p-5 border-b border-[#123D2B]/10 dark:border-white/10 bg-[#F8F5EB]/50 dark:bg-black/20">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#123D2B]/70 dark:text-white/60 mb-3">
          Progress Timeline:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {stages.map((stage, idx) => (
            <div
              key={stage.key}
              className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                stage.reached
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-black/5 dark:bg-white/5 border-transparent text-[#202820]/40 dark:text-white/30 opacity-70'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                  stage.reached
                    ? 'bg-[#3C8D58] text-white'
                    : 'bg-black/10 dark:bg-white/10 text-[#202820]/50 dark:text-white/40'
                }`}
              >
                {stage.reached ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span className="text-[11px] font-bold leading-tight">{stage.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative foodbridge-map-container">
        <div
          ref={mapContainerRef}
          className="w-full h-72 sm:h-80 bg-[#EAE4D3] dark:bg-[#121B15] relative z-0"
        />

        {/* Live GPS disclosure status banner */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10">
          {hasLiveVolunteerLocation ? (
            <div className="bg-[#123D2B]/95 text-white backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-[#4EBE73]/30 flex items-center gap-2 text-xs">
              <Radio className="w-4 h-4 text-[#4EBE73] animate-pulse shrink-0" />
              <span>
                <strong>Live Courier GPS Active:</strong> {donation.volunteerName} has enabled route sharing.
              </span>
            </div>
          ) : donation.volunteerId ? (
            <div className="bg-white/95 dark:bg-[#142318]/95 text-[#202820] dark:text-white backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-black/10 dark:border-white/10 flex items-center gap-2 text-xs">
              <EyeOff className="w-4 h-4 text-[#F4A259] shrink-0" />
              <span>
                Courier ({donation.volunteerName}) assigned. GPS broadcast is currently in privacy mode.
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Details Footer */}
      <div className="p-4 sm:p-5 bg-white dark:bg-[#142318] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[#123D2B] dark:text-white">
            Pickup Address: <span className="font-normal">{donation.pickupAddress}</span>
          </span>
          {donation.ngoName && (
            <span className="font-semibold text-[#123D2B] dark:text-white">
              Assigned NGO: <span className="font-normal">{donation.ngoName} ({donation.ngoAddress})</span>
            </span>
          )}
          {donation.deliveryRemarks && (
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
              Handover Remarks: "{donation.deliveryRemarks}"
            </span>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#123D2B] text-white font-semibold text-xs transition-colors hover:bg-[#1A543C] self-end cursor-pointer"
          >
            Close Tracking
          </button>
        )}
      </div>
    </div>
  );
};
