import React from 'react';

// Modern SVG icons — bold, distinct, highly legible at small sizes
// Usage: ASSET_ICONS.stock('#8b7cf7') or ASSET_ICONS.stock('#8b7cf7', 14)
const ASSET_ICONS = {
  stock: (color, size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  etf: (color, size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9" rx="1" fill={color} fillOpacity="0.3"/>
      <rect x="10" y="7" width="4" height="14" rx="1" fill={color} fillOpacity="0.3"/>
      <rect x="17" y="3" width="4" height="18" rx="1" fill={color} fillOpacity="0.3"/>
    </svg>
  ),
  bond: (color, size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <line x1="8" y1="9" x2="16" y2="9"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="12" y2="17"/>
    </svg>
  ),
  crypto: (color, size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M9 8h4.5a2.5 2.5 0 0 1 0 5H9V8z" fill={color} fillOpacity="0.2"/>
      <path d="M9 13h5a2.5 2.5 0 0 1 0 5H9v-5z" fill={color} fillOpacity="0.2"/>
      <line x1="12" y1="5" x2="12" y2="8"/>
      <line x1="12" y1="18" x2="12" y2="21"/>
    </svg>
  ),
  commodity: (color, size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L5 12l7 10 7-10L12 2z" fill={color} fillOpacity="0.15"/>
    </svg>
  ),
  cash: (color, size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
};

export default ASSET_ICONS;
