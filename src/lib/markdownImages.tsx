"use client";

import React, {
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isVideoMedia } from "@/components/WorkMediaPreview";
import { isClientConvexConfigured } from "@/components/providers/ConvexClientProvider";

export const R2_MARKDOWN_IMAGE_ORIGIN = "https://portfolio-r2.local/";

export function r2MarkdownImageSource(key: string) {
  return `${R2_MARKDOWN_IMAGE_ORIGIN}${encodeURIComponent(key)}`;
}

function r2KeyFromSource(src: string | undefined) {
  if (!src?.startsWith(R2_MARKDOWN_IMAGE_ORIGIN)) return null;
  try {
    return decodeURIComponent(src.slice(R2_MARKDOWN_IMAGE_ORIGIN.length));
  } catch {
    return null;
  }
}

/** Collect children that are only <img> elements (ignore whitespace text). */
export function getOnlyImageElements(
  children: ReactNode,
): ReactElement<{ src?: string; alt?: string; className?: string }>[] | null {
  const nodes = React.Children.toArray(children).filter((child) => {
    if (typeof child === "string") return child.trim().length > 0;
    if (typeof child === "number") return true;
    return true;
  });

  if (nodes.length === 0) return null;

  const images: ReactElement<{
    src?: string;
    alt?: string;
    className?: string;
  }>[] = [];

  for (const child of nodes) {
    if (!isValidElement(child)) return null;
    if (child.type !== "img" && child.type !== MarkdownImage) return null;
    images.push(
      child as ReactElement<{ src?: string; alt?: string; className?: string }>,
    );
  }

  return images.length > 0 ? images : null;
}

const SOLO_IMG_CLASS =
  "article-breakout z-30 my-8 block rounded-lg outline outline-1 -outline-offset-1 outline-black/10 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_8px_24px_-16px_rgba(0,0,0,0.3)] dark:outline-white/10 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_24px_-16px_rgba(0,0,0,0.75)]";

const GRID_IMG_CLASS =
  "m-0 block h-full w-full aspect-[4/3] object-cover rounded-lg outline outline-1 -outline-offset-1 outline-black/10 shadow-[0_6px_18px_-14px_rgba(0,0,0,0.32)] dark:outline-white/10 dark:shadow-[0_6px_18px_-14px_rgba(0,0,0,0.8)]";

const PROJECT_IMAGE_EDGE_CLASS = "rounded-lg border border-black/10 shadow-[0_10px_28px_-20px_rgba(0,0,0,0.4)] dark:border-white/10 dark:shadow-[0_10px_28px_-18px_rgba(0,0,0,0.8)]";
const PROJECT_IMG_CLASS = `block max-w-full object-contain ${PROJECT_IMAGE_EDGE_CLASS}`;
const PROJECT_VIDEO_CLASS = `block h-auto w-full max-w-full object-contain ${PROJECT_IMAGE_EDGE_CLASS}`;
const PROJECT_GRID_IMG_CLASS = `block h-auto w-full object-contain ${PROJECT_IMAGE_EDGE_CLASS}`;
const SMALL_IMG_CLASS = `block h-72 w-auto max-w-full object-contain ${PROJECT_IMAGE_EDGE_CLASS}`;
const PROJECT_CAPTION_CLASS = "w-full text-center text-sm leading-6 text-[#747474] dark:text-zinc-400";

type ImageSizing = "natural" | "small";

function MarkdownImageView({
  src,
  alt,
  className,
  showCaption = false,
  sizing = "natural",
  fallbackAlt = "Project image",
  mediaUrl,
}: {
  src?: string | Blob;
  alt?: string;
  className?: string;
  showCaption?: boolean;
  sizing?: ImageSizing;
  fallbackAlt?: string;
  mediaUrl?: string;
}) {
  const href = typeof src === "string" ? src : undefined;
  const description = alt?.trim() || fallbackAlt;
  const isVideo = isVideoMedia(href);
  const mediaClassName = className ?? (showCaption
    ? isVideo
      ? PROJECT_VIDEO_CLASS
      : sizing === "small"
        ? SMALL_IMG_CLASS
        : PROJECT_IMG_CLASS
    : isVideo
      ? `article-breakout z-30 my-8 ${PROJECT_VIDEO_CLASS}`
      : SOLO_IMG_CLASS);
  const image = isVideo ? (
    <video
      src={mediaUrl}
      aria-label={description}
      className={mediaClassName}
      controls
      playsInline
      preload="metadata"
    />
  ) : (
    <img
      src={mediaUrl}
      alt={showCaption ? description : (alt ?? "")}
      className={mediaClassName}
    />
  );

  if (showCaption) {
    return (
      <figure className="article-breakout z-30 my-8 flex flex-col items-center gap-3">
        {image}
        <figcaption className={PROJECT_CAPTION_CLASS}>
          {description}
        </figcaption>
      </figure>
    );
  }

  return image;
}

function ConvexMarkdownImage({
  r2Key,
  ...props
}: {
  r2Key: string;
  src?: string | Blob;
  alt?: string;
  className?: string;
  showCaption?: boolean;
  sizing?: ImageSizing;
  fallbackAlt?: string;
}) {
  const r2Url = useQuery(api.files.getMediaUrl, { key: r2Key });
  return <MarkdownImageView {...props} mediaUrl={r2Url ?? undefined} />;
}

export function MarkdownImage(props: {
  src?: string | Blob;
  alt?: string;
  className?: string;
  showCaption?: boolean;
  sizing?: ImageSizing;
  fallbackAlt?: string;
}) {
  const href = typeof props.src === "string" ? props.src : undefined;
  const r2Key = r2KeyFromSource(href);
  if (r2Key && isClientConvexConfigured()) {
    return <ConvexMarkdownImage {...props} r2Key={r2Key} />;
  }
  return <MarkdownImageView {...props} mediaUrl={r2Key ? undefined : href} />;
}

/** 2-column grid for 2+ consecutive images (reads as 2×2 when there are four). */
export function MarkdownImageGrid({
  images,
  showCaptions = false,
  sizing = "natural",
  fallbackAlt = "Project image",
}: {
  images: ReactElement<{ src?: string; alt?: string; className?: string }>[];
  showCaptions?: boolean;
  sizing?: ImageSizing;
  fallbackAlt?: string;
}) {
  if (showCaptions) {
    return (
      <div
        className={`article-breakout z-30 my-8 gap-3 ${
          sizing === "small" ? "flex flex-wrap justify-center" : "grid grid-cols-2"
        }`}
      >
        {images.map((image, index) => {
          const description = image.props.alt?.trim() || fallbackAlt;
          return (
            <figure
              key={image.key ?? `md-img-${index}`}
              className="flex min-w-0 flex-col items-center gap-3"
            >
              <MarkdownImage
                src={image.props.src}
                alt={description}
                className={sizing === "small" ? SMALL_IMG_CLASS : PROJECT_GRID_IMG_CLASS}
              />
              <figcaption className={PROJECT_CAPTION_CLASS}>
                {description}
              </figcaption>
            </figure>
          );
        })}
      </div>
    );
  }

  return (
    <div className="article-breakout z-30 my-8 grid grid-cols-2 gap-2.5 sm:gap-3">
      {images.map((image, index) =>
        React.cloneElement(image, {
          key: image.key ?? `md-img-${index}`,
          className: GRID_IMG_CLASS,
        }),
      )}
    </div>
  );
}
