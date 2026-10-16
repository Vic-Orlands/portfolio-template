"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { mapWork } from "@/lib/mapContent";
import { WorksPageClient } from "@/components/portfolio/WorksPageClient";

type WorksPageWithConvexProps = {
  preloadedWorks: Preloaded<typeof api.works.listPublished>;
};

export function WorksPageWithConvex({
  preloadedWorks,
}: WorksPageWithConvexProps) {
  const works = usePreloadedQuery(preloadedWorks).map(mapWork);
  return <WorksPageClient works={works} />;
}
