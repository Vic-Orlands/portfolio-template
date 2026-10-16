import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  generateSessionToken,
  requireAdminSession,
  sessionTtlMs,
} from "./lib/auth";

export const login = mutation({
  args: {
    password: v.string(),
  },
  returns: v.object({
    sessionToken: v.string(),
  }),
  handler: async (ctx, args) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      throw new Error("ADMIN_PASSWORD is not configured");
    }
    if (args.password !== expected) {
      throw new Error("Invalid password");
    }

    const token = generateSessionToken();
    const expiresAt = Date.now() + sessionTtlMs();
    await ctx.db.insert("adminSessions", {
      token,
      expiresAt,
    });

    return { sessionToken: token };
  },
});

export const logout = mutation({
  args: {
    sessionToken: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .unique();
    if (session) {
      await ctx.db.delete(session._id);
    }
    return null;
  },
});

export const me = query({
  args: {
    sessionToken: v.string(),
    now: v.number(),
  },
  returns: v.union(
    v.object({
      authenticated: v.literal(true),
      expiresAt: v.number(),
    }),
    v.object({
      authenticated: v.literal(false),
    }),
  ),
  handler: async (ctx, args) => {
    try {
      const session = await requireAdminSession(
        ctx,
        args.sessionToken,
        args.now,
      );
      return {
        authenticated: true as const,
        expiresAt: session.expiresAt,
      };
    } catch {
      return { authenticated: false as const };
    }
  },
});
