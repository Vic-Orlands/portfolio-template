import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

const itemTypeValidator = v.union(
  v.literal("blog"),
  v.literal("series"),
  v.literal("work"),
);

const commentDoc = v.object({
  _id: v.id("comments"),
  _creationTime: v.number(),
  itemId: v.string(),
  itemType: itemTypeValidator,
  author: v.string(),
  body: v.string(),
  parentId: v.optional(v.id("comments")),
  createdAt: v.number(),
});

function sanitizeAuthor(raw: string): string {
  return raw.trim().slice(0, 60);
}

function sanitizeBody(raw: string): string {
  return raw.trim().slice(0, 4000);
}

export const listByItem = query({
  args: { itemId: v.string() },
  returns: v.array(commentDoc),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("comments")
      .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
      .collect();
    return rows.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const create = mutation({
  args: {
    itemId: v.string(),
    itemType: itemTypeValidator,
    author: v.string(),
    body: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  returns: v.id("comments"),
  handler: async (ctx, args) => {
    const author = sanitizeAuthor(args.author);
    const body = sanitizeBody(args.body);
    if (!author) throw new Error("Name is required");
    if (!body) throw new Error("Comment cannot be empty");
    if (!args.itemId.trim()) throw new Error("Invalid item");

    let parentId: Id<"comments"> | undefined;
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (!parent || parent.itemId !== args.itemId) {
        throw new Error("Parent comment not found");
      }
      parentId = args.parentId;
    }

    return await ctx.db.insert("comments", {
      itemId: args.itemId.trim(),
      itemType: args.itemType,
      author,
      body,
      parentId,
      createdAt: Date.now(),
    });
  },
});
