/**
 * Abstract schematic: layered system components joined to a small network of nodes.
 * Contains no text and no claims; the page is complete without it. Static, no animation.
 */
export function HeroVisual() {
  return (
    <svg viewBox="0 0 480 440" fill="none" className="ml-auto w-full max-w-md" focusable="false">
      <defs>
        <radialGradient id="hero-halo">
          <stop offset="0" stopColor="var(--brand-blue)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--brand-blue)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--brand-cyan)" />
          <stop offset="0.4" stopColor="var(--brand-blue)" />
          <stop offset="0.75" stopColor="var(--brand-violet)" />
          <stop offset="1" stopColor="var(--brand-magenta)" />
        </linearGradient>
      </defs>

      <circle cx="240" cy="220" r="208" fill="url(#hero-halo)" />
      <rect x="8" y="8" width="464" height="424" rx="24" className="stroke-border" />

      {/* Layers */}
      <g className="hero-visual-drift fill-surface stroke-border-strong">
        <rect x="48" y="48" width="280" height="76" rx="14" />
        <rect x="48" y="182" width="280" height="76" rx="14" />
        <rect x="48" y="316" width="280" height="76" rx="14" />
      </g>
      <g className="stroke-border-strong">
        <rect x="68" y="68" width="56" height="36" rx="6" />
        <rect x="136" y="68" width="56" height="36" rx="6" />
        <path d="M212 78h92M212 94h60" strokeLinecap="round" />
        <path d="M68 210h132M68 230h92M232 210h72M232 230h40" strokeLinecap="round" />
        <path d="M84 344h72M84 364h44" strokeLinecap="round" />
        <rect x="236" y="336" width="68" height="36" rx="6" />
      </g>

      {/* Vertical flow between layers */}
      <g className="hero-visual-dash" stroke="url(#hero-gradient)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M188 124v58M188 258v58" />
      </g>
      <g className="fill-background" stroke="var(--brand-cyan)" strokeWidth="1.5">
        <circle cx="188" cy="124" r="4" className="hero-visual-pulse" />
        <circle cx="188" cy="182" r="4" className="hero-visual-pulse" />
        <circle cx="188" cy="258" r="4" className="hero-visual-pulse" />
        <circle cx="188" cy="316" r="4" className="hero-visual-pulse" />
      </g>

      {/* Connections to the node network */}
      <g className="stroke-border-strong">
        <path d="M328 86h58M328 220h78M328 354h46" />
        <path d="M400 104v100M420 236v100" />
      </g>
      <g className="fill-background" stroke="url(#hero-gradient)" strokeWidth="1.5">
        <circle cx="400" cy="90" r="14" className="hero-visual-pulse" />
        <circle cx="420" cy="220" r="14" className="hero-visual-pulse" />
        <circle cx="390" cy="354" r="14" className="hero-visual-pulse" />
      </g>
      <circle cx="420" cy="220" r="5" fill="url(#hero-gradient)" />
    </svg>
  );
}
