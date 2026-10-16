"use client";

import { useMemo, useState } from "react";
import MDEditor, {
  commands,
  type ICommand,
  type TextAreaTextApi,
  type TextState,
} from "@uiw/react-md-editor";
import {
  getOnlyImageElements,
  MarkdownImage,
  MarkdownImageGrid,
  r2MarkdownImageSource,
} from "@/lib/markdownImages";
import { remarkMergeImageParagraphs } from "@/lib/remarkMergeImageParagraphs";
import { MARKDOWN_EDITOR_HEIGHT } from "./EditorShell";
import { useR2Upload } from "./useR2Upload";

const CODE_LANG_HINT =
  "typescript, javascript, tsx, bash, python, svelte, css, json, sql…";

const insertCodeBlockWithLang: ICommand = {
  name: "codeBlockLang",
  keyCommand: "codeBlockLang",
  buttonProps: {
    "aria-label": "Insert code block with language",
    title: "Code block (```language)",
  },
  icon: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 8L4 12L8 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 8L20 12L16 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 4L10 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  execute: (state: TextState, api: TextAreaTextApi) => {
    const raw = window.prompt(
      `Language for code fence (${CODE_LANG_HINT})`,
      "typescript",
    );
    if (raw === null) return;
    const lang =
      raw
        .trim()
        .replace(/^`+|`+$/g, "")
        .replace(/\s+/g, "")
        .toLowerCase() || "text";
    const selected = state.selectedText || "// your code";
    const block = `\`\`\`${lang}\n${selected}\n\`\`\`\n`;
    api.replaceSelection(block);
  },
};

type AdminMarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  sessionToken?: string;
  showImageAltInputs?: boolean;
};

export function AdminMarkdownEditor({
  value,
  onChange,
  height = MARKDOWN_EDITOR_HEIGHT,
  sessionToken,
  showImageAltInputs = false,
}: AdminMarkdownEditorProps) {
  const uploadToR2 = useR2Upload(sessionToken ?? "");
  const [imageUpload, setImageUpload] = useState<{
    fileName: string;
    progress: number;
  } | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const markdownImages = useMemo(
    () => Array.from(value.matchAll(/!\[((?:\\.|[^\\\]])*)\]\(([^)\n]+)\)/g)),
    [value],
  );

  const changeImageAlt = (image: RegExpMatchArray, nextAlt: string) => {
    const start = image.index;
    if (start === undefined) return;
    const escapedAlt = nextAlt.replace(/\\/g, "\\\\").replace(/\]/g, "\\]");
    onChange(
      `${value.slice(0, start)}![${escapedAlt}](${image[2]})${value.slice(start + image[0].length)}`,
    );
  };

  const uploadImageCommand = useMemo<ICommand>(
    () => ({
      name: "uploadImage",
      keyCommand: "uploadImage",
      buttonProps: {
        "aria-label": "Upload image or video from computer",
        title: "Upload image or video from computer",
        disabled: !sessionToken || imageUpload !== null,
      },
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      execute: (_state: TextState, api: TextAreaTextApi) => {
        if (!sessionToken || imageUpload) return;
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*,video/mp4,video/webm,video/quicktime";
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) return;
          setImageUploadError(null);
          setImageUpload({ fileName: file.name, progress: 0 });
          void uploadToR2(file, (progress) =>
            setImageUpload({ fileName: file.name, progress }),
          )
            .then(({ key }) => {
              const alt = file.name.replace(/\.[^.]+$/, "") || "Media";
              api.replaceSelection(
                `![${alt}](${r2MarkdownImageSource(key)})\n`,
              );
            })
            .catch((error: unknown) => {
              setImageUploadError(
                error instanceof Error ? error.message : "Image upload failed",
              );
            })
            .finally(() => setImageUpload(null));
        };
        input.click();
      },
    }),
    [imageUpload, sessionToken, uploadToR2],
  );

  return (
    <div className="space-y-2">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val ?? "")}
        height={height}
        preview="edit"
        visibleDragbar
        highlightEnable={false}
        previewOptions={{
          remarkPlugins: [remarkMergeImageParagraphs],
          components: {
            p: ({ children }) => {
              const images = getOnlyImageElements(children);
              if (images && images.length >= 2) {
                return <MarkdownImageGrid images={images} />;
              }
              return <p>{children}</p>;
            },
            img: ({ src, alt }) => <MarkdownImage src={src} alt={alt} />,
          },
        }}
        commands={[
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.hr,
          commands.group(
            [
              commands.title1,
              commands.title2,
              commands.title3,
              commands.title4,
              commands.title5,
              commands.title6,
            ],
            {
              name: "title",
              groupName: "title",
              buttonProps: { "aria-label": "Insert title" },
            },
          ),
          commands.divider,
          commands.link,
          commands.quote,
          commands.code,
          insertCodeBlockWithLang,
          uploadImageCommand,
          commands.image,
          commands.divider,
          commands.unorderedListCommand,
          commands.orderedListCommand,
          commands.checkedListCommand,
          commands.divider,
          commands.codeEdit,
          commands.codeLive,
          commands.codePreview,
        ]}
      />

      {showImageAltInputs && markdownImages.length > 0 ? (
        <div className="space-y-3 rounded-lg border border-zinc-200/70 p-4 dark:border-zinc-800">
          <div>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Media descriptions</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">Also appears as the caption below each project image or video.</p>
          </div>
          {markdownImages.map((image, index) => (
            <label key={`${image.index}-${index}`} className="block text-xs text-zinc-500">
              Media {index + 1}
              <input
                className="mt-1 block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                value={image[1].replace(/\\([\\\]])/g, "$1")}
                onChange={(event) => changeImageAlt(image, event.target.value)}
                placeholder="Describe this image"
              />
            </label>
          ))}
        </div>
      ) : null}

      {imageUpload ? (
        <div
          className="space-y-1.5 font-mono text-[10px] text-zinc-500"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="truncate">Uploading {imageUpload.fileName}</span>
            <span>{imageUpload.progress}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-zinc-100 transition-[width] duration-150 ease-out"
              style={{ width: `${imageUpload.progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {imageUploadError ? (
        <p className="font-mono text-[10px] text-rose-400" role="alert">
          {imageUploadError}
        </p>
      ) : null}
    </div>
  );
}
