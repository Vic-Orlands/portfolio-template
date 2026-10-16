export type ContentSource = "local" | "convex" | "custom";

export function getContentSource(): ContentSource {
  const raw = (process.env.CONTENT_SOURCE ?? "local").trim().toLowerCase();
  if (raw === "convex" || raw === "custom") return raw;
  return "local";
}

export function getConvexUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_CONVEX_URL;
}

export function isConvexConfigured(): boolean {
  return Boolean(getConvexUrl());
}

/** Admin CMS is opt-in and only applies to the Convex adapter. */
export function isAdminEnabled(): boolean {
  return (
    getContentSource() === "convex" &&
    isConvexConfigured() &&
    process.env.ADMIN_ENABLED === "true"
  );
}
