"use client";

import Link from "next/link";
import { formatTag } from "@/lib/tags";

type TagListProps = {
  tags?: string[];
  className?: string;
};

export function TagList({ tags, className = "" }: TagListProps) {
  if (!tags?.length) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/tags/${encodeURIComponent(tag)}`}
          transitionTypes={["nav-forward"]}
          className="text-xs font-mono text-amber-700 dark:text-amber-400/90 hover:underline"
        >
          {formatTag(tag)}
        </Link>
      ))}
    </div>
  );
}
