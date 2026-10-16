import React, { useEffect, useMemo, useState } from "react";
import { AdminMarkdownEditor } from "./AdminMarkdownEditor";
import "@uiw/react-md-editor/markdown-editor.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatToday, slugify } from "./adminHelpers";
import { TagsInput } from "./TagsInput";
import { CoverImageField } from "./CoverImageField";
import {
  EditorLoading,
  EditorShell,
  MarkdownPane,
  MetaField,
  metaInputClass,
} from "./EditorShell";
import { useR2Upload, type UploadProgressHandler } from "./useR2Upload";

interface SeriesEditorProps {
  sessionToken: string;
  seriesId: Id<"series"> | null;
  onBack: () => void;
}

export const SeriesEditor: React.FC<SeriesEditorProps> = ({
  sessionToken,
  seriesId,
  onBack,
}) => {
  const now = useMemo(() => Date.now(), [seriesId]);
  const existing = useQuery(
    api.series.getAdmin,
    seriesId ? { sessionToken, now, seriesId } : "skip",
  );
  const createSeries = useMutation(api.series.create);
  const updateSeries = useMutation(api.series.update);
  const uploadToR2 = useR2Upload(sessionToken);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [type, setType] = useState("Hobby");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(formatToday());
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [coverKey, setCoverKey] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [clearCover, setClearCover] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(!seriesId);

  useEffect(() => {
    if (!seriesId) return;
    if (hydrated) return;
    if (existing === undefined) return;
    if (existing === null) {
      setError("Series not found");
      setHydrated(true);
      return;
    }
    setTitle(existing.title);
    setSlug(existing.slug);
    setSlugTouched(true);
    setType(existing.type);
    setDescription(existing.description);
    setDate(existing.date);
    setContent(existing.content);
    setStatus(existing.status);
    setCoverPreview(existing.coverUrl);
    setCoverKey(null);
    setClearCover(false);
    setTags(existing.tags ?? []);
    setHydrated(true);
  }, [existing, seriesId, hydrated]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const applyCover = (key: string, url: string) => {
    setCoverKey(key);
    setCoverPreview(url);
    setClearCover(false);
  };

  const handleCoverFile = async (
    file: File,
    onProgress: UploadProgressHandler,
  ) => {
    try {
      const { key, previewUrl } = await uploadToR2(file, onProgress);
      applyCover(key, previewUrl);
      setMessage("Cover image uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
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
      if (!title.trim()) throw new Error("Title is required");
      const resolvedSlug = slug.trim() || slugify(title);

      const coverPatch =
        coverKey !== null
          ? { coverKey, coverStorageId: null as null }
          : clearCover
            ? { coverKey: null as null, coverStorageId: null as null }
            : {};

      if (seriesId) {
        await updateSeries({
          sessionToken,
          seriesId,
          title,
          slug: resolvedSlug,
          type,
          description,
          content,
          date,
          status: nextStatus,
          tags,
          ...coverPatch,
        });
      } else {
        const id = await createSeries({
          sessionToken,
          title,
          slug: resolvedSlug,
          type,
          description,
          content,
          date,
          status: nextStatus,
          tags,
        });
        if (coverKey) {
          await updateSeries({
            sessionToken,
            seriesId: id,
            title,
            slug: resolvedSlug,
            type,
            description,
            content,
            date,
            status: nextStatus,
            tags,
            coverKey,
            coverStorageId: null,
          });
        }
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

  if (!hydrated) {
    return <EditorLoading />;
  }

  return (
    <EditorShell
      backLabel="All series"
      onBack={onBack}
      status={status}
      saving={saving}
      message={message}
      error={error}
      onSaveDraft={() => void handleSave("draft")}
      onPublish={() => void handleSave("published")}
      title={title}
      onTitleChange={setTitle}
      titlePlaceholder="Series title"
      description={description}
      onDescriptionChange={setDescription}
      descriptionPlaceholder="What this series is about…"
      note={
        <p className="text-xs font-mono text-zinc-500 leading-relaxed max-w-2xl">
          Series is a parent container. Link writings to it from the Writings
          editor (series + part order). Overview content below is optional.
        </p>
      }
      hero={
        <CoverImageField
          previewUrl={coverPreview}
          sessionToken={sessionToken}
          onFile={handleCoverFile}
          onFromUrl={({ key, url }) => {
            setError(null);
            applyCover(key, url);
            setMessage("Cover imported from link.");
          }}
          onRemove={handleRemoveCover}
          onError={setError}
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
          <MetaField label="Type">
            <input
              className={metaInputClass}
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Hobby, Ritual, Pet Project…"
            />
          </MetaField>
          <MetaField label="Tags">
            <TagsInput tags={tags} onChange={setTags} />
          </MetaField>
          <MetaField label="Date">
            <input
              className={`${metaInputClass} font-mono text-xs`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </MetaField>
          {existing && existing.parts.length > 0 && (
            <div className="sm:col-span-2 pt-1 space-y-2 border-t border-zinc-800">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 pt-3">
                Linked writings ({existing.parts.length})
              </p>
              <ul className="space-y-2">
                {existing.parts.map((part) => (
                  <li
                    key={part._id}
                    className="text-xs text-zinc-400 flex flex-col gap-0.5"
                  >
                    <span className="text-zinc-200">
                      {part.partOrder ?? 0}. {part.title}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-600">
                      {part.slug}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      }
    >
      <MarkdownPane label="Overview / intro">
        <AdminMarkdownEditor
          value={content}
          onChange={setContent}
          sessionToken={sessionToken}
        />
      </MarkdownPane>
    </EditorShell>
  );
};
