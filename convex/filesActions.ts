"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getR2UploadUrl, getR2Url } from "./lib/r2";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

function sniffContentType(url: string, headerType: string | null): string {
  const header = (headerType ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
  if (header.startsWith("image/")) return header;

  const path = url.split("?")[0]?.toLowerCase() ?? "";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".gif")) return "image/gif";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".avif")) return "image/avif";
  if (path.endsWith(".svg")) return "image/svg+xml";
  return header || "application/octet-stream";
}

async function fetchAndStoreImage(
  imageUrl: string,
): Promise<{ key: string; url: string }> {
  const response = await fetch(imageUrl, {
    redirect: "follow",
    headers: {
      Accept: "image/*,*/*;q=0.8",
      "User-Agent": "PortfolioAdmin/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Could not fetch image (${response.status})`);
  }

  const contentType = sniffContentType(
    imageUrl,
    response.headers.get("content-type"),
  );
  if (!ALLOWED_TYPES.has(contentType)) {
    throw new Error(
      `URL is not a supported image type (${contentType || "unknown"})`,
    );
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength === 0) {
    throw new Error("Image is empty");
  }
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error("Image is larger than 8MB");
  }

  const suffix = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
  const key = `media/${crypto.randomUUID()}.${suffix}`;
  const upload = await fetch(await getR2UploadUrl(key), {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: new Uint8Array(buffer),
  });
  if (!upload.ok) {
    throw new Error(`Could not store image (${upload.status})`);
  }
  return { key, url: await getR2Url(key) };
}

export const uploadFromUrl = action({
  args: {
    sessionToken: v.string(),
    imageUrl: v.string(),
  },
  returns: v.object({
    key: v.string(),
    url: v.string(),
  }),
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.files.assertAdminSession, {
      sessionToken: args.sessionToken,
      now: Date.now(),
    });

    let parsed: URL;
    try {
      parsed = new URL(args.imageUrl.trim());
    } catch {
      throw new Error("Invalid image URL");
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Image URL must start with http:// or https://");
    }

    return await fetchAndStoreImage(parsed.toString());
  },
});

export const captureWebsiteScreenshot = action({
  args: {
    sessionToken: v.string(),
    websiteUrl: v.string(),
  },
  returns: v.object({
    key: v.string(),
    url: v.string(),
  }),
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.files.assertAdminSession, {
      sessionToken: args.sessionToken,
      now: Date.now(),
    });

    let parsed: URL;
    try {
      parsed = new URL(args.websiteUrl.trim());
    } catch {
      throw new Error("Invalid website URL");
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Website URL must start with http:// or https://");
    }

    const screenshotUrl = `https://image.thum.io/get/width/1400/crop/900/noanimate/${parsed.toString()}`;
    try {
      return await fetchAndStoreImage(screenshotUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      throw new Error(`Could not capture website screenshot: ${message}`);
    }
  },
});
