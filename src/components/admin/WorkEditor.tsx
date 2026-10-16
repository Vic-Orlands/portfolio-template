import React, { useEffect, useMemo, useState } from "react";
import { AdminMarkdownEditor } from "./AdminMarkdownEditor";
import "@uiw/react-md-editor/markdown-editor.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Work } from "../../data";
import { isVideoMedia } from "../WorkMediaPreview";
import { formatToday, slugify } from "./adminHelpers";
import { CoverImageField } from "./CoverImageField";
import { WorkGalleryField } from "./WorkGalleryField";
import {
  EditorLoading,
  EditorShell,
  MarkdownPane,
  MetaField,
  metaInputClass,
} from "./EditorShell";
import { useR2Upload, type UploadProgressHandler } from "./useR2Upload";
import {
  getFileMediaDimensions,
  getImageDimensions,
  type MediaDimensions,
} from "./mediaDimensions";

interface WorkEditorProps {
  sessionToken: string;
  workId: Id<"works"> | null;
  onBack: () => void;
}

export const WorkEditor: React.FC<WorkEditorProps> = ({
  sessionToken,
  workId,
  onBack,
}) => {
  const now = useMemo(() => Date.now(), [workId]);
  const existing = useQuery(
    api.works.getAdmin,
    workId ? { sessionToken, now, workId } : "skip",
  );
  const createWork = useMutation(api.works.create);
  const updateWork = useMutation(api.works.update);
  const uploadToR2 = useR2Upload(sessionToken);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState<Work["category"]>("Card");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(formatToday());
  const [content, setContent] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [mediaKey, setMediaKey] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [mediaDimensions, setMediaDimensions] = useState<MediaDimensions>({});
  const [clearMedia, setClearMedia] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(!workId);

  useEffect(() => {
    if (!workId) return;
    if (hydrated) return;
    if (existing === undefined) return;
    if (existing === null) {
      setError("Work not found");
      setHydrated(true);
      return;
    }
    setTitle(existing.title);
    setSlug(existing.slug);
    setSlugTouched(true);
    setCategory(existing.category);
    setDescription(existing.description);
    setDate(existing.date);
    setContent(existing.content);
    setTechnologies(existing.technologies.join(", "));
    setLink(existing.link ?? "");
    setStatus(existing.status);
    setMediaPreview(existing.mediaUrl);
    setMediaType(
      existing.mediaType === "video" || isVideoMedia(existing.mediaUrl)
        ? "video"
        : "image",
    );
    setMediaDimensions({
      width: existing.mediaWidth,
      height: existing.mediaHeight,
    });
    setMediaKey(null);
    setClearMedia(false);
    setTags(existing.tags ?? []);
    setHydrated(true);
  }, [existing, workId, hydrated]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const applyMedia = (
    key: string,
    url: string,
    type: "image" | "video",
    dimensions: MediaDimensions = {},
  ) => {
    setMediaKey(key);
    setMediaPreview(url);
    setMediaType(type);
    setMediaDimensions(dimensions);
    setClearMedia(false);
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
      const [{ key, previewUrl }, dimensions] = await Promise.all([
        uploadToR2(file, onProgress),
        getFileMediaDimensions(file, nextMediaType),
      ]);
      applyMedia(key, previewUrl, nextMediaType, dimensions);
      setMessage(nextMediaType === "video" ? "Video uploaded." : "Image uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleRemoveMedia = () => {
    setMediaKey(null);
    setMediaPreview(null);
    setMediaType("image");
    setMediaDimensions({});
    setClearMedia(true);
    setMessage("Media removed — save to apply.");
  };

  const techList = () =>
    technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const handleSave = async (nextStatus: "draft" | "published") => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      if (!title.trim()) throw new Error("Title is required");
      const resolvedSlug = slug.trim() || slugify(title);
      const payload = {
        title,
        slug: resolvedSlug,
        category,
        description,
        date,
        content,
        technologies: techList(),
        link: link.trim() || undefined,
        status: nextStatus as "draft" | "published",
        tags,
      };

      const mediaPatch =
        mediaKey !== null
          ? {
              mediaKey,
              mediaStorageId: null as null,
              mediaType,
              mediaWidth: mediaDimensions.width ?? null,
              mediaHeight: mediaDimensions.height ?? null,
            }
          : clearMedia
            ? {
                mediaKey: null as null,
                mediaStorageId: null as null,
                mediaType: null as null,
                mediaWidth: null as null,
                mediaHeight: null as null,
              }
            : {};

      if (workId) {
        await updateWork({
          sessionToken,
          workId,
          ...payload,
          ...mediaPatch,
        });
      } else {
        const id = await createWork({ sessionToken, ...payload });
        if (mediaKey) {
          await updateWork({
            sessionToken,
            workId: id,
            ...payload,
            mediaKey,
            mediaStorageId: null,
            mediaType,
            mediaWidth: mediaDimensions.width ?? null,
            mediaHeight: mediaDimensions.height ?? null,
          });
        }
        onBack();
      }
      setStatus(nextStatus);
      setClearMedia(false);
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
      backLabel="All works"
      onBack={onBack}
      status={status}
      saving={saving}
      message={message}
      error={error}
      onSaveDraft={() => void handleSave("draft")}
      onPublish={() => void handleSave("published")}
      title={title}
      onTitleChange={setTitle}
      titlePlaceholder="Work title"
      description={description}
      onDescriptionChange={setDescription}
      descriptionPlaceholder="Short pitch for the works gallery…"
      note={
        <p className="text-xs font-mono text-zinc-500 leading-relaxed max-w-2xl">
          Write-up is optional — leave the body empty for a media-only showcase.
        </p>
      }
      hero={
        <div className="space-y-8">
          <CoverImageField
            previewUrl={mediaPreview}
            previewType={mediaType}
            sessionToken={sessionToken}
            accept="image/*,video/mp4,video/webm,video/quicktime"
            label="Preview media"
            emptyHint="PNG, JPG, WebP, MP4, WebM, MOV · click to upload"
            onFile={handleMedia}
            onFromUrl={({ key, url }) => {
              setError(null);
              void getImageDimensions(url).then((dimensions) => {
                applyMedia(key, url, "image", dimensions);
                setMessage("Image imported from link.");
              });
            }}
            onRemove={handleRemoveMedia}
            onError={setError}
          />
          <WorkGalleryField
            sessionToken={sessionToken}
            workId={workId}
            items={existing?.galleryMedia ?? []}
            onError={(nextError) => setError(nextError || null)}
          />
        </div>
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
          <MetaField label="Link" hint="optional">
            <input
              className={metaInputClass}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://"
            />
          </MetaField>
          <MetaField label="Date">
            <input
              className={`${metaInputClass} font-mono text-xs`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </MetaField>
          <MetaField label="Technologies" hint="comma-separated">
            <input
              className={metaInputClass}
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="React, WebGL, …"
            />
          </MetaField>
        </>
      }
    >
      <MarkdownPane label="Write-up">
        <AdminMarkdownEditor
          value={content}
          onChange={setContent}
          sessionToken={sessionToken}
        />
      </MarkdownPane>
    </EditorShell>
  );
};
