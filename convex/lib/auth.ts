import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export function sessionTtlMs(): number {
  return SESSION_TTL_MS;
}

export async function requireAdminSession(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string,
  now: number,
): Promise<Doc<"adminSessions">> {
  if (!sessionToken) {
    throw new Error("Not authenticated");
  }

  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .unique();

  if (!session) {
    throw new Error("Not authenticated");
  }

  if (session.expiresAt < now) {
    throw new Error("Session expired");
  }

  return session;
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
