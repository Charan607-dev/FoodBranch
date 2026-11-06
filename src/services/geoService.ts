/**
 * GeoService: Location calculation, Nominatim geocoding & OSRM routing
 * FoodBridge Platform
 */

import { RouteEstimate, GeocodingResult } from '../types';

/**
 * Calculates Haversine straight-line distance between two coordinates in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number' ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return 0;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 1 decimal place
  return Math.round(distance * 10) / 10;
}

/**
 * Fetch road route using OSRM with graceful fallback to straight-line estimation.
 * Supports multiple waypoints (e.g., Volunteer -> Donor -> NGO).
 */
export async function getOsrmRoute(
  waypoints: { lat: number; lng: number }[]
): Promise<RouteEstimate> {
  if (waypoints.length < 2) {
    return {
      straightLineKm: 0,
      roadKm: 0,
      durationMinutes: 0,
      geometry: [],
      isRoadRoute: false,
    };
  }

  // Calculate straight-line distance across all sequential waypoints
  let straightLineKm = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    straightLineKm += calculateHaversineDistance(
      waypoints[i].lat,
      waypoints[i].lng,
      waypoints[i + 1].lat,
      waypoints[i + 1].lng
    );
  }
  straightLineKm = Math.round(straightLineKm * 10) / 10;

  // Format waypoints for OSRM URL: lng,lat;lng,lat
  const coordString = waypoints.map((p) => `${p.lng},${p.lat}`).join(';');
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(osrmUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const roadKm = Math.round((route.distance / 1000) * 10) / 10;
        const durationMinutes = Math.round(route.duration / 60);

        // Convert GeoJSON [lng, lat] coordinates to Leaflet [lat, lng]
        const geometry: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );

        return {
          straightLineKm,
          roadKm,
          durationMinutes: Math.max(1, durationMinutes),
          geometry,
          isRoadRoute: true,
          summary: `${roadKm} km (~${durationMinutes} mins by vehicle)`,
        };
      }
    }
  } catch (err) {
    // Silently fall back to straight line
    console.warn('OSRM routing unavailable, using straight-line approximation:', err);
  }

  // Graceful Fallback: straight-line path and approximated 30 km/h city transit duration
  const fallbackGeometry: [number, number][] = waypoints.map((p) => [p.lat, p.lng]);
  const estimatedMins = Math.max(3, Math.round((straightLineKm / 28) * 60)); // ~28km/h urban speed

  return {
    straightLineKm,
    roadKm: Math.round(straightLineKm * 1.25 * 10) / 10, // ~1.25 urban winding factor
    durationMinutes: estimatedMins,
    geometry: fallbackGeometry,
    isRoadRoute: false,
    summary: `${straightLineKm} km (straight-line approx.)`,
  };
}

/**
 * Search locations via OpenStreetMap Nominatim with debounced/safe fallback
 */
export async function searchAddress(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const encoded = encodeURIComponent(query.trim());
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&addressdetails=1&limit=5`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return [];

    const data = await response.json();
    return data.map((item: any) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      city:
        item.address?.city ||
        item.address?.town ||
        item.address?.suburb ||
        item.address?.state_district ||
        '',
    }));
  } catch {
    return [];
  }
}

/**
 * Reverse geocode a latitude & longitude into a readable street/area address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    }
  } catch {
    // Fallback
  }

  return `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/**
 * Browser Geolocation with clean promise resolution and timeout
 */
export function getBrowserCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let msg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can select your position on the map.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please click on the map to place your pin.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 60000,
      }
    );
  });
}
