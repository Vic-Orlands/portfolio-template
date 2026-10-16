"use client";

import { Search } from "lucide-react";

type InspirationFilterBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  kind?: string;
  onKindChange?: (value: string) => void;
  kinds?: string[];
  placeholder?: string;
  /** Visual density for admin vs public surfaces. */
  tone?: "public" | "admin-dark" | "admin-light";
  className?: string;
  showKindFilter?: boolean;
};

export function InspirationFilterBar({
  query,
  onQueryChange,
  kind = "",
  onKindChange,
  kinds = [],
  placeholder = "Search…",
  tone = "public",
  className = "",
  showKindFilter = false,
}: InspirationFilterBarProps) {
  const isPublic = tone === "public";
  const isAdminDark = tone === "admin-dark";

  const inputClass = isPublic
    ? "w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
    : isAdminDark
      ? "w-full rounded-lg border border-zinc-800 bg-zinc-950/40 pl-8 pr-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
      : "w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400";

  const selectClass = isPublic
    ? "rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200 dark:focus:border-zinc-500"
    : isAdminDark
      ? "rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600"
      : "rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:outline-none focus:border-zinc-400";

  const iconClass = isPublic
    ? "text-zinc-400 dark:text-zinc-500"
    : isAdminDark
      ? "text-zinc-600"
      : "text-zinc-400";

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-2 ${className}`}
    >
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search</span>
        <Search
          className={`pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 ${iconClass}`}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      </label>
      {showKindFilter && onKindChange ? (
        <label className="shrink-0">
          <span className="sr-only">Filter by type</span>
          <select
            value={kind}
            onChange={(e) => onKindChange(e.target.value)}
            className={selectClass}
          >
            <option value="">All types</option>
            {kinds.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}
