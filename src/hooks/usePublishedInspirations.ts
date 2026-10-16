import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { InspirationItem } from "../lib/inspirations";

function useConvexConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}

export function usePublishedInspirations(): {
  items: InspirationItem[];
  isLoading: boolean;
  fromConvex: boolean;
} {
  const configured = useConvexConfigured();
  const rows = useQuery(
    api.inspirations.listPublished,
    configured ? {} : "skip",
  );

  if (!configured) {
    return { items: [], isLoading: false, fromConvex: false };
  }
  if (rows === undefined) {
    return { items: [], isLoading: true, fromConvex: false };
  }

  return {
    items: rows.map((row) => ({
      name: row.name,
      url: row.url,
      blurb: row.blurb,
      about: row.about,
      category: row.category,
      kind: row.kind,
      styles: row.styles,
      tags: row.tags,
      cover: row.coverUrl ?? undefined,
    })),
    isLoading: false,
    fromConvex: true,
  };
}
