import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { blogCategoryValidator } from "./schema";
import { requireAdminSession } from "./lib/auth";
import { estimateReadingTime, slugify } from "./lib/readingTime";
import { Doc, Id } from "./_generated/dataModel";
import {
  byWritingDateDescending,
  nextSortOrder,
  resolveMediaUrl,
} from "./lib/content";
import { normalizeTags } from "./lib/tags";
import { internal } from "./_generated/api";

const publicPostValidator = v.object({
  _id: v.id("posts"),
  _creationTime: v.number(),
  slug: v.string(),
  title: v.string(),
  category: blogCategoryValidator,
  description: v.string(),
  content: v.string(),
  externalUrl: v.optional(v.string()),
  date: v.string(),
  readingTime: v.string(),
  status: v.union(v.literal("draft"), v.literal("published")),
  coverUrl: v.union(v.string(), v.null()),
  coverKey: v.optional(v.string()),
  seriesId: v.optional(v.id("series")),
  partOrder: v.optional(v.number()),
  sortOrder: v.optional(v.number()),
  tags: v.array(v.string()),
  updatedAt: v.number(),
  publishedAt: v.optional(v.number()),
});

async function withCoverUrl(
  ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
  post: Doc<"posts">,
) {
  const coverUrl = await resolveMediaUrl(
    ctx,
    post.coverKey,
    post.coverStorageId,
  );
  const { coverStorageId: _coverStorageId, tags: _tags, ...rest } = post;
  return { ...rest, coverUrl, tags: post.tags ?? [] };
}

function normalizeExternalUrl(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("External URL must be a valid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("External URL must use http or https");
  }
  return url.toString();
}

export const listPublished = query({
  args: {
    category: v.optional(blogCategoryValidator),
  },
  returns: v.array(publicPostValidator),
  handler: async (ctx, args) => {
    let posts: Doc<"posts">[];
    if (args.category) {
      posts = await ctx.db
        .query("posts")
        .withIndex("by_status_and_category", (q) =>
          q.eq("status", "published").eq("category", args.category!),
        )
        .collect();
    } else {
      posts = await ctx.db
        .query("posts")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect();
    }

    posts.sort(byWritingDateDescending);
    return await Promise.all(posts.map((post) => withCoverUrl(ctx, post)));
  },
});

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(publicPostValidator, v.null()),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!post || post.status !== "published") {
      return null;
    }

    return await withCoverUrl(ctx, post);
  },
});

export const listAll = query({
  args: {
    sessionToken: v.string(),
    now: v.number(),
  },
  returns: v.array(publicPostValidator),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, args.now);
    const posts = await ctx.db.query("posts").collect();
    posts.sort(byWritingDateDescending);
    return await Promise.all(posts.map((post) => withCoverUrl(ctx, post)));
  },
});

export const getAdmin = query({
  args: {
    sessionToken: v.string(),
    now: v.number(),
    postId: v.id("posts"),
  },
  returns: v.union(publicPostValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, args.now);
    const post = await ctx.db.get(args.postId);
    if (!post) return null;
    return await withCoverUrl(ctx, post);
  },
});

