import "server-only";

import { getContentSource } from "@/lib/env";
import type { ContentRepository } from "@/lib/content/types";

export type { ContentRepository, TagBundle } from "@/lib/content/types";

/**
 * Selects the content adapter.
 * CONTENT_SOURCE=local (default) | convex | custom
 *
 * The Convex module is imported only when selected, so local mode does not
 * need Convex codegen or NEXT_PUBLIC_CONVEX_URL.
 */
export async function getContentRepository(): Promise<ContentRepository> {
  const source = getContentSource();
  if (source === "convex") {
    const { convexContentRepository } = await import("./adapters/convex");
    return convexContentRepository;
  }
  if (source === "custom") {
    const { customContentRepository } = await import("./adapters/custom");
    return customContentRepository;
  }
  const { localContentRepository } = await import("./adapters/local");
  return localContentRepository;
}
