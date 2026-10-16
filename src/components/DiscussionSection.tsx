"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Send } from "lucide-react";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "motion/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { isClientConvexConfigured } from "@/components/providers/ConvexClientProvider";
import { playErrorSound, playSuccessSound } from "@/lib/uiSounds";

type ItemType = "blog" | "series" | "work";

type FlatComment = {
  _id: Id<"comments">;
  author: string;
  body: string;
  createdAt: number;
  parentId?: Id<"comments">;
};

type ThreadNode = FlatComment & { replies: ThreadNode[] };

type CommentsSectionProps = {
  itemId: string;
  itemType: ItemType;
};

function formatCommentDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildThreads(rows: FlatComment[]): ThreadNode[] {
  const map = new Map<Id<"comments">, ThreadNode>();
  for (const row of rows) {
    map.set(row._id, { ...row, replies: [] });
  }
  const roots: ThreadNode[] = [];
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function CommentComposer({
  author,
  body,
  onAuthorChange,
  onBodyChange,
  onSubmit,
  submitting,
  placeholder = "Write a comment...",
  submitLabel = "Post comment",
  compact = false,
}: {
  author: string;
  body: string;
  onAuthorChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  placeholder?: string;
  submitLabel?: string;
  compact?: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={
        compact
          ? "space-y-2"
          : "space-y-3 border-b border-zinc-200 pb-8 dark:border-zinc-800"
      }
    >
      {!compact && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Write a comment
        </p>
      )}
      <div className={compact ? "" : "space-y-2"}>
        <input
          type="text"
          required
          placeholder="Your name"
          value={author}
          onChange={(e) => onAuthorChange(e.target.value)}
          className={`w-full rounded-[4px] border px-3 py-2 font-sans text-black transition-colors placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-zinc-200 ${
            compact
              ? "border-zinc-300 bg-transparent dark:border-zinc-700"
              : "border-transparent bg-zinc-100 dark:bg-zinc-800/70"
          } ${compact ? "text-[11px]" : "text-xs"}`}
        />
        <div className="relative">
          <textarea
            required
            rows={compact ? 2 : 3}
            placeholder={placeholder}
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            className={`w-full resize-none rounded-[4px] border px-3 py-2 font-sans leading-relaxed text-black transition-colors placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:text-zinc-200 ${
              compact
                ? "border-zinc-300 bg-transparent dark:border-zinc-700"
                : "border-transparent bg-zinc-100 dark:bg-zinc-800/70"
            } ${compact ? "text-[11px] pr-10" : "text-xs"}`}
          />
          {compact && (
            <button
              type="submit"
              disabled={submitting}
              className="absolute right-2 bottom-2 p-1.5 text-zinc-500 hover:text-black dark:hover:text-zinc-200 disabled:opacity-40 cursor-pointer"
              aria-label="Send reply"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {!compact && (
          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer rounded-full bg-zinc-950 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
          >
            {submitting ? "Publishing…" : submitLabel}
          </button>
        )}
      </div>
    </form>
  );
}

function CommentThread({
  node,
  depth,
  replyToId,
  setReplyToId,
  replyAuthor,
  replyBody,
  setReplyAuthor,
  setReplyBody,
  onSubmitReply,
  submitting,
}: {
  node: ThreadNode;
  depth: number;
  replyToId: Id<"comments"> | null;
  setReplyToId: (id: Id<"comments"> | null) => void;
  replyAuthor: string;
  replyBody: string;
  setReplyAuthor: (v: string) => void;
  setReplyBody: (v: string) => void;
  onSubmitReply: (e: React.FormEvent) => void;
  submitting: boolean;
}) {
  const isReply = depth > 0;
  const maxDepth = 4;

  return (
    <div className={isReply ? "mt-3" : ""}>
      <div
        className={
          isReply
            ? "pl-3 sm:pl-4 border-l-2 border-zinc-200 dark:border-zinc-700/80"
            : ""
        }
      >
        <div
          className={
            isReply
              ? "space-y-1.5"
              : "space-y-2 border-b border-zinc-200 py-5 dark:border-zinc-800"
          }
        >
          <div className="flex items-center gap-3">
            <span
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              aria-hidden
            >
              {node.author.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium text-zinc-950 dark:text-zinc-200">
                {node.author}
              </span>
              <span className="mt-0.5 block text-[10px] text-zinc-500 dark:text-zinc-400">
                {formatCommentDate(node.createdAt)}
              </span>
            </span>
          </div>
          <p
            className={`whitespace-pre-wrap font-sans leading-relaxed text-zinc-900 dark:text-zinc-400 ${
              isReply ? "pl-9 text-[13px]" : "text-sm"
            }`}
          >
            {node.body}
          </p>
          {depth < maxDepth && (
            <div className={isReply ? "pl-9" : ""}>
              <button
                type="button"
                onClick={() =>
                  setReplyToId(replyToId === node._id ? null : node._id)
                }
                className="text-[11px] font-mono font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
              >
                {replyToId === node._id ? "Cancel" : "Reply"}
              </button>
            </div>
          )}

          {replyToId === node._id && (
            <div className={`pt-2 ${isReply ? "pl-9" : ""}`}>
              <CommentComposer
                author={replyAuthor}
                body={replyBody}
                onAuthorChange={setReplyAuthor}
                onBodyChange={setReplyBody}
                onSubmit={onSubmitReply}
                submitting={submitting}
                placeholder={`Reply to ${node.author}…`}
                compact
              />
            </div>
          )}
        </div>

        {node.replies.length > 0 && (
          <div className="mt-1 space-y-0">
            {node.replies.map((child) => (
              <CommentThread
                key={child._id}
                node={child}
                depth={depth + 1}
                replyToId={replyToId}
                setReplyToId={setReplyToId}
                replyAuthor={replyAuthor}
                replyBody={replyBody}
                setReplyAuthor={setReplyAuthor}
                setReplyBody={setReplyBody}
                onSubmitReply={onSubmitReply}
                submitting={submitting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentsLive({ itemId, itemType }: CommentsSectionProps) {
  const comments = useQuery(api.comments.listByItem, { itemId });
  const createComment = useMutation(api.comments.create);

  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [replyToId, setReplyToId] = useState<Id<"comments"> | null>(null);
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const threads = useMemo(
    () => (comments ? buildThreads(comments) : []),
    [comments],
  );
  const total = comments?.length ?? 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createComment({
        itemId,
        itemType,
        author,
        body,
      });
      setBody("");
      playSuccessSound();
    } catch (err) {
      playErrorSound();
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyToId || !replyAuthor.trim() || !replyBody.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createComment({
        itemId,
        itemType,
        author: replyAuthor,
        body: replyBody,
        parentId: replyToId,
      });
      setReplyBody("");
      setReplyToId(null);
      playSuccessSound();
    } catch (err) {
      playErrorSound();
      setError(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="space-y-6 pt-10"
      id="portfolio-general-comments"
    >
      <div>
        <h2 className="text-base font-sans font-semibold text-black dark:text-zinc-300">
          Comments {comments !== undefined ? `(${total})` : ""}
        </h2>
        <p className="text-xs font-mono text-zinc-600 dark:text-zinc-500 mt-0.5">
          Share a thought or reply to another reader.
        </p>
      </div>

      <CommentComposer
        author={author}
        body={body}
        onAuthorChange={setAuthor}
        onBodyChange={setBody}
        onSubmit={handleCreate}
        submitting={submitting}
        submitLabel="Post comment"
      />

      {error && (
        <p className="text-xs font-mono text-rose-500" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-4 pt-2">
        {comments === undefined && (
          <p className="text-xs text-zinc-500">Loading comments…</p>
        )}
        {comments !== undefined && total === 0 && (
          <p className="text-xs font-mono text-zinc-500">
            No comments yet. Be the first to write one.
          </p>
        )}
        <AnimatePresence initial={false}>
          {threads.map((node) => (
            <motion.div
              key={node._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <CommentThread
                node={node}
                depth={0}
                replyToId={replyToId}
                setReplyToId={setReplyToId}
                replyAuthor={replyAuthor}
                replyBody={replyBody}
                setReplyAuthor={setReplyAuthor}
                setReplyBody={setReplyBody}
                onSubmitReply={handleReply}
                submitting={submitting}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function CommentsSection(props: CommentsSectionProps) {
  if (!isClientConvexConfigured()) {
    return (
      <div
        className="space-y-2 pt-10"
        id="portfolio-general-comments"
      >
        <h2 className="text-base font-sans font-semibold text-black dark:text-zinc-300 flex items-center gap-2">
          <ChatBubbleIcon className="size-4 text-zinc-500" />
          Comments
        </h2>
        <p className="text-xs font-mono text-zinc-500">
          Comments are unavailable until Convex is configured.
        </p>
      </div>
    );
  }
  return <CommentsLive {...props} />;
}
