"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { AnimatePresence, motion } from "motion/react";
import { Link2, Loader2, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";

type ImageFromUrlControlProps = {
  sessionToken: string;
  onUploaded: (result: {
    key: string;
    url: string;
    sourceUrl: string;
  }) => void;
  onError?: (message: string) => void;
  label?: string;
};

export function ImageFromUrlControl({
  sessionToken,
  onUploaded,
  onError,
  label = "Image link",
}: ImageFromUrlControlProps) {
  const uploadFromUrl = useAction(api.filesActions.uploadFromUrl);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const close = () => {
    setOpen(false);
    setUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const result = await uploadFromUrl({
        sessionToken,
        imageUrl: trimmed,
      });
      onUploaded({ ...result, sourceUrl: trimmed });
      close();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Failed to import image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-flex min-h-9 items-center overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.button
            key="trigger"
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-1.5 text-xs font-mono border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-zinc-500 hover:bg-zinc-900/50 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" />
            {label}
          </motion.button>
        ) : (
          <motion.form
            key="form"
            onSubmit={(e) => void handleSubmit(e)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-2 min-w-0"
          >
            <input
              type="url"
              required
              autoFocus
              placeholder="https://…/image.png"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="min-w-48 flex-1 max-w-xs px-2.5 py-1.5 text-xs font-mono rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="inline-flex items-center gap-1.5 text-xs font-mono rounded-lg px-3 py-1.5 bg-zinc-200 text-zinc-950 hover:bg-white disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Fetching…
                </>
              ) : (
                "Import"
              )}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={close}
              className="p-1.5 text-zinc-500 hover:text-zinc-200 cursor-pointer"
              aria-label="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
