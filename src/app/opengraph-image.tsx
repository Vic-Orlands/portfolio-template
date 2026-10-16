import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** SVG blueprint grid — more reliable in Satori than CSS backgroundSize. */
const gridSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0H0M0 0V32" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>
    </pattern>
    <pattern id="g2" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="translate(7 7)">
      <path d="M32 0H0M0 0V32" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
    <radialGradient id="fade" cx="50%" cy="50%" rx="70%" ry="70%">
      <stop offset="30%" stop-color="white" stop-opacity="1"/>
      <stop offset="75%" stop-color="white" stop-opacity="0"/>
    </radialGradient>
    <mask id="m">
      <rect width="1200" height="630" fill="url(#fade)"/>
    </mask>
  </defs>
  <rect width="1200" height="630" fill="url(#g)" mask="url(#m)"/>
  <rect width="1200" height="630" fill="url(#g2)" mask="url(#m)"/>
</svg>`;

const gridDataUrl = `data:image/svg+xml;base64,${Buffer.from(gridSvg).toString("base64")}`;

export default async function OpenGraphImage() {
  const fontBold = await readFile(
    join(
      process.cwd(),
      "public/fonts/neue-haas-grotesk/neue-haas-grotesk-text-bold.otf",
    ),
  );
  const fontRegular = await readFile(
    join(
      process.cwd(),
      "public/fonts/neue-haas-grotesk/neue-haas-grotesk-text-regular.otf",
    ),
  );

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        background: "#121214",
        color: "#fafafa",
        overflow: "hidden",
        fontFamily: "NeueHaas",
      }}
    >
      <img
        src={gridDataUrl}
        width={1200}
        height={630}
        alt=""
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          padding: "0 64px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#a1a1aa",
            letterSpacing: "0.01em",
          }}
        >
          {siteConfig.author.email}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontSize: 18,
            color: "#71717a",
            maxWidth: 640,
            lineHeight: 1.4,
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "NeueHaas", data: fontBold, weight: 700, style: "normal" },
        { name: "NeueHaas", data: fontRegular, weight: 400, style: "normal" },
      ],
    },
  );
}
