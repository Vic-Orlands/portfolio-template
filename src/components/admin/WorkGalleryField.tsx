"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useR2Upload } from "./useR2Upload";
import { getFileMediaDimensions } from "./mediaDimensions";

type GalleryItem = {
  id: Id<"workMedia">;
  url: string;
  mediaType: "image" | "video";
  alt?: string;
};

export function WorkGalleryField({
  sessionToken,
  workId,
  items,
  onError,
}: {
  sessionToken: string;
  workId: Id<"works"> | null;
  items: GalleryItem[];
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const uploadToR2 = useR2Upload(sessionToken);
  const addMedia = useMutation(api.works.addMedia);
  const removeMedia = useMutation(api.works.removeMedia);

  const uploadFiles = async (files: File[]) => {
    if (!workId || files.length === 0) return;
    setUploading(true);
    onError("");
    try {
      for (const file of files) {
        const mediaType = file.type.startsWith("video/")
          ? "video"
          : file.type.startsWith("image/")
            ? "image"
            : null;
        if (!mediaType) throw new Error(`${file.name} is not an image or video`);
        const [{ key }, dimensions] = await Promise.all([
          uploadToR2(file),
          getFileMediaDimensions(file, mediaType),
        ]);
        await addMedia({
          sessionToken,
          workId,
          key,
          mediaType,
          ...dimensions,
          alt: file.name.replace(/\.[^.]+$/, ""),
        });
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
            Modal gallery
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            Extra screens appear with the main media in the detail view.
          </p>
        </div>
        <button
          type="button"
          disabled={!workId || uploading || items.length >= 12}
          onClick={() => inputRef.current?.click()}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 font-mono text-xs text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ImagePlus className="size-3.5" />
          )}
          Add media
        </button>
      </div>

      {!workId ? (
        <p className="border border-dashed border-zinc-800 px-4 py-6 text-center font-mono text-[10px] text-zinc-600">
          Save the work first, then add its gallery.
        </p>
      ) : items.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-video overflow-hidden border border-zinc-800 bg-zinc-950"
            >
              {item.mediaType === "video" ? (
                <video
                  src={item.url}
                  className="size-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.alt ?? "Work gallery media"}
                  className="size-full object-cover"
                />
              )}
              <button
                type="button"
                aria-label={`Remove ${item.alt ?? "gallery media"}`}
                onClick={() =>
                  void removeMedia({ sessionToken, mediaId: item.id }).catch(
                    (error) =>
                      onError(
                        error instanceof Error ? error.message : "Remove failed",
                      ),
                  )
                }
                className="absolute right-2 top-2 grid size-8 cursor-pointer place-items-center bg-zinc-950/85 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="border border-dashed border-zinc-800 px-4 py-6 text-center font-mono text-[10px] text-zinc-600">
          No additional media yet.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(event) => {
          void uploadFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
    </div>
  );
}