export const create = mutation({
  args: {
    sessionToken: v.string(),
    title: v.string(),
    category: blogCategoryValidator,
    description: v.string(),
    content: v.string(),
    externalUrl: v.optional(v.string()),
    date: v.string(),
    slug: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
    seriesId: v.optional(v.union(v.id("series"), v.null())),
    partOrder: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("posts"),
  handler: async (ctx, args) => {
    const now = Date.now();
    await requireAdminSession(ctx, args.sessionToken, now);

    const slug = args.slug?.trim() || slugify(args.title);
    if (!slug) {
      throw new Error("Slug is required");
    }
    const externalUrl = normalizeExternalUrl(args.externalUrl);
    if (!args.content.trim() && !externalUrl) {
      throw new Error("Content is required unless an external URL is provided");
    }

    const existing = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) {
      throw new Error("A post with this slug already exists");
    }

    if (args.seriesId) {
      const series = await ctx.db.get(args.seriesId);
      if (!series) throw new Error("Series not found");
    }

    return await ctx.db.insert("posts", {
      slug,
      title: args.title.trim(),
      category: args.category,
      description: args.description.trim(),
      content: args.content,
      externalUrl,
      date: args.date.trim(),
      readingTime: estimateReadingTime(args.content),
      status: args.status,
      seriesId: args.seriesId ?? undefined,
      partOrder: args.seriesId ? (args.partOrder ?? 0) : undefined,
      sortOrder: await nextSortOrder(ctx, "posts"),
      tags: normalizeTags(args.tags),
      updatedAt: now,
      publishedAt: args.status === "published" ? now : undefined,
    });
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
    postId: v.id("posts"),
    title: v.string(),
    category: blogCategoryValidator,
    description: v.string(),
    content: v.string(),
    externalUrl: v.optional(v.union(v.string(), v.null())),
    date: v.string(),
    slug: v.string(),
    status: v.union(v.literal("draft"), v.literal("published")),
    coverStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    coverKey: v.optional(v.union(v.string(), v.null())),
    seriesId: v.optional(v.union(v.id("series"), v.null())),
    partOrder: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    await requireAdminSession(ctx, args.sessionToken, now);

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const slug = args.slug.trim() || slugify(args.title);
    if (!slug) {
      throw new Error("Slug is required");
    }
    const externalUrl =
      args.externalUrl === undefined
        ? post.externalUrl
        : normalizeExternalUrl(args.externalUrl);
    if (!args.content.trim() && !externalUrl) {
      throw new Error("Content is required unless an external URL is provided");
    }

    if (slug !== post.slug) {
      const existing = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (existing) {
        throw new Error("A post with this slug already exists");
      }
    }

    const wasPublished = post.status === "published";
    const willPublish = args.status === "published";

    const patch: Partial<Doc<"posts">> = {
      slug,
      title: args.title.trim(),
      category: args.category,
      description: args.description.trim(),
      content: args.content,
      date: args.date.trim(),
      readingTime: estimateReadingTime(args.content),
      status: args.status,
      updatedAt: now,
      publishedAt: willPublish
        ? wasPublished
          ? post.publishedAt ?? now
          : now
        : undefined,
    };

    if (args.tags !== undefined) {
      patch.tags = normalizeTags(args.tags);
    }

    if (args.externalUrl !== undefined) {
      patch.externalUrl = externalUrl;
    }

    if (args.coverStorageId !== undefined) {
      patch.coverStorageId =
        args.coverStorageId === null ? undefined : args.coverStorageId;
    }
    if (args.coverKey !== undefined) {
      patch.coverKey = args.coverKey === null ? undefined : args.coverKey;
      if (post.coverKey && post.coverKey !== args.coverKey) {
        await ctx.scheduler.runAfter(0, internal.r2.deleteObject, {
          key: post.coverKey,
        });
      }
    }

    if (args.seriesId !== undefined) {
      if (args.seriesId === null) {
        patch.seriesId = undefined;
        patch.partOrder = undefined;
      } else {
        const series = await ctx.db.get(args.seriesId);
        if (!series) throw new Error("Series not found");
        patch.seriesId = args.seriesId;
        patch.partOrder = args.partOrder ?? post.partOrder ?? 0;
      }
    } else if (args.partOrder !== undefined && post.seriesId) {
      patch.partOrder = args.partOrder;
    }

    await ctx.db.patch(args.postId, patch);
    return null;
  },
});

export const remove = mutation({
  args: {
    sessionToken: v.string(),
    postId: v.id("posts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, Date.now());
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    if (post.coverStorageId) {
      await ctx.storage.delete(post.coverStorageId);
    }
    if (post.coverKey) {
      await ctx.scheduler.runAfter(0, internal.r2.deleteObject, {
        key: post.coverKey,
      });
    }
    await ctx.db.delete(args.postId);
    return null;
  },
});

export const reorder = mutation({
  args: {
    sessionToken: v.string(),
    orderedIds: v.array(v.id("posts")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, Date.now());
    for (let i = 0; i < args.orderedIds.length; i++) {
      const id = args.orderedIds[i]!;
      const row = await ctx.db.get(id);
      if (!row) throw new Error("Post not found");
      await ctx.db.patch(id, { sortOrder: i });
    }
    return null;
  },
});
