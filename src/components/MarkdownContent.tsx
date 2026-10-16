"use client";

import React, { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { extractContentHeadings, headingSlug } from "@/lib/contentHeadings";
import {
  getOnlyImageElements,
  MarkdownImage,
  MarkdownImageGrid,
} from "@/lib/markdownImages";
import { remarkMergeImageParagraphs } from "@/lib/remarkMergeImageParagraphs";
import { Check } from "lucide-react";
import { TechStackVisual } from "@/components/TechStackVisual";
import { playErrorSound, playSuccessSound } from "@/lib/uiSounds";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import scss from "react-syntax-highlighter/dist/esm/languages/prism/scss";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("ts", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("shell", bash);
SyntaxHighlighter.registerLanguage("sh", bash);
SyntaxHighlighter.registerLanguage("zsh", bash);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("py", python);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("scss", scss);
SyntaxHighlighter.registerLanguage("html", markup);
SyntaxHighlighter.registerLanguage("xml", markup);
SyntaxHighlighter.registerLanguage("svg", markup);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("rust", rust);
SyntaxHighlighter.registerLanguage("go", go);
SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("yml", yaml);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("md", markdown);
// Common aliases without dedicated grammars
SyntaxHighlighter.registerLanguage("svelte", markup);
SyntaxHighlighter.registerLanguage("sveltekit", markup);
SyntaxHighlighter.registerLanguage("vue", markup);

const LANG_ALIASES: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  html: "markup",
  xml: "markup",
  svg: "markup",
  svelte: "svelte",
  sveltekit: "sveltekit",
  vue: "vue",
};

function normalizeLanguage(raw: string): string {
  const key = raw.trim().toLowerCase();
  return LANG_ALIASES[key] ?? key;
}

function classNameToString(className: unknown): string {
  if (!className) return "";
  if (Array.isArray(className)) {
    return className.filter(Boolean).map(String).join(" ");
  }
  return String(className);
}

/** Pull `language-foo` from react-markdown / hast classNames. */
function extractLanguage(className: unknown): string | null {
  const raw = classNameToString(className);
  const match = /(?:^|\s)language-([\w.+#-]+)/i.exec(raw);
  return match?.[1] ?? null;
}

function displayLanguageLabel(lang: string): string {
  const key = lang.trim().toLowerCase();
  if (!key || key === "text" || key === "plaintext" || key === "plain") {
    return "CODE";
  }
  return key;
}

function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return "";
}

function containsImageNode(node: { type?: string; tagName?: string; children?: unknown[] } | undefined): boolean {
  if (!node) return false;
  if (node.type === "element" && node.tagName === "img") return true;
  return node.children?.some((child) =>
    typeof child === "object" && child !== null && containsImageNode(child as typeof node),
  ) ?? false;
}

function wrapNode(
  node: ReactNode,
  wrapText?: (text: string) => ReactNode,
): ReactNode {
  if (!wrapText) return node;
  if (typeof node === "string") return wrapText(node);
  if (Array.isArray(node)) {
    return node.map((child, i) => (
      <React.Fragment key={i}>{wrapNode(child, wrapText)}</React.Fragment>
    ));
  }
  if (isValidElement<{ children?: ReactNode }>(node) && node.props.children) {
    return React.cloneElement(node, {
      ...node.props,
      children: wrapNode(node.props.children, wrapText),
    });
  }
  return node;
}

const SimpleCodeFrame: React.FC<{
  code: string;
  language: string;
}> = ({ code, language }) => {
  const [copied, setCopied] = React.useState(false);
  const label = displayLanguageLabel(language);
  const lang = normalizeLanguage(language || "text");
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      playSuccessSound();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      playErrorSound();
    }
  };

  return (
    <div className="article-breakout z-30 my-8 overflow-hidden rounded-xl border border-[#35373c] bg-[#242529] shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_24px_-16px_rgba(0,0,0,0.35)] dark:border-zinc-800/70 dark:bg-[#10151c] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_24px_-16px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between bg-[#2d2f34] px-4 py-2.5 dark:bg-[#171d25]">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex cursor-pointer items-center gap-1.5 rounded bg-zinc-700/70 px-2.5 py-1 text-[10px] text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-100"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">COPIED</span>
            </>
          ) : (
            <span>COPY</span>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem 1.1rem",
          background: "transparent",
          fontSize: "12px",
          lineHeight: 1.55,
        }}
        codeTagProps={{
          style: {
            fontFamily:
              '"Neue Haas Grotesk Text", "Helvetica Neue", Arial, sans-serif',
          },
        }}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

