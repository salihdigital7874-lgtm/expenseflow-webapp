import React from 'react';

export const Wallet3DArtwork: React.FC<{ className?: string }> = ({ className = 'w-44 h-38' }) => {
  return (
    <svg
      viewBox="0 0 190 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="3D Claymorphic Purple Wallet with cards and gold Rupee coins"
    >
      <defs>
        {/* Soft Ambient Shadows */}
        <filter id="wallet-shadow" x="25" y="40" width="160" height="115" filterUnits="userSpaceOnUse">
          <feDropShadow dx="2" dy="14" stdDeviation="10" floodColor="#4C1D95" floodOpacity="0.32" />
        </filter>
        <filter id="big-coin-shadow" x="70" y="75" width="65" height="65" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#78350F" floodOpacity="0.45" />
        </filter>
        <filter id="top-coin-shadow" x="90" y="8" width="45" height="45" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#78350F" floodOpacity="0.35" />
        </filter>
        <filter id="mid-coin-shadow" x="60" y="55" width="45" height="45" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#78350F" floodOpacity="0.35" />
        </filter>

        {/* 3D Gradients */}
        <linearGradient id="wallet-clay-body" x1="60" y1="50" x2="165" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="30%" stopColor="#8B5CF6" />
          <stop offset="70%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>

        <linearGradient id="wallet-highlight" x1="65" y1="52" x2="165" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C084FC" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="strap-grad" x1="75" y1="80" x2="165" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>

        {/* Cards */}
        <linearGradient id="card-blue-grad" x1="90" y1="20" x2="155" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="card-yellow-grad" x1="75" y1="28" x2="145" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Gold Coin 3D Gradients */}
        <radialGradient id="gold-front" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="25%" stopColor="#FDE68A" />
          <stop offset="65%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
        <linearGradient id="gold-rim-thick" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>

      {/* ── CARD 1: Blue Card peeking behind ── */}
      <g transform="rotate(8 125 45)">
        <rect x="95" y="20" width="62" height="42" rx="7" fill="url(#card-blue-grad)" />
        <rect x="100" y="27" width="11" height="8" rx="2" fill="#BAE6FD" opacity="0.9" />
        <line x1="95" y1="44" x2="157" y2="44" stroke="#0369A1" strokeWidth="3" opacity="0.4" />
      </g>

      {/* ── CARD 2: Yellow / Orange Card peeking front ── */}
      <g transform="rotate(-8 105 48)">
        <rect x="80" y="25" width="64" height="42" rx="7" fill="url(#card-yellow-grad)" />
        <rect x="86" y="32" width="12" height="8" rx="2" fill="#FEF08A" opacity="0.9" />
        <line x1="80" y1="48" x2="144" y2="48" stroke="#D97706" strokeWidth="3" opacity="0.4" />
      </g>

      {/* ── TOP FLOATING COIN (Tilted above cards) ── */}
      <g filter="url(#top-coin-shadow)">
        <ellipse cx="112" cy="22" rx="14" ry="11" fill="url(#gold-rim-thick)" />
        <ellipse cx="112" cy="20.5" rx="12" ry="9" fill="url(#gold-front)" />
        <text
          x="112"
          y="24"
          textAnchor="middle"
          fill="#78350F"
          fontSize="10"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
        >
          ₹
        </text>
        <ellipse cx="108" cy="18" rx="2.5" ry="1.2" fill="#FFFFFF" opacity="0.8" />
      </g>

      {/* ── WALLET MAIN 3D BODY ── */}
      <g filter="url(#wallet-shadow)">
        {/* Main rounded body */}
        <rect x="55" y="52" width="110" height="76" rx="20" fill="url(#wallet-clay-body)" />
        
        {/* Soft top highlight specular */}
        <rect x="58" y="54" width="104" height="20" rx="16" fill="url(#wallet-highlight)" />

        {/* Stitching / Indent curve */}
        <rect
          x="59"
          y="56"
          width="102"
          height="68"
          rx="16"
          fill="none"
          stroke="#C084FC"
          strokeWidth="1.2"
          strokeDasharray="3.5 2.5"
          opacity="0.35"
        />

        {/* Horizontal Closure Flap */}
        <path
          d="M55 76 C55 68 62 62 70 62 L150 62 C158 62 165 68 165 76 L165 96 C165 104 158 110 150 110 L134 110 C128 110 124 114 120 118 C116 122 110 125 104 125 L70 125 C62 125 55 118 55 110 Z"
          fill="url(#strap-grad)"
        />

        {/* Flap top highlight rim */}
        <path
          d="M56 77 L56 109 C56 117 62 124 70 124 L103 124 C109 124 114 121 118 117"
          stroke="#DDD6FE"
          strokeWidth="1.5"
          fill="none"
          opacity="0.55"
        />

        {/* Gold Snap Button Clasp */}
        <circle cx="138" cy="90" r="9" fill="url(#gold-rim-thick)" />
        <circle cx="138" cy="89" r="7" fill="url(#gold-front)" />
        <circle cx="136" cy="87" r="2.5" fill="#FFFFFF" opacity="0.9" />
      </g>

      {/* ── MID COIN (Resting on left fold) ── */}
      <g filter="url(#mid-coin-shadow)">
        <ellipse cx="78" cy="72" rx="12" ry="10" fill="url(#gold-rim-thick)" />
        <ellipse cx="78" cy="71" rx="10.5" ry="8.5" fill="url(#gold-front)" />
        <text
          x="78"
          y="74"
          textAnchor="middle"
          fill="#78350F"
          fontSize="9"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
        >
          ₹
        </text>
        <ellipse cx="75" cy="68" rx="2" ry="1" fill="#FFFFFF" opacity="0.8" />
      </g>

      {/* ── BIG FOREGROUND 3D COIN (Prominent bottom-left) ── */}
      <g filter="url(#big-coin-shadow)">
        {/* Outer coin rim bevel */}
        <ellipse cx="102" cy="102" rx="20" ry="18" fill="url(#gold-rim-thick)" />
        {/* Inner coin face */}
        <ellipse cx="102" cy="100" rx="17.5" ry="15.5" fill="url(#gold-front)" />
        {/* Embossed inner circle */}
        <ellipse cx="102" cy="100" rx="14.5" ry="12.5" fill="none" stroke="#FEF3C7" strokeWidth="1.2" opacity="0.75" />
        
        {/* Bold Rupee symbol */}
        <text
          x="102"
          y="105"
          textAnchor="middle"
          fill="#78350F"
          fontSize="16"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
        >
          ₹
        </text>
        {/* Glossy specular highlight */}
        <ellipse cx="96" cy="94" rx="4" ry="2.2" fill="#FFFFFF" opacity="0.85" />
      </g>
    </svg>
  );
};

export default Wallet3DArtwork;
