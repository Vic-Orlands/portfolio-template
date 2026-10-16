"use client";

import { useEffect } from "react";

const imageCache = new Map<string, HTMLImageElement>();

function targetsLocalNetwork(url: string): boolean {
  try {
    const hostname = new URL(url, window.location.origin).hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname === "0.0.0.0" ||
      hostname === "[::1]"
    ) {
      return true;
    }

    const octets = hostname.split(".").map(Number);
    if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet))) {
      return false;
    }

    const [first, second] = octets;
    return (
      first === 10 ||
      first === 127 ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168)
    );
  } catch {
    return false;
  }
}

export function extractMarkdownImageUrls(markdown?: string): string[] {
  if (!markdown) return [];

  return Array.from(
    markdown.matchAll(/!\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))/g),
    (match) => match[1] ?? match[2],
  ).filter((url): url is string => Boolean(url));
}

export function usePreloadImages(urls: readonly (string | null | undefined)[]) {
  useEffect(() => {
    urls.forEach((url) => {
      if (!url || imageCache.has(url) || targetsLocalNetwork(url)) return;

      const image = new Image();
      image.decoding = "async";
      image.src = url;
      imageCache.set(url, image);

      image.addEventListener(
        "error",
        () => {
          imageCache.delete(url);
        },
        { once: true },
      );
    });
  }, [urls]);
}
