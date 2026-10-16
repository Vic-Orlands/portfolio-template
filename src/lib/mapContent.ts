import type { Blog, BlogCategory, Project, Series, Work } from "../data";

export function mapPostToBlog(post: {
  slug: string;
  title: string;
  category: BlogCategory;
  description: string;
  content: string;
  externalUrl?: string;
  date: string;
  readingTime: string;
  tags?: string[];
  coverUrl?: string | null;
  updatedAt: number;
}): Blog {
  return {
    id: post.slug,
    title: post.title,
    category: post.category,
    description: post.description,
    content: post.content,
    externalUrl: post.externalUrl,
    date: post.date,
    readingTime: post.readingTime,
    tags: post.tags ?? [],
    coverUrl: post.coverUrl ?? null,
    updatedAt: post.updatedAt,
  };
}

export function mapSeries(row: {
  slug: string;
  title: string;
  type: string;
  description: string;
  content: string;
  date: string;
  tags?: string[];
  updatedAt: number;
  parts?: Array<{
    slug: string;
    title: string;
    category: BlogCategory;
    description: string;
    date: string;
    readingTime: string;
    externalUrl?: string;
  }>;
}): Series {
  return {
    id: row.slug,
    title: row.title,
    type: row.type,
    description: row.description,
    content: row.content,
    date: row.date,
    tags: row.tags ?? [],
    updatedAt: row.updatedAt,
    parts: row.parts?.map((p) => ({
      id: p.slug,
      title: p.title,
      category: p.category,
      description: p.description,
      date: p.date,
      readingTime: p.readingTime,
      externalUrl: p.externalUrl,
    })),
  };
}

export function mapProject(row: {
  slug: string;
  title: string;
  description: string;
  content?: string;
  date: string;
  link: string;
  imageUrl?: string | null;
  imageAlt?: string;
  mediaType?: "image" | "video";
  tags?: string[];
  updatedAt: number;
}): Project {
  return {
    id: row.slug,
    title: row.title,
    description: row.description,
    content: row.content ?? "",
    date: row.date,
    link: row.link,
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
    mediaType: row.mediaType,
    tags: row.tags ?? [],
    updatedAt: row.updatedAt,
  };
}

export function mapWork(row: {
  slug: string;
  title: string;
  category: Work["category"];
  description: string;
  date: string;
  content: string;
  technologies: string[];
  link?: string;
  mediaUrl?: string | null;
  mediaType?: "image" | "video";
  mediaWidth?: number;
  mediaHeight?: number;
  galleryMedia?: Array<{
    id: string;
    url: string;
    mediaType: "image" | "video";
    width?: number;
    height?: number;
    alt?: string;
  }>;
  tags?: string[];
  updatedAt: number;
}): Work {
  return {
    id: row.slug,
    title: row.title,
    category: row.category,
    description: row.description,
    date: row.date,
    content: row.content,
    technologies: row.technologies,
    link: row.link,
    mediaUrl: row.mediaUrl,
    mediaType: row.mediaType,
    mediaWidth: row.mediaWidth,
    mediaHeight: row.mediaHeight,
    galleryMedia: row.galleryMedia ?? [],
    tags: row.tags ?? [],
    updatedAt: row.updatedAt,
  };
}
