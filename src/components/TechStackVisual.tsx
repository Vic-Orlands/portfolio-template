type StackItem = {
  label: string;
  icon: string;
};

const STACK_COLORS: Record<string, string> = {
  cloudflare: "#F38020",
  cloudflareworkers: "#F38020",
  convex: "#EE342F",
  docker: "#2496ED",
  drizzle: "#C5F74F",
  firebase: "#FFCA28",
  go: "#00ADD8",
  googlecloud: "#4285F4",
  googlegemini: "#8E75B2",
  grafana: "#F46800",
  neon: "#00E599",
  opentelemetry: "#425CC7",
  postgresql: "#4169E1",
  prometheus: "#E6522C",
  react: "#61DAFB",
  resend: "currentColor",
  rust: "#DEA584",
  sqlite: "#003B57",
  svelte: "#FF3E00",
  tailwindcss: "#06B6D4",
  threedotjs: "currentColor",
  typescript: "#3178C6",
  vercel: "currentColor",
};

function parseStack(code: string): StackItem[] {
  return code
    .split(/[;\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [label, icon] = entry.split("|").map((part) => part.trim());
      return {
        label,
        icon: icon || label.toLowerCase().replace(/[^a-z0-9]+/g, ""),
      };
    })
    .filter((item) => item.label);
}

export function TechStackVisual({ code }: { code: string }) {
  const items = parseStack(code);
  if (!items.length) return null;

  return (
    <span
      className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 align-baseline text-zinc-950 dark:text-zinc-100"
      aria-label={`Technologies: ${items.map((item) => item.label).join(", ")}`}
    >
      {items.map((item, index) => (
        <span
          key={`${item.label}-${item.icon}`}
          className="inline-flex items-baseline gap-1 whitespace-nowrap font-medium"
        >
          {index > 0 ? (
            <span aria-hidden="true" className="font-normal text-zinc-500">
              ·
            </span>
          ) : null}
          <span>{item.label}</span>
          <span
            aria-hidden="true"
            title={item.label}
            className="mr-1.5 inline-block size-[1.08em] shrink-0 translate-y-[0.14em]"
            style={{
              backgroundColor: STACK_COLORS[item.icon] ?? "currentColor",
              maskImage: `url(/stack-icons/${item.icon}.svg)`,
              maskPosition: "center",
              maskRepeat: "no-repeat",
              maskSize: item.icon === "resend" ? "200%" : "contain",
              WebkitMaskImage: `url(/stack-icons/${item.icon}.svg)`,
              WebkitMaskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: item.icon === "resend" ? "200%" : "contain",
            }}
          />
        </span>
      ))}
    </span>
  );
}
