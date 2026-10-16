import { internalAction, internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession } from "./lib/auth";
import { deleteR2Object, getR2UploadUrl } from "./lib/r2";

function extension(fileName: string | undefined) {
  const match = fileName?.toLowerCase().match(/\.[a-z0-9]{1,8}$/);
  return match?.[0] ?? "";
}

function mediaKey(fileName: string | undefined) {
  return `media/${crypto.randomUUID()}${extension(fileName)}`;
}

export const generateUploadUrl = mutation({
  args: {
    sessionToken: v.string(),
    fileName: v.optional(v.string()),
  },
  returns: v.object({ key: v.string(), url: v.string() }),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, Date.now());
    const key = mediaKey(args.fileName);
    const url = await getR2UploadUrl(key);
    return { key, url };
  },
});

/** CLI/seed uploads — not callable from the public client. */
export const generateInternalUploadUrl = internalMutation({
  args: {
    fileName: v.optional(v.string()),
  },
  returns: v.object({ key: v.string(), url: v.string() }),
  handler: async (_ctx, args) => {
    const key = mediaKey(args.fileName);
    const url = await getR2UploadUrl(key);
    return { key, url };
  },
});

export const deleteObject = internalAction({
  args: { key: v.string() },
  returns: v.null(),
  handler: async (_ctx, args) => {
    await deleteR2Object(args.key);
    return null;
  },
});
