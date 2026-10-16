import type { Blog, Project, Series, Work } from "@/data";
import type { InspirationItem } from "@/lib/inspirations";

export type TagBundle = {
  tag: string;
  writings: Array<{
    slug: string;
    title: string;
    description: string;
    date: string;
    category: Blog["category"];
    externalUrl?: string;
    tags: string[];
  }>;
  series: Array<{
    slug: string;
    title: string;
    description: string;
    date: string;
    type: string;
    tags: string[];
  }>;
  projects: Array<{
    slug: string;
    title: string;
    description: string;
    date: string;
    link: string;
    tags: string[];
  }>;
  works: Array<{
    slug: string;
    title: string;
    description: string;
    date: string;
    category: Work["category"];
    tags: string[];
  }>;
};

/**
 * Read API for portfolio content. Pages and routes depend on this interface.
 * Adapters live in `src/lib/content/adapters`.
 */
export interface ContentRepository {
  getPosts(): Promise<Blog[]>;
  getPost(slug: string): Promise<Blog | null>;
  getSeries(): Promise<Series[]>;
  getSeriesBySlug(slug: string): Promise<Series | null>;
  getProjects(): Promise<Project[]>;
  getProject(slug: string): Promise<Project | null>;
  getWorks(): Promise<Work[]>;
  getWork(slug: string): Promise<Work | null>;
  getInspirations(): Promise<InspirationItem[]>;
  getByTag(tag: string): Promise<TagBundle>;
}
