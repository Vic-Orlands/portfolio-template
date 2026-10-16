import type { Metadata } from "next";

export type InspirationCategory =
  | "design"
  | "writing"
  | "tools"
  | "ai"
  | "reference";

export type InspirationNavId = InspirationCategory | "all" | "skills";

export type InspirationItem = {
  name: string;
  url: string;
  blurb: string;
  about: string;
  category: InspirationCategory;
  kind: string;
  styles: string[];
  tags?: string[];
  cover?: string;
};

/** Pill / sidebar tabs shared by list + grid views. */
export const inspirationNavTabs: {
  id: InspirationNavId;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "design", label: "Crafts & Demos" },
  { id: "writing", label: "Writing" },
  { id: "tools", label: "Tools" },
  { id: "ai", label: "AI & LLMs" },
  { id: "reference", label: "Design Engineer" },
];

/** Bookmark / admin category pills (no Skills). */
export const inspirationCategories: {
  id: InspirationCategory | "all";
  label: string;
}[] = inspirationNavTabs.filter(
  (tab): tab is { id: InspirationCategory | "all"; label: string } =>
    tab.id !== "skills",
);

/** Left-rail tabs for the grid layout. */
export const inspirationSidebarTabs = inspirationNavTabs;

export const categoryLabels: Record<InspirationCategory, string> = {
  design: "Crafts & Demos",
  writing: "Writing",
  tools: "Tools",
  ai: "AI & LLMs",
  reference: "Design Engineer",
};

export function inspirationHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

export function inspirationCoverUrl(item: InspirationItem): string {
  if (item.cover) return item.cover;
  return `https://image.thum.io/get/width/1400/crop/900/noanimate/${item.url}`;
}

export function inspirationFaviconUrl(url: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(inspirationHostname(url))}&sz=64`;
}

export function filterInspirationItems(
  items: InspirationItem[],
  opts: {
    category?: InspirationNavId | "all";
    query?: string;
    kind?: string;
  },
): InspirationItem[] {
  const query = opts.query?.trim().toLowerCase() ?? "";
  const kind = opts.kind?.trim() ?? "";

  return items.filter((item) => {
    if (
      opts.category &&
      opts.category !== "all" &&
      opts.category !== "skills" &&
      item.category !== opts.category
    ) {
      return false;
    }
    if (kind && item.kind !== kind) return false;
    if (!query) return true;
    const haystack = [
      item.name,
      item.blurb,
      item.about,
      item.kind,
      item.url,
      categoryLabels[item.category],
      ...(item.styles ?? []),
      ...(item.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function uniqueInspirationKinds(
  items: InspirationItem[],
  category?: InspirationNavId | "all",
): string[] {
  const scoped =
    !category || category === "all" || category === "skills"
      ? items
      : items.filter((item) => item.category === category);
  return [...new Set(scoped.map((item) => item.kind).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b),
  );
}

export const inspirationsMetadata: Metadata = {
  title: "Inspirations",
  description:
    "Sample websites, tools, and references. Replace content/inspirations.json with your own list.",
  alternates: { canonical: "/inspirations" },
};
