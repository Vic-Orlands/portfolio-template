import type { BlogCategory } from "../data";

export { mapPostToBlog } from "./mapContent";

export interface ConvexPost {
  _id: string;
  slug: string;
  title: string;
  category: BlogCategory;
  description: string;
  content: string;
  externalUrl?: string;
  date: string;
  readingTime: string;
  status: "draft" | "published";
  coverUrl: string | null;
  seriesId?: string;
  partOrder?: number;
  updatedAt: number;
  publishedAt?: number;
}
