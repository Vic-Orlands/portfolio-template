"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { InspirationsPageClient } from "@/components/portfolio/InspirationsPageClient";

type InspirationsPageWithConvexProps = {
  preloadedInspirations: Preloaded<typeof api.inspirations.listPublished>;
};

export function InspirationsPageWithConvex({
  preloadedInspirations,
}: InspirationsPageWithConvexProps) {
  const items = usePreloadedQuery(preloadedInspirations).map((row) => ({
    name: row.name,
    url: row.url,
    blurb: row.blurb,
    about: row.about,
    category: row.category,
    kind: row.kind,
    styles: row.styles,
    tags: row.tags,
    cover: row.coverUrl ?? undefined,
  }));

  return <InspirationsPageClient items={items} />;
}
