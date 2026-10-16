"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ScribblesPageClient } from "@/components/portfolio/ScribblesPageClient";
import { mapWork } from "@/lib/mapContent";

type ScribblesPageWithConvexProps = {
  preloadedWorks: Preloaded<typeof api.works.listPublished>;
};

export function ScribblesPageWithConvex({
  preloadedWorks,
}: ScribblesPageWithConvexProps) {
  const works = usePreloadedQuery(preloadedWorks).map(mapWork);
  return <ScribblesPageClient works={works} />;
}
