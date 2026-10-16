import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const blogCategoryValidator = v.union(
  v.literal("tech"),
  v.literal("scriptures"),
  v.literal("other"),
);

export const workCategoryValidator = v.union(
  v.literal("3D"),
  v.literal("Grid"),
  v.literal("Card"),
);

export const statusValidator = v.union(
  v.literal("draft"),
  v.literal("published"),
);

export const inspirationCategoryValidator = v.union(
  v.literal("design"),
  v.literal("writing"),
  v.literal("tools"),
  v.literal("ai"),
  v.literal("reference"),
);

export default defineSchema({
  posts: defineTable({
    slug: v.string(),
    title: v.string(),
    category: blogCategoryValidator,
    description: v.string(),
    content: v.string(),
    externalUrl: v.optional(v.string()),
    date: v.string(),
    readingTime: v.string(),
    status: statusValidator,
    coverStorageId: v.optional(v.id("_storage")),
    coverKey: v.optional(v.string()),
    seriesId: v.optional(v.id("series")),
    partOrder: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_status_and_category", ["status", "category"])
    .index("by_series", ["seriesId"]),

  series: defineTable({
    slug: v.string(),
    title: v.string(),
    type: v.string(),
    description: v.string(),
    content: v.string(),
    date: v.string(),
    status: statusValidator,
    coverStorageId: v.optional(v.id("_storage")),
    coverKey: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  projects: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.optional(v.string()),
    date: v.string(),
    link: v.string(),
    status: statusValidator,
    imageStorageId: v.optional(v.id("_storage")),
    imageKey: v.optional(v.string()),
    imageAlt: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    sortOrder: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  works: defineTable({
    slug: v.string(),
    title: v.string(),
    category: workCategoryValidator,
    description: v.string(),
    date: v.string(),
    previewType: v.optional(v.string()),
    content: v.string(),
    technologies: v.array(v.string()),
    link: v.optional(v.string()),
    status: statusValidator,
    mediaStorageId: v.optional(v.id("_storage")),
    mediaKey: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    mediaWidth: v.optional(v.number()),
    mediaHeight: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  workMedia: defineTable({
    workId: v.id("works"),
    storageId: v.optional(v.id("_storage")),
    key: v.optional(v.string()),
    mediaType: v.union(v.literal("image"), v.literal("video")),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    alt: v.optional(v.string()),
    sortOrder: v.number(),
    createdAt: v.number(),
  }).index("by_work_and_order", ["workId", "sortOrder"]),

  inspirations: defineTable({
    slug: v.string(),
    name: v.string(),
    url: v.string(),
    blurb: v.string(),
    about: v.string(),
    category: inspirationCategoryValidator,
    kind: v.string(),
    styles: v.array(v.string()),
    tags: v.optional(v.array(v.string())),
    status: statusValidator,
    coverStorageId: v.optional(v.id("_storage")),
    coverKey: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_status_and_category", ["status", "category"]),

  adminSessions: defineTable({
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  comments: defineTable({
    itemId: v.string(),
    itemType: v.union(
      v.literal("blog"),
      v.literal("series"),
      v.literal("work"),
    ),
    author: v.string(),
    body: v.string(),
    parentId: v.optional(v.id("comments")),
    createdAt: v.number(),
  })
    .index("by_item", ["itemId"])
    .index("by_parent", ["parentId"]),
});
