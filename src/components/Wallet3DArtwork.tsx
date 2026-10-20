import React from 'react';

export const Wallet3DArtwork: React.FC<{ className?: string }> = ({ className = 'w-40 h-36' }) => {
  return (
    <svg
      viewBox="0 0 180 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="3D Wallet with credit cards and floating gold coins"
    >
      <defs>
        {/* Shadow filters */}
        <filter id="shadow-wallet" x="20" y="30" width="150" height="120" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#4C1D95" floodOpacity="0.25" />
        </filter>
        <filter id="shadow-coin-1" x="90" y="10" width="50" height="50" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#D97706" floodOpacity="0.35" />
        </filter>
        <filter id="shadow-coin-2" x="70" y="65" width="55" height="55" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#D97706" floodOpacity="0.4" />
        </filter>

        {/* Gradients */}
        <linearGradient id="wallet-body" x1="50" y1="50" x2="160" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="60%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>

        <linearGradient id="wallet-flap" x1="60" y1="65" x2="145" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>

        <linearGradient id="card-blue" x1="80" y1="25" x2="150" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <linearGradient id="card-orange" x1="70" y1="35" x2="135" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        <linearGradient id="gold-coin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="85%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        <linearGradient id="gold-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* ── CARD 1: Orange Card peeking out ── */}
      <g transform="rotate(-10 95 45)">
        <rect x="75" y="28" width="65" height="42" rx="7" fill="url(#card-orange)" />
        <rect x="80" y="36" width="12" height="9" rx="2" fill="#FDE047" opacity="0.8" />
        <line x1="75" y1="52" x2="140" y2="52" stroke="#C2410C" strokeWidth="4" opacity="0.4" />
      </g>

      {/* ── CARD 2: Blue Card peeking out ── */}
      <g transform="rotate(6 115 48)">
        <rect x="88" y="24" width="68" height="44" rx="7" fill="url(#card-blue)" />
        <rect x="94" y="33" width="14" height="10" rx="2" fill="#BAE6FD" opacity="0.8" />
        <line x1="88" y1="50" x2="156" y2="50" stroke="#0369A1" strokeWidth="4" opacity="0.35" />
      </g>

      {/* ── COIN 1: Top Floating Coin (Angled) ── */}
      <g filter="url(#shadow-coin-1)">
        <ellipse cx="112" cy="28" rx="14" ry="12" fill="url(#gold-rim)" />
        <ellipse cx="112" cy="27" rx="12" ry="10" fill="url(#gold-coin)" />
        <text
          x="112"
          y="31"
          textAnchor="middle"
          fill="#78350F"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
        >
          ₹
        </text>
      </g>

      {/* ── WALLET BODY (3D Back & Front) ── */}
      <g filter="url(#shadow-wallet)">
        {/* Main Wallet Base */}
        <rect x="52" y="52" width="108" height="74" rx="18" fill="url(#wallet-body)" />
        {/* Stitching Line Top */}
        <rect
          x="55"
          y="55"
          width="102"
          height="68"
          rx="15"
          fill="none"
          stroke="#C4B5FD"
          strokeWidth="1.2"
          strokeDasharray="3 2.5"
          opacity="0.4"
        />

        {/* Wallet Flap */}
        <path
          d="M52 68 C52 59 60 52 70 52 L142 52 C152 52 160 59 160 68 L160 92 C160 99 154 105 147 105 L130 105 C124 105 120 109 117 114 C115 117 111 120 106 120 L70 120 C60 120 52 112 52 102 Z"
          fill="url(#wallet-flap)"
        />

        {/* Flap Highlight Edge */}
        <path
          d="M53 69 L53 101 C53 111 60 119 70 119 L105 119 C109 119 113 116 115 113"
          stroke="#DDD6FE"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />

        {/* Gold Snap Button */}
        <circle cx="132" cy="85" r="9" fill="url(#gold-rim)" />
        <circle cx="132" cy="85" r="7" fill="url(#gold-coin)" />
        <circle cx="130" cy="83" r="2.5" fill="#FEF3C7" opacity="0.9" />
      </g>

      {/* ── COIN 2: Mid-Left Stack Coin ── */}
      <g>
        <ellipse cx="64" cy="74" rx="11" ry="9" fill="url(#gold-rim)" />
        <ellipse cx="64" cy="73" rx="9.5" ry="7.5" fill="url(#gold-coin)" />
        <text
          x="64"
          y="76.5"
          textAnchor="middle"
          fill="#78350F"
          fontSize="9"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
        >
          ₹
        </text>
      </g>

      {/* ── COIN 3: Large Foreground Coin ── */}
      <g filter="url(#shadow-coin-2)">
        <ellipse cx="94" cy="98" rx="18" ry="16" fill="url(#gold-rim)" />
        <ellipse cx="94" cy="96" rx="15.5" ry="13.5" fill="url(#gold-coin)" />
        {/* Inner Embossed Ring */}
        <ellipse cx="94" cy="96" rx="13" ry="11" fill="none" stroke="#FDE68A" strokeWidth="1" opacity="0.7" />
        <text
          x="94"
          y="101"
          textAnchor="middle"
          fill="#78350F"
          fontSize="15"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
        >
          ₹
        </text>
        {/* Specular Glint */}
        <ellipse cx="88" cy="90" rx="3.5" ry="2" fill="#FFFFFF" opacity="0.75" />
      </g>

      {/* Sparkles */}
      <path
        d="M156 34 L158 39 L163 41 L158 43 L156 48 L154 43 L149 41 L154 39 Z"
        fill="#FDE047"
        opacity="0.9"
      />
      <circle cx="48" cy="48" r="2" fill="#DDD6FE" opacity="0.8" />
      <circle cx="165" cy="118" r="2.5" fill="#C4B5FD" opacity="0.6" />
    </svg>
  );
};
