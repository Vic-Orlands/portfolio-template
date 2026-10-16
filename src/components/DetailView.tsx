import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Clock,
  Tag,
  Calendar,
  CornerDownRight,
  X,
  Send,
  Eye,
} from "lucide-react";
import {
  ChatBubbleIcon,
  ChevronLeftIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Blog, Series, Work } from "../data";
import { WorkMediaPreview } from "./WorkMediaPreview";
import { MarkdownContent } from "./MarkdownContent";
import { TagList } from "./portfolio/TagList";
import { CommentsSection } from "./DiscussionSection";
import { playClickSound } from "@/lib/uiSounds";

interface DetailViewProps {
  item: Blog | Series | Work;
  type: "blog" | "series" | "work";
  onBack: () => void;
  onNavigateWork?: (work: Work) => void;
  isSliderDetail?: boolean;
  allWorks?: Work[];
  relatedBlogs?: Blog[];
  seriesContext?: Series | null;
}

export interface HighlightComment {
  id: string;
  itemId: string; // blog or scribble id
  text: string; // exact highlighted substring
  startOffset?: number;
  endOffset?: number;
  blockText?: string;
  contextBefore?: string;
  contextAfter?: string;
  author: string;
  comment: string;
  date: string;
  replies: HighlightCommentReply[];
}

export interface HighlightCommentReply {
  id: string;
  author: string;
  comment: string;
  date: string;
}

interface PopoverPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

