"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AdminMarkdownEditor } from "./AdminMarkdownEditor";
import "@uiw/react-md-editor/markdown-editor.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatToday, slugify } from "./adminHelpers";
import { TagsInput } from "./TagsInput";
import { CoverImageField } from "./CoverImageField";
import { isVideoMedia } from "../WorkMediaPreview";
import {
  EditorLoading,
  EditorShell,
  MarkdownPane,
  MetaField,
  metaInputClass,
} from "./EditorShell";
import { useR2Upload, type UploadProgressHandler } from "./useR2Upload";

interface ProjectEditorProps {
  sessionToken: string;
  projectId: Id<"projects"> | null;
  onBack: () => void;
}

export const ProjectEditor: React.FC<ProjectEditorProps> = ({
  sessionToken,
  projectId,
  onBack,
}) => {
  const now = useMemo(() => Date.now(), [projectId]);
  const existing = useQuery(
    api.projects.getAdmin,
    projectId ? { sessionToken, now, projectId } : "skip",
  );
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);
  const uploadToR2 = useR2Upload(sessionToken);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(formatToday());
  const [link, setLink] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  /** When true, save should clear the stored image (null). */
  const [clearImage, setClearImage] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(!projectId);

  useEffect(() => {
    if (!projectId) return;
    if (hydrated) return;
    if (existing === undefined) return;
    if (existing === null) {
      setError("Project not found");
      setHydrated(true);
      return;
    }
    setTitle(existing.title);
    setSlug(existing.slug);
    setSlugTouched(true);
    setDescription(existing.description);
    setContent(existing.content ?? "");
    setDate(existing.date);
    setLink(existing.link);
    setStatus(existing.status);
    setImagePreview(existing.imageUrl);
    setImageAlt(existing.imageAlt ?? "");
    setMediaType(
      existing.mediaType === "video" || isVideoMedia(existing.imageUrl)
        ? "video"
        : "image",
    );
    setImageKey(null);
    setClearImage(false);
    setTags(existing.tags ?? []);
    setHydrated(true);
  }, [existing, projectId, hydrated]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const applyMedia = (key: string, url: string, type: "image" | "video") => {
    setImageKey(key);
    setImagePreview(url);
    setMediaType(type);
    setClearImage(false);
  };

  const handleMedia = async (file: File, onProgress: UploadProgressHandler) => {
    try {
      const nextMediaType = file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("image/")
          ? "image"
          : null;
      if (!nextMediaType) {
        throw new Error("Choose an image, MP4, WebM, or MOV file");
      }
      const { key, previewUrl } = await uploadToR2(file, onProgress);
      applyMedia(key, previewUrl, nextMediaType);
      setMessage(nextMediaType === "video" ? "Video uploaded." : "Image uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleRemoveImage = () => {
    setImageKey(null);
    setImagePreview(null);
    setImageAlt("");
    setMediaType("image");
    setClearImage(true);
    setMessage("Media removed — save to apply.");
  };

  const handleSave = async (nextStatus: "draft" | "published") => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      if (!title.trim()) throw new Error("Title is required");
      const resolvedSlug = slug.trim() || slugify(title);

      const imagePatch =
        imageKey !== null
          ? { imageKey, imageStorageId: null as null, mediaType }
          : clearImage
            ? {
                imageKey: null as null,
                imageStorageId: null as null,
                mediaType: null as null,
              }
            : {};

      if (projectId) {
        await updateProject({
          sessionToken,
          projectId,
          title,
          slug: resolvedSlug,
          description,
          content,
          date,
          link,
          status: nextStatus,
          imageAlt,
          tags,
          ...imagePatch,
        });
      } else {
        const id = await createProject({
          sessionToken,
          title,
          slug: resolvedSlug,
          description,
          content,
          date,
          link,
          status: nextStatus,
          imageAlt,
          tags,
        });
        if (imageKey) {
          await updateProject({
            sessionToken,
            projectId: id,
            title,
            slug: resolvedSlug,
            description,
            content,
            date,
            link,
            status: nextStatus,
            imageAlt,
            tags,
            imageKey,
            imageStorageId: null,
            mediaType,
          });
        }
        onBack();
      }
      setStatus(nextStatus);
      setClearImage(false);
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
      backLabel="All projects"
      onBack={onBack}
      status={status}
      saving={saving}
      message={message}
      error={error}
      onSaveDraft={() => void handleSave("draft")}
      onPublish={() => void handleSave("published")}
      title={title}
      onTitleChange={setTitle}
      titlePlaceholder="Project title"
      description={description}
      onDescriptionChange={setDescription}
      descriptionPlaceholder="What this project is — keep it crisp…"
      note={
        <p className="max-w-2xl text-xs font-mono leading-relaxed text-zinc-500">
          Project notes appear beside the preview. Use headings such as “Why I
          built it” and “What I learned”; Markdown images can sit inside the
          explanation.
        </p>
      }
      metaPlacement="inline"
      hero={
        <CoverImageField
          previewUrl={imagePreview}
          previewType={mediaType}
          sessionToken={sessionToken}
          accept="image/*,video/mp4,video/webm,video/quicktime"
          label="Product preview"
          emptyHint="PNG, JPG, WebP, MP4, WebM, MOV · click to upload"
          onFile={handleMedia}
          onFromUrl={({ key, url }) => {
            setError(null);
            applyMedia(key, url, "image");
            setMessage("Image imported from link.");
          }}
          onRemove={handleRemoveImage}
          onError={setError}
        />
      }
      meta={
        <>
          <MetaField label="Preview image alt text" hint="Also shown below the image">
            <input
              className={metaInputClass}
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder={`${title || "Project"} product preview`}
            />
          </MetaField>
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
          <MetaField label="Link" hint="Optional — empty shows in-dev status">
            <input
              className={metaInputClass}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https:// (leave empty if still building)"
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
        </>
      }
    >
      <MarkdownPane label="Project notes">
        <AdminMarkdownEditor
          value={content}
          onChange={setContent}
          sessionToken={sessionToken}
          showImageAltInputs
        />
      </MarkdownPane>
    </EditorShell>
  );
};
