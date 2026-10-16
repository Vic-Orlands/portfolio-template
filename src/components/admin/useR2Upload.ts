"use client";

import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export type UploadProgressHandler = (progress: number) => void;

export function useR2Upload(sessionToken: string) {
  const generateUploadUrl = useMutation(api.r2.generateUploadUrl);

  return useCallback(
    async (file: File, onProgress?: UploadProgressHandler) => {
      onProgress?.(0);
      const { key, url } = await generateUploadUrl({
        sessionToken,
        fileName: file.name,
      });

      await new Promise<void>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("PUT", url);
        if (file.type) request.setRequestHeader("Content-Type", file.type);

        request.upload.addEventListener("progress", (event) => {
          const total = event.total || file.size;
          if (total > 0) {
            onProgress?.(Math.min(99, Math.round((event.loaded / total) * 100)));
          }
        });
        request.addEventListener("load", () => {
          if (request.status >= 200 && request.status < 300) {
            onProgress?.(100);
            resolve();
            return;
          }
          reject(new Error(`Upload failed (${request.status})`));
        });
        request.addEventListener("error", () => reject(new Error("Upload failed")));
        request.addEventListener("abort", () => reject(new Error("Upload cancelled")));
        request.send(file);
      });

      return { key, previewUrl: URL.createObjectURL(file) };
    },
    [generateUploadUrl, sessionToken],
  );
}
