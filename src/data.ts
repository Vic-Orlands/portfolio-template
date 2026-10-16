export interface Project {
  id: string;
  title: string;
  description: string;
  content?: string;
  date: string;
  link: string;
  imageUrl?: string | null;
  imageAlt?: string;
  mediaType?: "image" | "video";
  tags?: string[];
  updatedAt?: number;
}

export type BlogCategory = "tech" | "scriptures" | "other";

export interface Blog {
  id: string;
  title: string;
  category: BlogCategory;
  description: string;
  content: string;
  externalUrl?: string;
  date: string;
  readingTime: string;
  tags?: string[];
  coverUrl?: string | null;
  updatedAt?: number;
}

export interface SeriesPart {
  id: string;
  title: string;
  category: BlogCategory;
  description: string;
  date: string;
  readingTime: string;
  externalUrl?: string;
}

export interface Series {
  id: string;
  title: string;
  type: string;
  description: string;
  content: string;
  date: string;
  /** Writings linked under this series. */
  parts?: SeriesPart[];
  tags?: string[];
  updatedAt?: number;
}

export interface Work {
  id: string;
  title: string;
  category: "3D" | "Grid" | "Card";
  description: string;
  date: string;
  content: string;
  technologies: string[];
  link?: string;
  /** Optional uploaded image/video for media-first showcase. */
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
  updatedAt?: number;
}
