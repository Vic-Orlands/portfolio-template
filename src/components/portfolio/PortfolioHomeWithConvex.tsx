"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  mapPostToBlog,
  mapProject,
  mapSeries,
  mapWork,
} from "@/lib/mapContent";
import { PortfolioHome } from "@/components/portfolio/PortfolioHome";

type PortfolioHomeWithConvexProps = {
  preloadedBlogs: Preloaded<typeof api.posts.listPublished>;
  preloadedProjects: Preloaded<typeof api.projects.listPublished>;
  preloadedSeries: Preloaded<typeof api.series.listPublished>;
  preloadedWorks: Preloaded<typeof api.works.listPublished>;
};

export function PortfolioHomeWithConvex({
  preloadedBlogs,
  preloadedProjects,
  preloadedSeries,
  preloadedWorks,
}: PortfolioHomeWithConvexProps) {
  const blogs = usePreloadedQuery(preloadedBlogs).map(mapPostToBlog);
  const projects = usePreloadedQuery(preloadedProjects).map(mapProject);
  const series = usePreloadedQuery(preloadedSeries).map(mapSeries);
  const works = usePreloadedQuery(preloadedWorks).map(mapWork);

  return (
    <PortfolioHome
      blogs={blogs}
      projects={projects}
      series={series}
      works={works}
    />
  );
}
