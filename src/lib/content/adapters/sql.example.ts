import type { ContentRepository } from "@/lib/content/types";

/**
 * Example adapter for a SQL database (Drizzle, Prisma, Postgres, SQLite, or
 * Supabase). This file is a stub. It is not selected by default.
 *
 * Copy the shape into `custom.ts` and install the client you want. Do not add
 * that dependency until you set CONTENT_SOURCE=custom.
 *
 * Suggested tables, matching the repository:
 *
 *   posts(slug, title, category, description, content, external_url, date,
 *         reading_time, tags jsonb, cover_url, series_slug, part_order, updated_at)
 *   series(slug, title, type, description, content, date, tags jsonb, updated_at)
 *   projects(slug, title, description, content, date, link, image_url, image_alt,
 *            media_type, tags jsonb, updated_at)
 *   works(slug, title, category, description, content, date, technologies jsonb,
 *         link, media_url, media_type, media_width, media_height, tags jsonb, updated_at)
 *   inspirations(slug, name, url, blurb, about, category, kind, styles jsonb,
 *         tags jsonb, cover_url)
 *
 * Drizzle (Postgres or SQLite) sketch:
 *
 *   import { asc, eq } from "drizzle-orm";
 *   import { db } from "@/db";
 *   import { posts } from "@/db/schema";
 *
 *   async getPosts() {
 *     const rows = await db.select().from(posts).orderBy(asc(posts.date));
 *     return rows.map(mapPostRow);
 *   }
 *
 *   async getPost(slug: string) {
 *     const [row] = await db.select().from(posts).where(eq(posts.slug, slug));
 *     return row ? mapPostRow(row) : null;
 *   }
 *
 * Prisma sketch:
 *
 *   const rows = await prisma.post.findMany({ orderBy: { date: "desc" } });
 *
 * Supabase sketch:
 *
 *   const { data, error } = await supabase
 *     .from("posts")
 *     .select("*")
 *     .order("date", { ascending: false });
 *   if (error) throw error;
 *   return data.map(mapPostRow);
 *
 * Map rows onto the Blog, Series, Project, Work, and InspirationItem types
 * from `@/data` and `@/lib/inspirations`. Join series parts by `series_slug`.
 * `getByTag` can filter in SQL (`tags ? $1` in Postgres) or in memory.
 */
export function createSqlContentRepository(_db: unknown): ContentRepository {
  const unavailable = async () => {
    throw new Error(
      "Implement createSqlContentRepository in src/lib/content/adapters/sql.example.ts, then re-export it from custom.ts. CONTENT_SOURCE=custom is a stub until you do.",
    );
  };

  return {
    getPosts: unavailable,
    getPost: unavailable,
    getSeries: unavailable,
    getSeriesBySlug: unavailable,
    getProjects: unavailable,
    getProject: unavailable,
    getWorks: unavailable,
    getWork: unavailable,
    getInspirations: unavailable,
    getByTag: async (tag) => {
      await unavailable();
      return {
        tag,
        writings: [],
        series: [],
        projects: [],
        works: [],
      };
    },
  };
}
