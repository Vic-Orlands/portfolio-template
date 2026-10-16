import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession } from "./lib/auth";
import { getR2Url } from "./lib/r2";

export const getMediaUrl = query({
  args: { key: v.string() },
  returns: v.string(),
  handler: async (_ctx, args) => {
    if (!/^media\/[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9]{1,8})?$/.test(args.key)) {
      throw new Error("Invalid media key");
    }
    return await getR2Url(args.key);
  },
});

export const generateUploadUrl = mutation({
  args: {
    sessionToken: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, Date.now());
    throw new Error(
      "Convex storage uploads are disabled. Use api.r2.generateUploadUrl.",
    );
  },
});

export const getImageUrl = mutation({
  args: {
    sessionToken: v.string(),
    storageId: v.id("_storage"),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, Date.now());
    return await ctx.storage.getUrl(args.storageId);
  },
});

/** Used by uploadFromUrl action — pass `now` from the action. */
export const assertAdminSession = internalQuery({
  args: {
    sessionToken: v.string(),
    now: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, args.now);
    return null;
  },
});
