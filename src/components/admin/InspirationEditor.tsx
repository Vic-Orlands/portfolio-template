"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { slugify } from "./adminHelpers";
import { TagsInput } from "./TagsInput";
import { CoverImageField } from "./CoverImageField";
import {
  EditorLoading,
  EditorShell,
  MetaField,
  MetaSelect,
  metaInputClass,
} from "./EditorShell";
import type { InspirationCategory } from "@/lib/inspirations";
import { categoryLabels } from "@/lib/inspirations";
import { useR2Upload, type UploadProgressHandler } from "./useR2Upload";

interface InspirationEditorProps {
  sessionToken: string;
  inspirationId: Id<"inspirations"> | null;
  onBack: () => void;
}

const CATEGORIES = Object.keys(categoryLabels) as InspirationCategory[];

export const InspirationEditor: React.FC<InspirationEditorProps> = ({
  sessionToken,
  inspirationId,
  onBack,
}) => {
  const now = useMemo(() => Date.now(), [inspirationId]);
  const existing = useQuery(
    api.inspirations.getAdmin,
    inspirationId ? { sessionToken, now, inspirationId } : "skip",
  );
  const createInspiration = useMutation(api.inspirations.create);
  const updateInspiration = useMutation(api.inspirations.update);
  const uploadToR2 = useR2Upload(sessionToken);
  const captureScreenshot = useAction(api.filesActions.captureWebsiteScreenshot);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [url, setUrl] = useState("");
  const [blurb, setBlurb] = useState("");
  const [about, setAbout] = useState("");
  const [category, setCategory] = useState<InspirationCategory>("design");
  const [kind, setKind] = useState("Site");
  const [styles, setStyles] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [coverKey, setCoverKey] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [clearCover, setClearCover] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(!inspirationId);

  useEffect(() => {
    if (!inspirationId) return;
    if (hydrated) return;
    if (existing === undefined) return;
    if (existing === null) {
      setError("Inspiration not found");
      setHydrated(true);
      return;
    }
    setName(existing.name);
    setSlug(existing.slug);
    setSlugTouched(true);
    setUrl(existing.url);
    setBlurb(existing.blurb);
    setAbout(existing.about);
    setCategory(existing.category);
    setKind(existing.kind);
    setStyles(existing.styles ?? []);
    setTags(existing.tags ?? []);
    setStatus(existing.status);
    setCoverPreview(existing.coverUrl);
    setCoverKey(null);
    setClearCover(false);
    setHydrated(true);
  }, [existing, inspirationId, hydrated]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  const applyCover = (key: string, preview: string) => {
    setCoverKey(key);
    setCoverPreview(preview);
    setClearCover(false);
  };

  const handleCoverFile = async (
    file: File,
    onProgress: UploadProgressHandler,
  ) => {
    setError(null);
    try {
      const { key, previewUrl } = await uploadToR2(file, onProgress);
      applyCover(key, previewUrl);
      setMessage("Cover image uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleCapture = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Add a website URL first");
      return;
    }
    setCapturing(true);
    setError(null);
    try {
      const result = await captureScreenshot({
        sessionToken,
        websiteUrl: trimmed,
      });
      applyCover(result.key, result.url);
      setMessage("Screenshot captured from website.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Screenshot capture failed",
      );
    } finally {
      setCapturing(false);
    }
  };

  const handleRemoveCover = () => {
    setCoverKey(null);
    setCoverPreview(null);
    setClearCover(true);
    setMessage("Cover removed — save to apply.");
  };

  const handleSave = async (nextStatus: "draft" | "published") => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      if (!name.trim()) throw new Error("Name is required");
      if (!url.trim()) throw new Error("Website URL is required");
      if (!blurb.trim()) throw new Error("Blurb is required");
      const resolvedSlug = slug.trim() || slugify(name);

      let nextCoverKey = coverKey;
      if (!nextCoverKey && !coverPreview && !clearCover && url.trim()) {
        try {
          const shot = await captureScreenshot({
            sessionToken,
            websiteUrl: url.trim(),
          });
          nextCoverKey = shot.key;
          applyCover(shot.key, shot.url);
        } catch {
          // Allow save without cover if capture fails — upload manually instead
        }
      }

      const coverPatch =
        nextCoverKey !== null
          ? { coverKey: nextCoverKey, coverStorageId: null as null }
          : clearCover
            ? { coverKey: null as null, coverStorageId: null as null }
            : {};

      if (inspirationId) {
        await updateInspiration({
          sessionToken,
          inspirationId,
          name,
          slug: resolvedSlug,
          url,
          blurb,
          about,
          category,
          kind,
          styles,
          status: nextStatus,
          tags,
          ...coverPatch,
        });
      } else {
        await createInspiration({
          sessionToken,
          name,
          slug: resolvedSlug,
          url,
          blurb,
          about,
          category,
          kind,
          styles,
          status: nextStatus,
          tags,
          ...(nextCoverKey ? { coverKey: nextCoverKey } : {}),
        });
        onBack();
      }
      setStatus(nextStatus);
      setClearCover(false);
      setMessage(nextStatus === "published" ? "Published." : "Draft saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated) return <EditorLoading />;

  return (
    <EditorShell
      backLabel="All inspirations"
      onBack={onBack}
      saving={saving}
      status={status}
      message={message}
      error={error}
      onSaveDraft={() => void handleSave("draft")}
      onPublish={() => void handleSave("published")}
      title={name}
      onTitleChange={setName}
      titlePlaceholder="Site name"
      description={blurb}
      onDescriptionChange={setBlurb}
      descriptionPlaceholder="Short blurb for the list…"
      metaPlacement="inline"
      note={
        <p className="text-xs font-mono text-zinc-500 leading-relaxed max-w-2xl">
          Capture a screenshot from the URL, or upload a cover manually when
          capture fails.
        </p>
      }
      hero={
        <CoverImageField
          label="Cover"
          previewUrl={coverPreview}
          sessionToken={sessionToken}
          onFile={handleCoverFile}
          onFromUrl={({ key, url: preview }) => {
            setError(null);
            applyCover(key, preview);
            setMessage("Cover image updated.");
          }}
          onRemove={handleRemoveCover}
          onError={setError}
          onCapture={() => void handleCapture()}
          capturing={capturing}
          captureDisabled={!url.trim()}
          emptyHint="Upload a file, paste an image link, or capture from the website URL"
        />
      }
      meta={
        <>
          <MetaField label="Slug" hint="URL">
            <input
              className={`${metaInputClass} font-mono text-xs`}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          </MetaField>
          <MetaField label="Website URL">
            <input
              className={metaInputClass}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
            />
          </MetaField>
          <MetaField label="Category">
            <MetaSelect
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as InspirationCategory)
              }
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat]}
                </option>
              ))}
            </MetaSelect>
          </MetaField>
          <MetaField label="Type" hint="kind">
            <input
              className={metaInputClass}
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              placeholder="Gallery, Blog, Tool…"
            />
          </MetaField>
          <MetaField label="Styles">
            <TagsInput tags={styles} onChange={setStyles} />
          </MetaField>
          <MetaField label="Tags">
            <TagsInput tags={tags} onChange={setTags} />
          </MetaField>
        </>
      }
    >
      <div className="space-y-2 max-w-4xl">
        <label className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500">
          About
        </label>
        <textarea
          className="w-full min-h-[160px] rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-200 leading-relaxed focus:outline-none focus:border-zinc-600"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Longer overview for the detail modal…"
        />
      </div>
    </EditorShell>
  );
};
