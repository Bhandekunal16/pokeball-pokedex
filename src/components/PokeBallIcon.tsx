interface PokeBallIconProps {
  className?: string;
  size?: number;
  spinning?: boolean;
}

export function PokeBallIcon({ className = '', size = 24, spinning = false }: PokeBallIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform ${spinning ? 'animate-spin' : ''} ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Red dome gradient */}
        <linearGradient id="pokeballRed" x1="50" y1="2" x2="50" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="60%" stopColor="#E53935" />
          <stop offset="100%" stopColor="#C62828" />
        </linearGradient>

        {/* White bottom dome gradient */}
        <linearGradient id="pokeballWhite" x1="50" y1="52" x2="50" y2="98" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F3F4F6" />
          <stop offset="100%" stopColor="#E5E7EB" />
        </linearGradient>

        {/* Button core glow */}
        <radialGradient id="pokeballCenterGlow" cx="50" cy="50" r="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#F9FAFB" />
          <stop offset="100%" stopColor="#D1D5DB" />
        </radialGradient>
      </defs>

      {/* Outer subtle shadow/border circle */}
      <circle cx="50" cy="50" r="48" fill="#111111" />

      {/* Top red hemisphere (clipped) */}
      <path
        d="M 4 50 A 46 46 0 0 1 96 50 Z"
        fill="url(#pokeballRed)"
      />

      {/* Bottom white hemisphere (clipped) */}
      <path
        d="M 4 50 A 46 46 0 0 0 96 50 Z"
        fill="url(#pokeballWhite)"
      />

      {/* Center black band */}
      <rect x="4" y="45" width="92" height="10" fill="#111111" />

      {/* Center outer black ring */}
      <circle cx="50" cy="50" r="16" fill="#111111" />

      {/* Center button white ring */}
      <circle cx="50" cy="50" r="11" fill="url(#pokeballCenterGlow)" />

      {/* Center inner metallic button core */}
      <circle cx="50" cy="50" r="6" fill="#FFFFFF" stroke="#9CA3AF" strokeWidth="1.5" />
    </svg>
  );
}
