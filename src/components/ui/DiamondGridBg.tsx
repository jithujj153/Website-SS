/**
 * Subtle animated diamond-grid background (pure CSS/SVG, no JS).
 * A pattern of the logo's diamond drifts slowly under a radial mask.
 */
export function DiamondGridBg({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <svg className="ss-grid-drift absolute -inset-[20%] h-[140%] w-[140%]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ss-diamonds" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M36 4L68 36L36 68L4 36Z" fill="none" stroke="rgb(45 183 219)" strokeOpacity="0.16" strokeWidth="1" />
            <path d="M36 32L40 36L36 40L32 36Z" fill="rgb(45 183 219)" fillOpacity="0.28" />
          </pattern>
          <radialGradient id="ss-grid-fade" cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id="ss-grid-mask">
            <rect width="100%" height="100%" fill="url(#ss-grid-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#ss-diamonds)" mask="url(#ss-grid-mask)" />
      </svg>
      <style>{`
        @keyframes ss-drift { from { transform: translate3d(0,0,0); } to { transform: translate3d(-72px,-72px,0); } }
        .ss-grid-drift { animation: ss-drift 18s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .ss-grid-drift { animation: none; } }
      `}</style>
    </div>
  );
}
