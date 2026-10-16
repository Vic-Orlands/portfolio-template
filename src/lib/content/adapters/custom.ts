import type { ContentRepository } from "@/lib/content/types";
import { createSqlContentRepository } from "@/lib/content/adapters/sql.example";

/**
 * CONTENT_SOURCE=custom loads this module.
 * Replace the body with your Drizzle, Prisma, or Supabase repository.
 * The SQL sketch lives in `./sql.example.ts`.
 */
export const customContentRepository: ContentRepository =
  createSqlContentRepository(null);
