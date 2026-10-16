import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Blog, Project, Series, Work } from "../data";
import {
  mapPostToBlog,
  mapProject,
  mapSeries,
  mapWork,
} from "../lib/mapContent";

function useConvexConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}

export function usePublishedBlogs(): {
  blogs: Blog[];
  isLoading: boolean;
  fromConvex: boolean;
} {
  const configured = useConvexConfigured();
  const posts = useQuery(api.posts.listPublished, configured ? {} : "skip");

  if (!configured) {
    return { blogs: [], isLoading: false, fromConvex: false };
  }
  if (posts === undefined) {
    return { blogs: [], isLoading: true, fromConvex: false };
  }
  return {
    blogs: posts.map(mapPostToBlog),
    isLoading: false,
    fromConvex: true,
  };
}

export function usePublishedSeries(): {
  series: Series[];
  isLoading: boolean;
} {
  const configured = useConvexConfigured();
  const rows = useQuery(api.series.listPublished, configured ? {} : "skip");

  if (!configured) {
    return { series: [], isLoading: false };
  }
  if (rows === undefined) {
    return { series: [], isLoading: true };
  }
  return { series: rows.map(mapSeries), isLoading: false };
}

export function usePublishedProjects(): {
  projects: Project[];
  isLoading: boolean;
} {
  const configured = useConvexConfigured();
  const rows = useQuery(api.projects.listPublished, configured ? {} : "skip");

  if (!configured) {
    return { projects: [], isLoading: false };
  }
  if (rows === undefined) {
    return { projects: [], isLoading: true };
  }
  return { projects: rows.map(mapProject), isLoading: false };
}

export function usePublishedWorks(): {
  works: Work[];
  isLoading: boolean;
} {
  const configured = useConvexConfigured();
  const rows = useQuery(api.works.listPublished, configured ? {} : "skip");

  if (!configured) {
    return { works: [], isLoading: false };
  }
  if (rows === undefined) {
    return { works: [], isLoading: true };
  }
  return { works: rows.map(mapWork), isLoading: false };
}
