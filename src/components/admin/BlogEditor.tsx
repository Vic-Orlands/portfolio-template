import React, { useEffect, useMemo, useState } from "react";
import { AdminMarkdownEditor } from "./AdminMarkdownEditor";
import "@uiw/react-md-editor/markdown-editor.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { BlogCategory } from "../../data";
import { formatToday, slugify } from "./adminHelpers";
import { TagsInput } from "./TagsInput";
import { CoverImageField } from "./CoverImageField";
import {
  EditorLoading,
  EditorShell,
  MarkdownPane,
  MetaField,
  MetaSelect,
  metaInputClass,
} from "./EditorShell";
import { useR2Upload, type UploadProgressHandler } from "./useR2Upload";

interface BlogEditorProps {
  sessionToken: string;
  postId: Id<"posts"> | null;
  onBack: () => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({
  sessionToken,
  postId,
  onBack,
}) => {
  const now = useMemo(() => Date.now(), [postId]);
  const existing = useQuery(
    api.posts.getAdmin,
    postId ? { sessionToken, now, postId } : "skip",
  );
  const seriesList = useQuery(api.series.listAll, {
    sessionToken,
    now,
  });

  const createPost = useMutation(api.posts.create);
  const updatePost = useMutation(api.posts.update);
  const uploadToR2 = useR2Upload(sessionToken);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState<BlogCategory>("tech");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [date, setDate] = useState(formatToday());
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [seriesId, setSeriesId] = useState<Id<"series"> | "">("");
  const [partOrder, setPartOrder] = useState(0);
  const [coverKey, setCoverKey] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [clearCover, setClearCover] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(!postId);

  useEffect(() => {
    if (!postId) return;
    // Only seed the form once — re-running on every Convex update wipes local edits.
    if (hydrated) return;
    if (existing === undefined) return;
    if (existing === null) {
      setError("Post not found");
      setHydrated(true);
      return;
    }
    setTitle(existing.title);
    setSlug(existing.slug);
    setSlugTouched(true);
    setCategory(existing.category);
    setDescription(existing.description);
    setExternalUrl(existing.externalUrl ?? "");
    setDate(existing.date);
    setContent(existing.content);
    setStatus(existing.status);
    setCoverPreview(existing.coverUrl);
    setCoverKey(null);
    setClearCover(false);
    setSeriesId(existing.seriesId ?? "");
    setPartOrder(existing.partOrder ?? 0);
    setTags(existing.tags ?? []);
    setHydrated(true);
  }, [existing, postId, hydrated]);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  const applyCover = (key: string, url: string) => {
    setCoverKey(key);
    setCoverPreview(url);
    setClearCover(false);
    setMessage("Cover image updated.");
  };

  const handleCoverFile = async (
    file: File,
    onProgress: UploadProgressHandler,
  ) => {
    setError(null);
    try {
      const { key, previewUrl } = await uploadToR2(file, onProgress);
      applyCover(key, previewUrl);
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

  const coverPatch =
    coverKey !== null
      ? { coverKey, coverStorageId: null as null }
      : clearCover
        ? { coverKey: null as null, coverStorageId: null as null }
        : {};

  const handleSave = async (nextStatus: "draft" | "published") => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      if (!title.trim()) throw new Error("Title is required");
      if (!content.trim() && !externalUrl.trim()) {
        throw new Error("Content is required unless an external URL is provided");
      }
      if (externalUrl.trim()) {
        const parsedUrl = new URL(externalUrl.trim());
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
          throw new Error("External URL must use http or https");
        }
      }

      const resolvedSlug = slug.trim() || slugify(title);
      const seriesFields = {
        seriesId: seriesId === "" ? null : seriesId,
        partOrder: seriesId === "" ? undefined : partOrder,
      };

      if (postId) {
        await updatePost({
          sessionToken,
          postId,
          title,
          slug: resolvedSlug,
          category,
          description,
          content,
          externalUrl: externalUrl.trim() || null,
          date,
          status: nextStatus,
          tags,
          ...seriesFields,
          ...coverPatch,
        });
        setStatus(nextStatus);
        setClearCover(false);
        setMessage(nextStatus === "published" ? "Published." : "Draft saved.");
      } else {
        const id = await createPost({
          sessionToken,
          title,
          slug: resolvedSlug,
          category,
          description,
          content,
          externalUrl: externalUrl.trim() || undefined,
          date,
          status: nextStatus,
          tags,
          ...seriesFields,
        });
        if (coverKey) {
          await updatePost({
            sessionToken,
            postId: id,
            title,
            slug: resolvedSlug,
            category,
            description,
            content,
            externalUrl: externalUrl.trim() || null,
            date,
            status: nextStatus,
            tags,
            coverKey,
            coverStorageId: null,
            ...seriesFields,
          });
        }
        setStatus(nextStatus);
        setMessage(
          nextStatus === "published" ? "Published." : "Draft created.",
        );
        onBack();
      }
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
      backLabel="All writings"
      onBack={onBack}
      status={status}
      saving={saving}
      message={message}
      error={error}
      onSaveDraft={() => void handleSave("draft")}
      onPublish={() => void handleSave("published")}
      title={title}
      onTitleChange={setTitle}
      titlePlaceholder="Writing title"
      description={description}
      onDescriptionChange={setDescription}
      descriptionPlaceholder="One or two sentences for listings and previews…"
      metaPlacement="top"
      hero={
        <CoverImageField
          previewUrl={coverPreview}
          sessionToken={sessionToken}
          onFile={handleCoverFile}
          onFromUrl={({ key, url }) => {
            setError(null);
            applyCover(key, url);
          }}
          onRemove={handleRemoveCover}
          onError={setError}
        />
      }
      meta={
        <>
          <MetaField label="Slug" hint="URL">
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className={`${metaInputClass} font-mono text-xs`}
            />
          </MetaField>
          <MetaField label="External URL" hint="optional">
            <input
              type="url"
              inputMode="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://publication.com/article"
              className={`${metaInputClass} font-mono text-xs`}
            />
          </MetaField>
          <MetaField label="Category">
            <MetaSelect
              value={category}
              onChange={(e) => setCategory(e.target.value as BlogCategory)}
            >
              <option value="tech">tech</option>
              <option value="scriptures">scriptures</option>
              <option value="other">other</option>
            </MetaSelect>
          </MetaField>
          <MetaField label="Tags">
            <TagsInput tags={tags} onChange={setTags} />
          </MetaField>
          <MetaField label="Date">
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${metaInputClass} font-mono text-xs`}
            />
          </MetaField>
          <MetaField label="Parent series" hint="optional">
            <MetaSelect
              value={seriesId}
              onChange={(e) =>
                setSeriesId(e.target.value as Id<"series"> | "")
              }
            >
              <option value="">Standalone</option>
              {seriesList?.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.title}
                </option>
              ))}
            </MetaSelect>
          </MetaField>
          {seriesId !== "" && (
            <MetaField label="Part order">
              <input
                type="number"
                value={partOrder}
                onChange={(e) => setPartOrder(Number(e.target.value) || 0)}
                className={`${metaInputClass} font-mono text-xs`}
              />
            </MetaField>
          )}
        </>
      }
    >
      <MarkdownPane
        label={
          externalUrl.trim()
            ? "Body · markdown · optional for external"
            : "Body · markdown"
        }
      >
        <AdminMarkdownEditor
          value={content}
          onChange={setContent}
          sessionToken={sessionToken}
        />
      </MarkdownPane>
    </EditorShell>
  );
};
