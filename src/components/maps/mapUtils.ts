/**
 * Map utilities and custom SVG Leaflet icons for FoodBridge
 */

import L from 'leaflet';
import { DonationCategory } from '../../types';

export const DEFAULT_MAP_CENTER: [number, number] = [12.9716, 77.5946]; // Bengaluru Central
export const DEFAULT_MAP_ZOOM = 13;

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

// High contrast dark tile alternative (CartoDB Dark Matter)
export const CARTO_DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

/**
 * Creates custom vector SVG markers tailored for FoodBridge roles and food categories
 */
export function createMapIcon(options: {
  role?: 'donor' | 'ngo' | 'volunteer';
  category?: DonationCategory;
  isDraggable?: boolean;
  pulsing?: boolean;
  label?: string;
}): L.DivIcon {
  const { role, category, pulsing, label } = options;

  let bgGradient = 'from-[#123D2B] to-[#1E5C41]';
  let borderColor = 'border-[#3C8D58]';
  let iconSvg = '';
  let shadowColor = 'rgba(18,61,43,0.4)';

  if (role === 'volunteer') {
    bgGradient = 'from-[#F4A259] to-[#E89143]';
    borderColor = 'border-white';
    shadowColor = 'rgba(244,162,89,0.5)';
    iconSvg = `
      <svg viewBox="0 0 24 24" class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="18.5" cy="17.5" r="3.5"/>
        <circle cx="5.5" cy="17.5" r="3.5"/>
        <circle cx="15" cy="5" r="1"/>
        <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
      </svg>
    `;
  } else if (role === 'ngo') {
    bgGradient = 'from-[#123D2B] to-[#0A261A]';
    borderColor = 'border-[#4EBE73]';
    shadowColor = 'rgba(18,61,43,0.5)';
    iconSvg = `
      <svg viewBox="0 0 24 24" class="w-5 h-5 text-[#4EBE73]" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
        <path d="M10 6h4"/>
        <path d="M10 10h4"/>
        <path d="M10 14h4"/>
        <path d="M10 18h4"/>
      </svg>
    `;
  } else if (role === 'donor') {
    bgGradient = 'from-[#3C8D58] to-[#2B6D43]';
    borderColor = 'border-[#F8F5EB]';
    shadowColor = 'rgba(60,141,88,0.45)';
    iconSvg = `
      <svg viewBox="0 0 24 24" class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 21a9 9 0 0 0 9-9c0-4.97-4.03-9-9-9S3 7.03 3 12a9 9 0 0 0 9 9Z"/>
        <path d="M7 13c1.5 2 4 3 5 3s3.5-1 5-3"/>
        <circle cx="12" cy="8" r="2" fill="white"/>
      </svg>
    `;
  } else {
    // Category-specific food pins
    switch (category) {
      case 'Cooked Food':
        bgGradient = 'from-[#D9534F] to-[#B53B37]';
        borderColor = 'border-amber-200';
        iconSvg = `
          <svg viewBox="0 0 24 24" class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/>
            <line x1="10" y1="1" x2="10" y2="4"/>
            <line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
        `;
        break;
      case 'Bakery':
        bgGradient = 'from-[#E08E45] to-[#C0702B]';
        borderColor = 'border-amber-100';
        iconSvg = `
          <svg viewBox="0 0 24 24" class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m19 12-7-9-7 9v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2Z"/>
            <path d="M12 3v18"/>
          </svg>
        `;
        break;
      case 'Fruits':
      case 'Vegetables':
        bgGradient = 'from-[#3C8D58] to-[#25633C]';
        borderColor = 'border-emerald-200';
        iconSvg = `
          <svg viewBox="0 0 24 24" class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 0 0-9-9Z"/>
            <path d="M12 2c0 3-2 5-5 5"/>
          </svg>
        `;
        break;
      default:
        bgGradient = 'from-[#123D2B] to-[#3C8D58]';
        borderColor = 'border-white';
        iconSvg = `
          <svg viewBox="0 0 24 24" class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <path d="M9 3v18"/>
            <path d="M15 3v18"/>
          </svg>
        `;
    }
  }

  const pulseClass = pulsing ? 'pulse-marker' : '';
  const labelHtml = label
    ? `<span class="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#123D2B] dark:bg-[#0E1611] text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md border border-white/20">${label}</span>`
    : '';

  const html = `
    <div class="relative group cursor-pointer">
      ${labelHtml}
      <div class="w-10 h-10 rounded-2xl bg-gradient-to-br ${bgGradient} border-2 ${borderColor} flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-115 ${pulseClass}" style="box-shadow: 0 6px 16px ${shadowColor};">
        ${iconSvg}
      </div>
      <div class="w-2.5 h-2.5 bg-[#123D2B] dark:bg-white rotate-45 mx-auto -mt-1.5 shadow-sm"></div>
    </div>
  `;

  return L.divIcon({
    className: 'foodbridge-marker',
    html,
    iconSize: [40, 48],
    iconAnchor: [20, 46],
    popupAnchor: [0, -42],
  });
}
