import type { ServiceIcon } from "@/config/content";

const common = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function Icon({ name, className }: { name: ServiceIcon; className?: string }) {
  switch (name) {
    case "cog": // workflow automation
      return (
        <svg {...common} className={className}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.85 1.85M7.35 16.65L5.5 18.5M18.5 18.5l-1.85-1.85M7.35 7.35L5.5 5.5" />
        </svg>
      );
    case "cube": // custom ERP
      return (
        <svg {...common} className={className}>
          <path d="M12 2.8l8 4.4v9.6l-8 4.4-8-4.4V7.2z" />
          <path d="M4 7.2l8 4.4 8-4.4M12 11.6v9.6" />
        </svg>
      );
    case "migrate": // platform migration
      return (
        <svg {...common} className={className}>
          <rect x="2.8" y="5" width="7.4" height="14" rx="1.6" />
          <rect x="13.8" y="5" width="7.4" height="14" rx="1.6" />
          <path d="M6.5 12h11M14.6 8.8L17.8 12l-3.2 3.2" />
        </svg>
      );
    case "factory":
      return (
        <svg {...common} className={className}>
          <path d="M3 20.5V10l5.5 3.5V10l5.5 3.5V6.2h3.4V20.5z" />
          <path d="M3 20.5h18M17.4 6.2V3.6M7.4 17h1.2M12 17h1.2M16.4 17h1.2" />
        </svg>
      );
    case "browser":
      return (
        <svg {...common} className={className}>
          <rect x="2.8" y="4.2" width="18.4" height="15.6" rx="2.2" />
          <path d="M2.8 9h18.4M6.3 6.6h.01M9 6.6h.01M12 14.5h6M12 12.2h3.2M6.2 12.2h3v5h-3z" />
        </svg>
      );
    case "boxes": // inventory
      return (
        <svg {...common} className={className}>
          <path d="M3.5 12.5h7v7.5h-7zM13.5 12.5h7v7.5h-7zM8.5 4h7v7.5h-7z" />
          <path d="M5.8 15.2h2.4M15.8 15.2h2.4M10.8 6.7h2.4" />
        </svg>
      );
    case "bolt": // automation platforms
      return (
        <svg {...common} className={className}>
          <path d="M13.2 2.8L5 13.2h6l-1.2 8 8.2-10.6h-6z" />
        </svg>
      );
  }
}

export function ArrowRight({ className = "", size = 18 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Check({ className = "", size = 16 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4.5 12.5l5 5 10-11" />
    </svg>
  );
}
