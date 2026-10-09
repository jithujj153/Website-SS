import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default Open Graph card for every page (blog posts can override with their own metadata).
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(900px 500px at 85% 15%, rgba(35,71,197,0.55), transparent 60%), #060b1a",
          color: "#eaf2ff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 44, height: 44, transform: "rotate(45deg)", background: "linear-gradient(135deg,#2db7db,#2347c5)", display: "flex" }} />
          <div style={{ fontSize: 34, letterSpacing: 6, fontWeight: 700 }}>SYSTEM-SMITHS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2, maxWidth: 940 }}>Turning ideas into reality.</div>
          <div style={{ fontSize: 30, color: "#8fa3c4", maxWidth: 860 }}>Custom business systems and ready-to-run software for operations-heavy businesses.</div>
        </div>
        <div style={{ display: "flex", gap: 36, fontSize: 26, color: "#2db7db" }}>
          <span>40+ projects delivered</span>
          <span>20+ clients served</span>
          <span>MVP in as little as 2 days</span>
        </div>
      </div>
    ),
    size,
  );
}