const WorkRecommendationCard: React.FC<{
  work: Work;
  onNavigate?: (work: Work) => void;
}> = ({ work, onNavigate }) => {
  return (
    <button
      onClick={() => {
        onNavigate?.(work);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="w-full text-left group block bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 focus:outline-none cursor-pointer"
    >
      <div className="h-28 w-full relative overflow-hidden bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/80">
        <WorkMediaPreview work={work} />
      </div>
      <div className="p-3.5 space-y-1.5">
        <div className="flex items-center justify-end">
          <span className="font-mono text-[10px] text-zinc-500">
            {work.date}
          </span>
        </div>
        <h4 className="font-sans font-medium text-sm text-black dark:text-zinc-200 group-hover:underline group-hover:text-amber-700 dark:group-hover:text-amber-400">
          {work.title}
        </h4>
        <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
          {work.description}
        </p>
      </div>
    </button>
  );
};

const ReadingFooter: React.FC<{
  item: Blog | Series;
  type: "blog" | "series";
  relatedBlogs: Blog[];
  seriesContext?: Series | null;
}> = ({ item, type, relatedBlogs, seriesContext }) => {
  const [view, setView] = useState<"reading" | "comments">("reading");
  const reduceMotion = useReducedMotion();
  const series = type === "series" ? (item as Series) : null;
  const entries =
    type === "series"
      ? (series?.parts ?? []).map((part) => ({
          id: part.id,
          href: part.externalUrl ?? `/writings/${part.id}`,
          external: Boolean(part.externalUrl),
          title: part.title,
          description: part.description,
          meta: `${part.date} · ${part.readingTime}`,
        }))
      : seriesContext
        ? (seriesContext.parts ?? [])
            .filter((part) => part.id !== item.id)
            .map((part) => ({
              id: part.id,
              href: part.externalUrl ?? `/writings/${part.id}`,
              external: Boolean(part.externalUrl),
              title: part.title,
              description: part.description,
              meta: `${part.date} · ${part.readingTime}`,
            }))
        : relatedBlogs
            .filter((blog) => blog.id !== item.id)
            .slice(0, 6)
            .map((blog) => ({
              id: blog.id,
              href: blog.externalUrl ?? `/writings/${blog.id}`,
              external: Boolean(blog.externalUrl),
              title: blog.title,
              description: blog.description,
              meta: `${blog.date} · ${blog.readingTime}`,
            }));
  const label =
    type === "series"
      ? `${series?.type ?? "Series"} · ${entries.length} ${entries.length === 1 ? "part" : "parts"}`
      : seriesContext
        ? seriesContext.title
        : "More writings";

  return (
    <section
      className="pt-10"
      id={type === "series" ? "series-parts" : "related-writings"}
    >
      <div className="mb-7 flex items-center justify-between gap-4">
        {view === "reading" && (
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
            {label}
          </p>
        )}
        <button
          type="button"
          onClick={() =>
            setView((current) =>
              current === "reading" ? "comments" : "reading",
            )
          }
          aria-controls="article-footer-panel"
          aria-expanded={view === "comments"}
          className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-950 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 dark:hover:text-zinc-100"
        >
          <ChatBubbleIcon className="size-3.5" />
          {view === "reading" ? "View comments" : "Back to reading"}
        </button>
      </div>

      <div id="article-footer-panel">
        <AnimatePresence initial={false} mode="wait">
          {view === "reading" ? (
            <motion.div
              key="reading"
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -6 }}
              transition={{
                duration: reduceMotion ? 0 : 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {entries.length > 0 ? (
                type === "series" ? (
                  <ol className="space-y-1">
                    {entries.map((entry, index) => (
                      <li key={entry.id}>
                        <Link
                          href={entry.href}
                          {...(entry.external
                            ? {
                                target: "_blank",
                                rel: "noopener noreferrer",
                              }
                            : {
                                transitionTypes: [
                                  "writing-forward",
                                ] as "writing-forward"[],
                              })}
                          className="group flex items-center gap-2 text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"
                        >
                          <span className="font-mono font-light tabular-nums text-zinc-400 dark:text-zinc-600">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span className="block font-medium text-zinc-800 transition-colors group-hover:text-zinc-950 dark:text-zinc-300 dark:group-hover:text-zinc-50">
                            {entry.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ul className="space-y-1">
                    {entries.map((entry) => (
                      <li key={entry.id}>
                        <Link
                          href={entry.href}
                          {...(entry.external
                            ? {
                                target: "_blank",
                                rel: "noopener noreferrer",
                              }
                            : {
                                transitionTypes: [
                                  "writing-forward",
                                ] as "writing-forward"[],
                              })}
                          className="flex items-center gap-2 py-1 text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
                          <ReaderIcon className="shrink-0 text-zinc-400 dark:text-zinc-600" />
                          {entry.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <p className="text-sm text-zinc-500">
                  No additional reading is published yet.
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="comments"
              initial={reduceMotion ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: 6 }}
              transition={{
                duration: reduceMotion ? 0 : 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="[&>#portfolio-general-comments]:border-t-0 [&>#portfolio-general-comments]:pt-0"
            >
              <CommentsSection itemId={item.id} itemType={type} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export const DetailView: React.FC<DetailViewProps> = ({
  item,
  type,
  onBack,
  onNavigateWork,
  isSliderDetail = false,
  allWorks = [],
  relatedBlogs = [],
  seriesContext = null,
}) => {
  const isBlog = type === "blog";
  const isWork = type === "work";
  const blogItem = isBlog ? (item as Blog) : null;
  const seriesItem = type === "series" ? (item as Series) : null;
  const workItem = isWork ? (item as Work) : null;

  // Active Highlight Comments list state
  const [comments, setComments] = useState<HighlightComment[]>([]);
  const [hoveredComment, setHoveredComment] = useState<HighlightComment | null>(
    null,
  );
  const [hoveredCommentPos, setHoveredCommentPos] =
    useState<PopoverPosition | null>(null);
  const [selectedComment, setSelectedComment] =
    useState<HighlightComment | null>(null);

  // Text selection popover states
  const [popoverPos, setPopoverPos] = useState<PopoverPosition>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [isPopoverShowing, setIsPopoverShowing] = useState(false);
  const [pendingHighlightRects, setPendingHighlightRects] = useState<
    PopoverPosition[]
  >([]);
  const [popoverMode, setPopoverMode] = useState<"toolbar" | "input">(
    "toolbar",
  );
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [selectedOffsets, setSelectedOffsets] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [selectedBlockText, setSelectedBlockText] = useState<string | null>(
    null,
  );
  const [selectedContext, setSelectedContext] = useState({
    before: "",
    after: "",
  });

  // Threaded reply state
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyText, setReplyText] = useState("");

  const popoverRef = useRef<HTMLDivElement>(null);
  const bodyTextRef = useRef<HTMLDivElement>(null);
  const showTimerRef = useRef<number | null>(null);
  const selectedRangeRef = useRef<Range | null>(null);
  const modeRef = useRef(popoverMode);

  modeRef.current = popoverMode;

  // Load comments on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        "portfolio-highlight-comments",
      );
      if (saved) {
        const allComments: HighlightComment[] = JSON.parse(saved);
        // Filter for this specific blog/scribble post
        setComments(allComments.filter((c) => c.itemId === item.id));
      }
    } catch (e) {
      console.error("Failed to load comments", e);
    }
  }, [item.id]);

  // Save comments helper
  const saveComments = (newCommentsList: HighlightComment[]) => {
    try {
      const saved = localStorage.getItem(
        "portfolio-highlight-comments",
      );
      let allComments: HighlightComment[] = saved ? JSON.parse(saved) : [];
      // Remove current post comments and add updated ones
      allComments = allComments
        .filter((c) => c.itemId !== item.id)
        .concat(newCommentsList);
      localStorage.setItem(
        "portfolio-highlight-comments",
        JSON.stringify(allComments),
      );
      setComments(newCommentsList);
    } catch (e) {
      console.error("Failed to save highlight comment", e);
    }
  };

  // Inline styling parser supporting bold, code and markup highlight
  const parseInlineStyles = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|==.*?==)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong
            key={index}
            className="font-semibold text-black dark:text-zinc-200"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="font-mono text-xs px-1.5 py-0.5 rounded bg-zinc-300 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-300"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("==") && part.endsWith("==")) {
        return (
          <mark
            key={index}
            className="bg-amber-200 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 px-1 py-0.5 rounded-sm"
          >
            {part.slice(2, -2)}
          </mark>
        );
      }
      return part;
    });
  };

  const commentHighlight = (
    comment: HighlightComment,
    text: string,
    key: string,
  ) => (
    <span
      key={key}
      onClick={(event) => {
        event.stopPropagation();
        setSelectedComment(comment);
      }}
      onMouseEnter={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setHoveredComment(comment);
        setHoveredCommentPos({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }}
      onMouseLeave={() => setHoveredComment(null)}
      className="relative inline cursor-pointer rounded-sm border-b-2 border-dashed border-[#7f9185] bg-[#dfe7e0] px-0.5 font-sans font-medium text-zinc-950 transition-colors duration-200 hover:bg-[#d3ded5] dark:border-[#819387] dark:bg-[#344039]/70 dark:text-zinc-200 dark:hover:bg-[#3d4b43]"
    >
      {parseInlineStyles(text)}
    </span>
  );

  const renderTextWithHighlights = (text: string): React.ReactNode[] => {
    if (comments.length === 0) {
      return parseInlineStyles(text);
    }

    const blockMatch = comments
      .filter((comment) => comment.blockText)
      .map((comment) => {
        const before = comment.contextBefore ?? "";
        const after = comment.contextAfter ?? "";
        const needle = `${before}${comment.text}${after}`;
        const contextIndex = text.indexOf(needle);
        if (contextIndex >= 0) {
          return { comment, index: contextIndex + before.length };
        }
        if (!before && !after) {
          const index = text.indexOf(comment.text);
          if (index >= 0) return { comment, index };
        }
        return null;
      })
      .find((match) => match !== null);
    if (blockMatch) {
      return [
        ...parseInlineStyles(text.slice(0, blockMatch.index)),
        commentHighlight(
          blockMatch.comment,
          blockMatch.comment.text,
          `block-commented-${blockMatch.comment.id}`,
        ),
        ...parseInlineStyles(
          text.slice(blockMatch.index + blockMatch.comment.text.length),
        ),
      ];
    }

    const matchedComment = comments.find(
      (comment) =>
        comment.startOffset === undefined && text.includes(comment.text),
    );
    if (!matchedComment) {
      return parseInlineStyles(text);
    }

    const matchIndex = text.indexOf(matchedComment.text);
    return [
      ...parseInlineStyles(text.slice(0, matchIndex)),
      commentHighlight(
        matchedComment,
        matchedComment.text,
        `legacy-commented-${matchedComment.id}`,
      ),
      ...parseInlineStyles(text.slice(matchIndex + matchedComment.text.length)),
    ];
  };

  useEffect(() => {
    const clearShowTimer = () => {
      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };

    const updateSelection = () => {
      const selection = window.getSelection();
      const container = bodyTextRef.current;
      if (
        !selection ||
        selection.isCollapsed ||
        selection.rangeCount === 0 ||
        !container
      ) {
        if (modeRef.current !== "input") {
          setIsPopoverShowing(false);
          setPendingHighlightRects([]);
        }
        return;
      }

      const range = selection.getRangeAt(0);
      if (
        !container.contains(range.startContainer) ||
        !container.contains(range.endContainer)
      ) {
        if (modeRef.current !== "input") {
          setIsPopoverShowing(false);
          setPendingHighlightRects([]);
        }
        return;
      }

      const rawText = selection.toString();
      const text = rawText.trim();
      const rects = Array.from(range.getClientRects()).filter(
        (rect) => rect.width > 0 && rect.height > 0,
      );
      const anchorRect = rects.at(-1) ?? range.getBoundingClientRect();
      if (!text || anchorRect.width <= 0 || anchorRect.height <= 0) return;

      const beforeSelection = document.createRange();
      beforeSelection.selectNodeContents(container);
      beforeSelection.setEnd(range.startContainer, range.startOffset);
      const leadingWhitespace = rawText.length - rawText.trimStart().length;
      const startOffset = beforeSelection.toString().length + leadingWhitespace;
      const endOffset = startOffset + text.length;

      const startElement =
        range.startContainer.nodeType === Node.ELEMENT_NODE
          ? (range.startContainer as Element)
          : range.startContainer.parentElement;
      const endElement =
        range.endContainer.nodeType === Node.ELEMENT_NODE
          ? (range.endContainer as Element)
          : range.endContainer.parentElement;
      const startBlock = startElement?.closest(
        "p, h1, h2, h3, h4, h5, h6, blockquote, li",
      );
      const endBlock = endElement?.closest(
        "p, h1, h2, h3, h4, h5, h6, blockquote, li",
      );
      let contextBefore = "";
      let contextAfter = "";
      if (startBlock && startBlock === endBlock) {
        const beforeInBlock = document.createRange();
        beforeInBlock.selectNodeContents(startBlock);
        beforeInBlock.setEnd(range.startContainer, range.startOffset);
        const localStart = beforeInBlock.toString().length + leadingWhitespace;
        const blockText = startBlock.textContent ?? "";
        contextBefore = blockText.slice(
          Math.max(0, localStart - 24),
          localStart,
        );
        contextAfter = blockText.slice(
          endOffset - startOffset + localStart,
          endOffset - startOffset + localStart + 24,
        );
      }

      const persistentRange = range.cloneRange();
      selectedRangeRef.current = persistentRange;
      setPendingHighlightRects(
        rects.map((rect) => ({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        })),
      );
      setSelectedText(text);
      setSelectedOffsets({ start: startOffset, end: endOffset });
      setSelectedBlockText(
        startBlock && startBlock === endBlock
          ? (startBlock.textContent ?? "").trim()
          : null,
      );
      setSelectedContext({ before: contextBefore, after: contextAfter });
      setPopoverPos({
        top: anchorRect.top,
        left: anchorRect.left,
        width: anchorRect.width,
        height: anchorRect.height,
      });

      clearShowTimer();
      showTimerRef.current = window.setTimeout(() => {
        setIsPopoverShowing(true);
      }, 60);
    };

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        !bodyTextRef.current?.contains(target)
      ) {
        clearShowTimer();
        setIsPopoverShowing(false);
        setPopoverMode("toolbar");
        setPendingHighlightRects([]);
      }
    };

    const queueSelectionUpdate = () => requestAnimationFrame(updateSelection);
    const handlePointerUp = (event: PointerEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (bodyTextRef.current?.contains(target)) setPopoverMode("toolbar");
      queueSelectionUpdate();
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key.startsWith("Arrow") || event.key === "Shift") {
        queueSelectionUpdate();
      }
    };

    const repositionPopover = () => {
      const range = selectedRangeRef.current;
      if (!range || !isPopoverShowing) return;
      const rects = Array.from(range.getClientRects()).filter(
        (rect) => rect.width > 0 && rect.height > 0,
      );
      const rect = rects.at(-1);
      if (!rect) return;
      setPendingHighlightRects(
        rects.map((highlightRect) => ({
          top: highlightRect.top,
          left: highlightRect.left,
          width: highlightRect.width,
          height: highlightRect.height,
        })),
      );
      setPopoverPos({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", repositionPopover);
    window.addEventListener("scroll", repositionPopover, { passive: true });
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      clearShowTimer();
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", repositionPopover);
      window.removeEventListener("scroll", repositionPopover);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isPopoverShowing]);

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentAuthor.trim() || !newCommentText.trim() || !selectedText)
      return;

    const newComment: HighlightComment = {
      id: crypto.randomUUID(),
      itemId: item.id,
      text: selectedText,
      startOffset: selectedOffsets?.start,
      endOffset: selectedOffsets?.end,
      blockText: selectedBlockText ?? undefined,
      contextBefore: selectedContext.before || undefined,
      contextAfter: selectedContext.after || undefined,
      author: newCommentAuthor.trim(),
      comment: newCommentText.trim(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      replies: [],
    };

    const updated = [newComment, ...comments];
    saveComments(updated);

    // Reset and close
    setNewCommentAuthor("");
    setNewCommentText("");
    setSelectedText("");
    setIsPopoverShowing(false);
    setPopoverMode("toolbar");
    setPendingHighlightRects([]);

    // Deselect browser selection
    window.getSelection()?.removeAllRanges();
  };

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComment || !replyAuthor.trim() || !replyText.trim()) return;

    const newReply: HighlightCommentReply = {
      id: crypto.randomUUID(),
      author: replyAuthor.trim(),
      comment: replyText.trim(),
      date: "Just now",
    };

    const updatedComments = comments.map((c) => {
      if (c.id === selectedComment.id) {
        const updatedReplyList = [...c.replies, newReply];
        const updatedNode = { ...c, replies: updatedReplyList };
        // Sync active dialog state
        setSelectedComment(updatedNode);
        return updatedNode;
      }
      return c;
    });

    saveComments(updatedComments);
    setReplyAuthor("");
    setReplyText("");
  };

  return (
    <motion.article
      initial={isSliderDetail ? { opacity: 0, y: 15 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`space-y-8 select-text ${!isSliderDetail ? "editorial-detail" : ""}`}
      id="portfolio-detail-view"
    >
      {/* Back to index link */}
      {!isSliderDetail && (
        <button
          onClick={() => {
            playClickSound();
            onBack();
          }}
          id="btn-back-to-list"
          className={`group flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-black dark:hover:text-zinc-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 cursor-pointer ${type === "blog" || type === "series" ? "min-[1121px]:hidden" : ""}`}
        >
          <ChevronLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-1" />
          <span>
            {type === "blog"
              ? "back to writings"
              : type === "series"
                ? "back to series"
                : "back to home"}
          </span>
        </button>
      )}

      {/* Header Info */}
      {!isSliderDetail && (
        <div className="space-y-4 pb-6">
          <div id="article-title" className="scroll-mt-8">
            <h1 className="text-2xl md:text-3xl font-sans font-medium tracking-tight text-black dark:text-zinc-300 leading-tight">
              {item.title}
            </h1>
          </div>

          {isBlog && blogItem?.coverUrl && (
            <div className="article-breakout overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950">
              <img
                src={blogItem.coverUrl}
                alt=""
                className="w-full max-h-[420px] object-cover"
              />
            </div>
          )}

          <div className="article-meta flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono text-zinc-600 dark:text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {item.date}
            </span>

            {isBlog && blogItem && (
              <>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {blogItem.readingTime}
                </span>
                <span className="flex items-center gap-1.5 capitalize bg-zinc-300/60 dark:bg-zinc-800/40 px-2 py-0.5 rounded-sm">
                  <Tag className="w-3 h-3" />
                  {blogItem.category === "scriptures"
                    ? "Biblical"
                    : blogItem.category === "tech"
                      ? "Technical"
                      : blogItem.category}
                </span>
              </>
            )}

            {!isBlog && seriesItem && !isWork && (
              <span className="flex items-center gap-1.5 capitalize bg-zinc-300/60 dark:bg-zinc-800/40 px-2 py-0.5 rounded-sm">
                <Tag className="w-3 h-3" />
                {seriesItem.type} Series
              </span>
            )}
          </div>

          <TagList tags={item.tags} className="pt-1" />
        </div>
      )}

      {/* Hero interactive visualizer for work items */}
      {isWork && workItem && !isSliderDetail && (
        <div className="space-y-4">
          <div className="article-breakout relative h-64 overflow-hidden rounded-xl bg-zinc-950 md:h-80">
            <WorkMediaPreview work={workItem} controls />
            <div className="absolute bottom-3 right-3 flex select-none items-center gap-1.5 rounded bg-zinc-900/80 px-2.5 py-1 font-mono text-[10px] text-zinc-400 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>{workItem.mediaUrl ? "MEDIA SHOWCASE" : "NO MEDIA"}</span>
            </div>
          </div>

          {workItem.technologies && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mr-1.5">
                Engine Stack:
              </span>
              {workItem.technologies.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Simple Engine Stack inline if inside Slider Detail */}
      {isWork && workItem && isSliderDetail && workItem.technologies && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mr-1.5">
            Engine Stack:
          </span>
          {workItem.technologies.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Body Content with selection tracking */}
      <div
        ref={bodyTextRef}
        className="space-y-6 select-text"
        id="blog-body-text-container"
      >
        {item.content?.trim() ? (
          <MarkdownContent
            content={item.content}
            wrapText={(text) => renderTextWithHighlights(text)}
          />
        ) : type === "work" ? null : (
          <p className="text-sm text-zinc-500 font-mono">
            No overview content.
          </p>
        )}
      </div>

      {/* Other Works Recommendation Section */}
      {isWork && workItem && (
        <div
          className="pt-10 border-t border-zinc-200 dark:border-zinc-800 space-y-6"
          id="work-recommendations"
        >
          <div>
            <h3 className="text-base font-sans font-semibold text-black dark:text-zinc-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-zinc-500" />
              More Works to Explore
            </h3>
            <p className="text-xs font-mono text-zinc-600 dark:text-zinc-500 mt-0.5">
              Select any system below to inspect its features and layout.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allWorks
              .filter((w) => w.id !== workItem.id)
              .slice(0, 2)
              .map((otherWork) => (
                <WorkRecommendationCard
                  key={otherWork.id}
                  work={otherWork}
                  onNavigate={onNavigateWork}
                />
              ))}
          </div>
        </div>
      )}

      {/* Floating Selection Popover */}
      {pendingHighlightRects.map((rect, index) => (
        <span
          key={`${rect.top}-${rect.left}-${index}`}
          aria-hidden="true"
          className="pointer-events-none fixed z-30 rounded-[2px] bg-[#a9bea9]/75 mix-blend-multiply dark:bg-[#647966]/80 dark:mix-blend-screen"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        />
      ))}
      <AnimatePresence>
        {isPopoverShowing && (
          <motion.div
            ref={popoverRef}
            className="pointer-events-auto z-40"
            style={{
              position: "fixed",
              transformOrigin: "bottom center",
            }}
            initial={{
              opacity: 0,
              scale: 0.85,
              top: popoverPos.top - 8,
              left: popoverPos.left + popoverPos.width / 2,
              x: "-50%",
              y: "-90%",
              filter: "blur(3px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              top: popoverPos.top - 12,
              left: popoverPos.left + popoverPos.width / 2,
              x: "-50%",
              y: "-100%",
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              scale: 0.85,
              top: popoverPos.top - 8,
              left: popoverPos.left + popoverPos.width / 2,
              x: "-50%",
              y: "-90%",
              filter: "blur(3px)",
            }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 32,
              mass: 0.7,
            }}
          >
            <div className="select-none overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-[0_16px_42px_-12px_rgba(0,0,0,0.5)] dark:border-zinc-600 dark:bg-zinc-800 dark:shadow-[0_18px_48px_-12px_rgba(0,0,0,0.9)]">
              <AnimatePresence mode="wait" initial={false}>
                {popoverMode === "toolbar" ? (
                  <motion.div
                    key="toolbar"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center"
                  >
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setPopoverMode("input");
                      }}
                      className="flex cursor-pointer select-none items-center gap-2 px-3 py-2 text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      <ChatBubbleIcon className="size-3.5 text-zinc-600 dark:text-zinc-400" />
                      <span className="text-xs font-medium">Add comment</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="input"
                    onSubmit={handleCreateComment}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="w-80 space-y-2.5 p-4 select-text"
                  >
                    <p className="line-clamp-2 border-l-2 border-zinc-300 pl-2 text-xs leading-relaxed text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                      {selectedText}
                    </p>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={newCommentAuthor}
                      onChange={(e) => setNewCommentAuthor(e.target.value)}
                      className="w-full rounded-[4px] border border-transparent bg-zinc-100 px-3 py-2 text-xs text-black placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                    <textarea
                      required
                      rows={2}
                      placeholder="Write a comment..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full resize-none rounded-[4px] border border-transparent bg-zinc-100 px-3 py-2 text-xs text-black placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPopoverMode("toolbar");
                          setIsPopoverShowing(false);
                          setPendingHighlightRects([]);
                        }}
                        className="inline-flex h-8 cursor-pointer items-center justify-center rounded-full px-3 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex h-8 cursor-pointer items-center justify-center rounded-full bg-zinc-950 px-3 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
                      >
                        Add comment
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Preview Tooltip (Smooth Bounce Out) */}
      <AnimatePresence>
        {hoveredComment && hoveredCommentPos && !selectedComment && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              top: hoveredCommentPos.top - 8,
              left: hoveredCommentPos.left + hoveredCommentPos.width / 2,
              x: "-50%",
              y: "-90%",
              filter: "blur(3px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              top: hoveredCommentPos.top - 14,
              left: hoveredCommentPos.left + hoveredCommentPos.width / 2,
              x: "-50%",
              y: "-100%",
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              top: hoveredCommentPos.top - 8,
              left: hoveredCommentPos.left + hoveredCommentPos.width / 2,
              x: "-50%",
              y: "-90%",
              filter: "blur(3px)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{
              position: "fixed",
              transformOrigin: "bottom center",
            }}
            className="z-30 pointer-events-none select-none w-72"
          >
            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-2xl space-y-1.5 relative">
              <div className="flex items-center justify-between text-[10px] font-mono text-amber-600 dark:text-amber-500 font-semibold tracking-wider">
                <span>NOTE BY {hoveredComment.author.toUpperCase()}</span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {hoveredComment.date}
                </span>
              </div>
              <div className="h-16 overflow-hidden relative">
                <p className="text-xs text-zinc-700 dark:text-zinc-300 italic font-sans leading-relaxed line-clamp-3">
                  "{hoveredComment.comment}"
                </p>
              </div>
              {hoveredComment.replies.length > 0 && (
                <div className="text-[9px] font-mono text-zinc-500 flex items-center gap-1 pt-0.5">
                  <CornerDownRight className="w-2.5 h-2.5" />
                  <span>
                    {hoveredComment.replies.length} threaded reply(ies)
                  </span>
                </div>
              )}
              {/* Pointer Triangle */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white dark:border-t-zinc-950" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Threaded comments detail modal overlay */}
      <AnimatePresence>
        {selectedComment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm select-text">
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-[#1a1a1f] border border-zinc-300 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/45">
                <div>
                  <h3 className="text-xs font-mono text-zinc-500">
                    HIGHLIGHT COMMENT
                  </h3>
                  <p className="text-[10px] font-mono text-amber-700 dark:text-amber-400 mt-0.5 truncate max-w-[320px]">
                    "{selectedComment.text}"
                  </p>
                </div>
                <button
                  onClick={() => setSelectedComment(null)}
                  className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-zinc-300 cursor-pointer focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Thread Content */}
              <div className="p-4 overflow-y-auto no-scrollbar space-y-4 flex-1">
                {/* Original Highlight Comment */}
                <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-400/5 border border-amber-200 dark:border-amber-400/15 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-zinc-950 dark:text-zinc-200">
                      {selectedComment.author}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                      {selectedComment.date}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-900 dark:text-zinc-300 leading-relaxed font-sans">
                    {selectedComment.comment}
                  </p>
                </div>

                {/* Nested Replies Section */}
                {selectedComment.replies.length > 0 && (
                  <div className="space-y-3 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                    {selectedComment.replies.map((rep) => (
                      <div key={rep.id} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-zinc-950 dark:text-zinc-300 flex items-center gap-1">
                            <CornerDownRight className="w-3.5 h-3.5 text-zinc-500" />
                            {rep.author}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500">
                            {rep.date}
                          </span>
                        </div>
                        <p className="text-zinc-900 dark:text-zinc-400 leading-relaxed font-sans pl-5">
                          {rep.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <form
                onSubmit={handleAddReply}
                className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/45 space-y-3"
              >
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={replyAuthor}
                    onChange={(e) => setReplyAuthor(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-black dark:text-zinc-200 placeholder-zinc-400 focus:outline-none"
                  />
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="Write a nested reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full pl-2.5 pr-10 py-1.5 text-xs font-sans rounded bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-black dark:text-zinc-200 placeholder-zinc-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 p-1 text-zinc-500 hover:text-black dark:hover:text-zinc-300 cursor-pointer focus:outline-none"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isBlog && blogItem && (
        <ReadingFooter
          item={blogItem}
          type="blog"
          relatedBlogs={relatedBlogs}
          seriesContext={seriesContext}
        />
      )}
      {type === "series" && seriesItem && (
        <ReadingFooter
          item={seriesItem}
          type="series"
          relatedBlogs={relatedBlogs}
        />
      )}
      {isWork && !isSliderDetail && (
        <CommentsSection itemId={item.id} itemType={type} />
      )}
    </motion.article>
  );
};