function SectionDivider() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -top-11 left-1/2 flex -translate-x-1/2 gap-1.5"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <span
          key={index}
          className="h-0.75 w-3.5 rounded-full bg-zinc-400/70 dark:bg-zinc-600/80"
        />
      ))}
    </span>
  );
}

function CrosshairCorners() {
  const corners = [
    "-left-2 -top-2",
    "-right-2 -top-2",
    "-bottom-2 -left-2",
    "-bottom-2 -right-2",
  ];

  return corners.map((position) => (
    <span
      key={position}
      aria-hidden="true"
      className={`pointer-events-none absolute size-4 ${position} before:absolute before:left-0 before:top-1/2 before:h-px before:w-full before:-translate-y-1/2 before:bg-zinc-400/70 after:absolute after:left-1/2 after:top-0 after:h-full after:w-px after:-translate-x-1/2 after:bg-zinc-400/70 dark:before:bg-zinc-600 dark:after:bg-zinc-600`}
    />
  ));
}

interface MarkdownContentProps {
  content: string;
  wrapText?: (text: string) => ReactNode;
  showImageCaptions?: boolean;
  imageSizing?: "natural" | "small";
  imageFallbackAlt?: string;
  showSectionDividers?: boolean;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  wrapText,
  showImageCaptions = false,
  imageSizing = "natural",
  imageFallbackAlt = "Project image",
  showSectionDividers = true,
}) => {
  const headingIdsByLine = React.useMemo(() => {
    const ids = new Map<number, string>();
    const headings = extractContentHeadings(content);
    let headingIndex = 0;

    content.split("\n").forEach((line, index) => {
      if (!/^(#{1,6})\s+(.+?)\s*#*$/.test(line.trim())) return;
      const heading = headings[headingIndex];
      if (heading) ids.set(index + 1, heading.id);
      headingIndex += 1;
    });

    return ids;
  }, [content]);

  const getHeadingId = (
    node: { position?: { start?: { line?: number } } } | undefined,
    children: ReactNode,
  ) => {
    const line = node?.position?.start?.line;
    return (
      (line ? headingIdsByLine.get(line) : undefined) ??
      headingSlug(extractText(children))
    );
  };

  return (
    <div className="space-y-6 markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMergeImageParagraphs]}
        components={{
          h1: ({ node, children }) => (
            <h1
              id={getHeadingId(node, children)}
              className="relative scroll-mt-24 text-xl md:text-2xl font-semibold text-black dark:text-zinc-300 mt-24 mb-5 font-sans tracking-tight leading-tight"
            >
              {showSectionDividers ? <SectionDivider /> : null}
              {wrapNode(children, wrapText)}
            </h1>
          ),
          h2: ({ node, children }) => (
            <h2
              id={getHeadingId(node, children)}
              className="relative scroll-mt-24 text-lg md:text-xl font-semibold text-black dark:text-zinc-300 mt-20 mb-4 font-sans tracking-tight leading-tight"
            >
              {showSectionDividers ? <SectionDivider /> : null}
              {wrapNode(children, wrapText)}
            </h2>
          ),
          h3: ({ node, children }) => (
            <h3
              id={getHeadingId(node, children)}
              className="scroll-mt-24 text-base font-semibold text-black dark:text-zinc-300 mt-6 mb-3 font-sans tracking-tight"
            >
              {wrapNode(children, wrapText)}
            </h3>
          ),
          h4: ({ node, children }) => (
            <h4
              id={getHeadingId(node, children)}
              className="scroll-mt-24 text-sm font-semibold text-black dark:text-zinc-300 mt-5 mb-2 font-sans tracking-tight"
            >
              {wrapNode(children, wrapText)}
            </h4>
          ),
          h5: ({ node, children }) => (
            <h5
              id={getHeadingId(node, children)}
              className="scroll-mt-24 text-sm font-medium text-black dark:text-zinc-300 mt-5 mb-2 font-sans"
            >
              {wrapNode(children, wrapText)}
            </h5>
          ),
          h6: ({ node, children }) => (
            <h6
              id={getHeadingId(node, children)}
              className="scroll-mt-24 text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-400 mt-5 mb-2"
            >
              {wrapNode(children, wrapText)}
            </h6>
          ),
          p: ({ node, children }) => {
            const images = getOnlyImageElements(children);
            if (images && images.length >= 2) {
              return (
                <MarkdownImageGrid
                  images={images}
                  showCaptions={showImageCaptions}
                  sizing={imageSizing}
                  fallbackAlt={imageFallbackAlt}
                />
              );
            }
            if (images?.length === 1 && showImageCaptions) {
              return (
                <MarkdownImage
                  src={images[0].props.src}
                  alt={images[0].props.alt}
                  showCaption
                  sizing={imageSizing}
                  fallbackAlt={imageFallbackAlt}
                />
              );
            }
            const className = "text-sm md:text-[15px] leading-relaxed text-black dark:text-zinc-300 font-sans my-4";
            const content = wrapNode(children, wrapText);
            return containsImageNode(node)
              ? <div className={className}>{content}</div>
              : <p className={className}>{content}</p>;
          },
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-4 space-y-2 text-black dark:text-zinc-300 text-sm md:text-[15px] leading-relaxed">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-4 space-y-2 text-black dark:text-zinc-300 text-sm md:text-[15px] leading-relaxed">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1">{wrapNode(children, wrapText)}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="relative my-10 border border-zinc-300/90 bg-zinc-100/30 p-4 font-sans text-sm leading-relaxed text-zinc-800 md:px-7 md:text-[15px] dark:border-zinc-700 dark:bg-zinc-900/20 dark:text-zinc-200">
              <CrosshairCorners />
              <div className="text-pretty [&>p]:my-0">
                {wrapNode(children, wrapText)}
              </div>
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-950 underline decoration-current decoration-dotted underline-offset-[3px] transition-opacity hover:opacity-70 dark:text-zinc-100"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-950 dark:text-zinc-100">
              {wrapNode(children, wrapText)}
            </strong>
          ),
          em: ({ children }) => <em>{wrapNode(children, wrapText)}</em>,
          img: ({ src, alt }) => (
            <MarkdownImage
              src={src}
              alt={alt}
              showCaption={showImageCaptions}
              sizing={imageSizing}
              fallbackAlt={imageFallbackAlt}
            />
          ),
          code: ({ className, children, node, ...props }) => {
            const fromClass = extractLanguage(className);
            const fromNode = extractLanguage(
              (node as { properties?: { className?: unknown } } | undefined)
                ?.properties?.className,
            );
            const language = fromClass ?? fromNode;
            const codeText = extractText(children);
            if (codeText.startsWith("tech:")) {
              return <TechStackVisual code={codeText.slice("tech:".length)} />;
            }
            if (codeText.startsWith("stack:")) {
              return <TechStackVisual code={codeText.slice("stack:".length)} />;
            }
            if (language?.toLowerCase() === "stack") {
              return <TechStackVisual code={codeText.replace(/\n$/, "")} />;
            }
            const isBlock =
              Boolean(language) ||
              codeText.includes("\n") ||
              // fenced blocks often end with a trailing newline in children
              /[\r\n]/.test(String(children));

            if (isBlock) {
              return (
                <SimpleCodeFrame
                  code={codeText.replace(/\n$/, "")}
                  language={language ?? "text"}
                />
              );
            }
            return (
              <code
                className="rounded bg-[#e3e9e4] px-1.5 py-0.5 font-mono text-[0.9em] text-[#435048] dark:bg-[#344039] dark:text-[#d3ddd6]"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
