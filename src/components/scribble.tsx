import { useState, useRef, useEffect } from "react";

interface OvalParams {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  ox?: number;
  oy?: number;
}

function drawOval({ cx, cy, rx, ry, ox = 0, oy = 0 }: OvalParams): string {
  const k = 0.552;
  const kx = rx * k;
  const ky = ry * k;
  const sx = cx + ox;
  const sy = cy - ry + oy;
  return [
    `M ${sx.toFixed(2)} ${sy.toFixed(2)}`,
    `C ${(sx + kx).toFixed(2)} ${sy.toFixed(2)}, ${(cx + rx).toFixed(2)} ${(cy - ky).toFixed(2)}, ${(cx + rx).toFixed(2)} ${cy.toFixed(2)}`,
    `C ${(cx + rx).toFixed(2)} ${(cy + ky).toFixed(2)}, ${(cx + kx * 0.7).toFixed(2)} ${(cy + ry).toFixed(2)}, ${cx.toFixed(2)} ${(cy + ry).toFixed(2)}`,
    `C ${(cx - kx * 0.7).toFixed(2)} ${(cy + ry).toFixed(2)}, ${(cx - rx).toFixed(2)} ${(cy + ky).toFixed(2)}, ${(cx - rx).toFixed(2)} ${cy.toFixed(2)}`,
    `C ${(cx - rx).toFixed(2)} ${(cy - ky).toFixed(2)}, ${(sx - kx * 0.5).toFixed(2)} ${(sy + 1).toFixed(2)}, ${sx.toFixed(2)} ${sy.toFixed(2)}`,
  ].join(" ");
}

export default function Scribble({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLSpanElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setDims({ w: Math.ceil(width), h: Math.ceil(height) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const w = dims?.w ?? 80;
  const h = dims?.h ?? 40;
  const cx = w / 2;
  const cy = h / 2;

  const path1 = drawOval({
    cx,
    cy,
    rx: w / 2 - 2,
    ry: h / 2 - 2,
    ox: -1.5,
    oy: 0.8,
  });
  const path2 = drawOval({
    cx,
    cy,
    rx: w / 2 - 5,
    ry: h / 2 - 4.5,
    ox: 2.5,
    oy: -1.5,
  });

  return (
    <span
      ref={outerRef}
      className="relative inline-flex items-center px-3 py-[5px] mx-px whitespace-nowrap text-zinc-900 dark:text-zinc-100"
    >
      <span className="relative z-[1]">{children}</span>
      {dims && (
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
        >
          <path
            d={path1}
            fill="none"
            className="stroke-zinc-900/70 dark:stroke-zinc-100/75"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={path2}
            fill="none"
            className="stroke-zinc-900/30 dark:stroke-zinc-100/30"
            strokeWidth="1.05"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
