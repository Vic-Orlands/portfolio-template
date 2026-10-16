import type { Work } from "@/data";

type WorkMediaPreviewProps = {
  work: Pick<Work, "id" | "title" | "mediaUrl" | "mediaType">;
  controls?: boolean;
  className?: string;
  fit?: "cover" | "contain";
};

export function isVideoMedia(url?: string | null) {
  return Boolean(url?.match(/\.(mp4|webm|mov)(\?|$)/i));
}

export function WorkMediaPreview({
  work,
  controls = false,
  className = "",
  fit = "cover",
}: WorkMediaPreviewProps) {
  const mediaClassName = `h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"} ${className}`;

  if (!work.mediaUrl) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-zinc-950 ${className}`}
        role="img"
        aria-label={`${work.title} has no preview media`}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          No preview media
        </span>
      </div>
    );
  }

  if (work.mediaType === "video" || isVideoMedia(work.mediaUrl)) {
    return (
      <video
        src={work.mediaUrl}
        className={mediaClassName}
        controls={controls}
        muted={!controls}
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <img
      src={work.mediaUrl}
      alt={work.title}
      className={mediaClassName}
      referrerPolicy="no-referrer"
    />
  );
}
