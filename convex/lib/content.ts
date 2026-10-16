import { v } from "convex/values";
import { statusValidator } from "../schema";
import { Doc, Id } from "../_generated/dataModel";
import { getR2Url } from "./r2";

export const statusField = statusValidator;

export async function resolveStorageUrl(
  ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
  storageId: Id<"_storage"> | undefined,
): Promise<string | null> {
  if (!storageId) return null;
  return await ctx.storage.getUrl(storageId);
}

export async function resolveMediaUrl(
  ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
  key: string | undefined,
  storageId: Id<"_storage"> | undefined,
): Promise<string | null> {
  if (key) return await getR2Url(key);
  return await resolveStorageUrl(ctx, storageId);
}

export function publishedSort(
  a: { publishedAt?: number; updatedAt: number },
  b: { publishedAt?: number; updatedAt: number },
): number {
  return (b.publishedAt ?? b.updatedAt) - (a.publishedAt ?? a.updatedAt);
}

const monthNumber: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function writingDateValue(date: string): number | null {
  const value = date.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) {
    return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }

  const readable =
    /^([A-Za-z]+)\s+(?:(\d{1,2}),?\s+)?(\d{4})$/.exec(value);
  if (!readable) return null;
  const month = monthNumber[readable[1]!.toLowerCase()];
  if (month === undefined) return null;
  return Date.UTC(Number(readable[3]), month, Number(readable[2] ?? 1));
}

/** Writing archive order — newest publication date first. */
export function byWritingDateDescending(
  a: {
    date: string;
    publishedAt?: number;
    updatedAt: number;
    _creationTime: number;
  },
  b: {
    date: string;
    publishedAt?: number;
    updatedAt: number;
    _creationTime: number;
  },
): number {
  const aDate = writingDateValue(a.date);
  const bDate = writingDateValue(b.date);
  if (aDate !== null && bDate !== null && aDate !== bDate) {
    return bDate - aDate;
  }
  if (aDate !== null && bDate === null) return -1;
  if (aDate === null && bDate !== null) return 1;

  return (
    (b.publishedAt ?? b.updatedAt ?? b._creationTime) -
    (a.publishedAt ?? a.updatedAt ?? a._creationTime)
  );
}

/** Manual homepage/admin order — lower comes first. Falls back to creation time. */
export function bySortOrder(
  a: { sortOrder?: number; _creationTime: number },
  b: { sortOrder?: number; _creationTime: number },
): number {
  const ao = a.sortOrder ?? a._creationTime;
  const bo = b.sortOrder ?? b._creationTime;
  return ao - bo;
}

import { MutationCtx } from "../_generated/server";

export async function nextSortOrder(
  ctx: MutationCtx,
  table: "posts" | "series" | "projects" | "works" | "inspirations",
): Promise<number> {
  const rows = await ctx.db.query(table).collect();
  if (rows.length === 0) return 0;
  let max = -1;
  for (const row of rows) {
    if (typeof row.sortOrder === "number" && row.sortOrder > max) {
      max = row.sortOrder;
    }
  }
  return max + 1;
}

export function nextPublishedAt(
  status: "draft" | "published",
  existing?:
    | Doc<"posts">
    | Doc<"series">
    | Doc<"projects">
    | Doc<"works">
    | Doc<"inspirations">,
  now = Date.now(),
): number | undefined {
  if (status !== "published") return undefined;
  if (existing?.status === "published" && existing.publishedAt) {
    return existing.publishedAt;
  }
  return now;
}

export const commonStatusReturns = v.union(
  v.literal("draft"),
  v.literal("published"),
);
