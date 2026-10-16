"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { ImageFromUrlControl } from "./ImageFromUrlControl";
import type { UploadProgressHandler } from "./useR2Upload";

type CoverImageFieldProps = {
  previewUrl: string | null;
  sessionToken: string;
  onFile: (
    file: File,
    onProgress: UploadProgressHandler,
  ) => void | Promise<void>;
  onFromUrl: (result: { key: string; url: string }) => void;
  onRemove: () => void;
  onError?: (message: string) => void;
  /** Optional website screenshot capture (inspirations). */
  onCapture?: () => void;
  capturing?: boolean;
  captureDisabled?: boolean;
  label?: string;
  emptyHint?: string;
  accept?: string;
  previewType?: "image" | "video";
};

export function CoverImageField({
  previewUrl,
  sessionToken,
  onFile,
  onFromUrl,
  onRemove,
  onError,
  onCapture,
  capturing = false,
  captureDisabled = false,
  label = "Cover image",
  emptyHint = "PNG, JPG, WebP · click to upload",
  accept = "image/*",
  previewType = "image",
}: CoverImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const uploading = uploadProgress !== null;

  const uploadFile = async (file: File) => {
    setUploadProgress(0);
    try {
      await onFile(file, setUploadProgress);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadProgress(null);
    }
  };

  return (
    <div className="space-y-3 max-w-4xl">
      <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>

      {previewUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-zinc-800 aspect-[21/9] bg-zinc-900/50">
          {previewType === "video" ? (
            <video
              src={previewUrl}
              className="h-full w-full object-cover object-top"
              controls
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Cover"
              className="w-full h-full object-cover object-top"
            />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-end p-3 gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-900 cursor-pointer disabled:cursor-wait disabled:opacity-60"
            >
              <ImagePlus className="w-3.5 h-3.5" />
              Upload
            </button>
            {onCapture ? (
              <button
                type="button"
                onClick={onCapture}
                disabled={capturing || captureDisabled}
                className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-900 cursor-pointer disabled:opacity-60"
              >
                {capturing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                Recapture
              </button>
            ) : null}
            <button
              type="button"
              onClick={onRemove}
              disabled={uploading}
              className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-rose-500/90 text-white cursor-pointer disabled:cursor-wait disabled:opacity-60"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full aspect-21/9 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 flex flex-col items-center justify-center gap-3 px-4">
          {capturing ? (
            <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
          ) : (
            <ImagePlus className="w-8 h-8 opacity-60 text-zinc-500" />
          )}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={capturing || uploading}
              className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-900 cursor-pointer disabled:opacity-50"
            >
              <ImagePlus className="w-3.5 h-3.5" />
              {accept === "image/*" ? "Upload image" : "Upload media"}
            </button>
            {onCapture ? (
              <button
                type="button"
                onClick={onCapture}
                disabled={capturing || captureDisabled}
                className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {capturing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                Capture from URL
              </button>
            ) : null}
          </div>
          <span className="text-[10px] font-mono text-zinc-600 text-center">
            {emptyHint}
          </span>
        </div>
      )}

      {uploading ? (
        <div
          className="space-y-2"
          role="status"
          aria-live="polite"
          aria-label={`Uploading media, ${uploadProgress}% complete`}
        >
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-3 animate-spin" />
              Uploading media
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-zinc-100 transition-[width] duration-150 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadFile(file);
          e.target.value = "";
        }}
      />

      <ImageFromUrlControl
        sessionToken={sessionToken}
        label="Image link"
        onError={onError}
        onUploaded={({ key, url }) => onFromUrl({ key, url })}
      />
    </div>
  );
}
