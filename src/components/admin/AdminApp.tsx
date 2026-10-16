"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  clearAdminSessionToken,
  getAdminSessionToken,
  setAdminSessionToken,
} from "../../lib/adminSession";
import { InspirationFilterBar } from "@/components/portfolio/InspirationFilterBar";
import {
  categoryLabels,
  inspirationCategories,
  type InspirationCategory,
} from "@/lib/inspirations";
import { BlogEditor } from "./BlogEditor";
import { SeriesEditor } from "./SeriesEditor";
import { ProjectEditor } from "./ProjectEditor";
import { WorkEditor } from "./WorkEditor";
import { InspirationEditor } from "./InspirationEditor";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  LogOut,
  Moon,
  Plus,
  Sun,
} from "lucide-react";
import { ChevronLeftIcon } from "@radix-ui/react-icons";

type Tab = "writings" | "series" | "projects" | "works" | "inspirations";

type View =
  | { mode: "list" }
  | { mode: "create" }
  | {
      mode: "edit";
      id:
        | Id<"posts">
        | Id<"series">
        | Id<"projects">
        | Id<"works">
        | Id<"inspirations">;
    };

type Theme = "light" | "dark";

const THEME_KEY = "portfolio-theme";

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // ignore
  }
  return "dark";
}

export const AdminApp: React.FC = () => {
  // Start null on both server and client to avoid hydration mismatch —
  // localStorage is only available after mount.
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("writings");
  const [view, setView] = useState<View>({ mode: "list" });
  const [theme, setTheme] = useState<Theme>("dark");
  const [listQuery, setListQuery] = useState("");
  const [inspirationCategory, setInspirationCategory] = useState<
    InspirationCategory | "all"
  >("all");
  // Stable timestamp for auth queries — must NOT change on tab switches
  // or Convex will clear cached results and flash the full-page spinner.
  const [now, setNow] = useState(0);

  useEffect(() => {
    setSessionToken(getAdminSessionToken());
    setNow(Date.now());
    setSessionHydrated(true);
    setTheme(readTheme());
  }, []);

  const me = useQuery(
    api.auth.me,
    sessionHydrated && sessionToken ? { sessionToken, now } : "skip",
  );
  const authed = Boolean(sessionToken && me?.authenticated);
  const adminArgs =
    sessionToken && authed ? { sessionToken, now } : ("skip" as const);

  const posts = useQuery(api.posts.listAll, adminArgs);
  const series = useQuery(api.series.listAll, adminArgs);
  const projects = useQuery(api.projects.listAll, adminArgs);
  const works = useQuery(api.works.listAll, adminArgs);
  const inspirations = useQuery(api.inspirations.listAll, adminArgs);

  const login = useMutation(api.auth.login);
  const logout = useMutation(api.auth.logout);
  const removePost = useMutation(api.posts.remove);
  const removeSeries = useMutation(api.series.remove);
  const removeProject = useMutation(api.projects.remove);
  const removeWork = useMutation(api.works.remove);
  const removeInspiration = useMutation(api.inspirations.remove);
  const reorderSeries = useMutation(api.series.reorder);
  const reorderProjects = useMutation(api.projects.reorder);
  const reorderWorks = useMutation(api.works.reorder);
  const reorderInspirations = useMutation(api.inspirations.reorder);

  const filteredInspirations = useMemo(() => {
    if (!inspirations) return undefined;
    const query = listQuery.trim().toLowerCase();
    return inspirations.filter((item) => {
      if (
        inspirationCategory !== "all" &&
        item.category !== inspirationCategory
      ) {
        return false;
      }
      if (!query) return true;
      const haystack = [
        item.name,
        item.blurb,
        item.about,
        item.kind,
        item.url,
        item.slug,
        item.category,
        categoryLabels[item.category as InspirationCategory] ?? item.category,
        ...(item.styles ?? []),
        ...(item.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [inspirations, listQuery, inspirationCategory]);

  const matchesListQuery = (parts: Array<string | null | undefined>) => {
    const query = listQuery.trim().toLowerCase();
    if (!query) return true;
    return parts.filter(Boolean).join(" ").toLowerCase().includes(query);
  };

  const filteredPosts = useMemo(() => {
    if (!posts) return undefined;
    return posts.filter((p) =>
      matchesListQuery([
        p.title,
        p.slug,
        p.category,
        p.date,
        p.description,
        p.externalUrl,
      ]),
    );
  }, [posts, listQuery]);

  const filteredSeries = useMemo(() => {
    if (!series) return undefined;
    return series.filter((s) =>
      matchesListQuery([s.title, s.slug, s.type, s.description]),
    );
  }, [series, listQuery]);

  const filteredProjects = useMemo(() => {
    if (!projects) return undefined;
    return projects.filter((p) =>
      matchesListQuery([p.title, p.slug, p.date, p.description]),
    );
  }, [projects, listQuery]);

  const filteredWorks = useMemo(() => {
    if (!works) return undefined;
    return works.filter((w) => matchesListQuery([w.title, w.slug]));
  }, [works, listQuery]);

  useEffect(() => {
    setListQuery("");
    if (tab !== "inspirations") {
      setInspirationCategory("all");
    }
  }, [tab]);

  useEffect(() => {
    if (sessionToken) {
      setNow(Date.now());
    }
  }, [sessionToken]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    document.body.style.backgroundColor = "";
  }, [theme]);

  useEffect(() => {
    if (me && !me.authenticated) {
      clearAdminSessionToken();
      setSessionToken(null);
    }
  }, [me]);

  useEffect(() => {
    setView({ mode: "list" });
  }, [tab]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isDark = theme === "dark";
  const shell = isDark
    ? "bg-[#18181c] text-zinc-300"
    : "bg-[#fafafa] text-zinc-700";
  const muted = isDark ? "text-zinc-500" : "text-zinc-500";
  const heading = isDark ? "text-zinc-50" : "text-zinc-950";
  const border = isDark ? "border-zinc-800" : "border-zinc-200";
  const card = isDark
    ? "border-zinc-800 bg-zinc-900/40"
    : "border-zinc-200 bg-white";
  const inputClass = isDark
    ? "bg-zinc-950 border-zinc-700 text-zinc-100 focus:border-amber-500"
    : "bg-white border-zinc-300 text-zinc-900 focus:border-amber-500";
  const softBtn = isDark
    ? "text-zinc-500 hover:text-zinc-200"
    : "text-zinc-500 hover:text-zinc-800";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const result = await login({ password });
      setAdminSessionToken(result.sessionToken);
      setSessionToken(result.sessionToken);
      setPassword("");
      setShowPassword(false);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleLogout = async () => {
    if (sessionToken) {
      try {
        await logout({ sessionToken });
      } catch {
        // clear anyway
      }
    }
    clearAdminSessionToken();
    setSessionToken(null);
  };

  const ThemeToggle = (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
        isDark
          ? "hover:bg-zinc-800/50 text-zinc-400"
          : "hover:bg-zinc-200/80 text-zinc-500"
      }`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5" />
      ) : (
        <Moon className="w-3.5 h-3.5" />
      )}
    </button>
  );

  if (!sessionHydrated || !sessionToken || me === undefined) {
    if (sessionHydrated && !sessionToken) {
      return (
        <div
          className={`min-h-screen flex items-center justify-center px-6 ${shell}`}
        >
          <form
            onSubmit={(e) => void handleLogin(e)}
            className={`w-full max-w-sm space-y-4 border rounded-xl p-6 ${card}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className={`text-lg font-semibold ${heading}`}>
                  Portfolio Admin
                </h1>
                <p className={`text-xs font-mono mt-1 ${muted}`}>
                  Writings, series, projects, works, and inspirations.
                </p>
              </div>
              {ThemeToggle}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none ${inputClass}`}
                autoFocus
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded cursor-pointer ${softBtn}`}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {loginError && (
              <p className="text-xs text-rose-400 font-mono">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-amber-500/90 hover:bg-amber-400 text-zinc-950 text-sm font-semibold py-2 cursor-pointer"
            >
              Sign in
            </button>
            <a
              href="/"
              className={`flex items-center justify-center gap-1 text-center text-xs font-mono hover:opacity-80 ${muted}`}
            >
              <ChevronLeftIcon className="size-3" />
              Back to site
            </a>
          </form>
        </div>
      );
    }
    return (
      <div
        className={`min-h-screen flex items-center justify-center font-mono text-sm ${shell} ${muted}`}
      >
        Checking session…
      </div>
    );
  }

  if (!me.authenticated || !sessionToken) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center font-mono text-sm ${shell} ${muted}`}
      >
        Session expired. Redirecting…
      </div>
    );
  }

  if (view.mode === "create" || view.mode === "edit") {
    if (tab === "writings") {
      return (
        <BlogEditor
          sessionToken={sessionToken}
          postId={view.mode === "edit" ? (view.id as Id<"posts">) : null}
          onBack={() => setView({ mode: "list" })}
        />
      );
    }
    if (tab === "series") {
      return (
        <SeriesEditor
          sessionToken={sessionToken}
          seriesId={view.mode === "edit" ? (view.id as Id<"series">) : null}
          onBack={() => setView({ mode: "list" })}
        />
      );
    }
    if (tab === "projects") {
      return (
        <ProjectEditor
          sessionToken={sessionToken}
          projectId={view.mode === "edit" ? (view.id as Id<"projects">) : null}
          onBack={() => setView({ mode: "list" })}
        />
      );
    }
    if (tab === "inspirations") {
      return (
        <InspirationEditor
          sessionToken={sessionToken}
          inspirationId={
            view.mode === "edit" ? (view.id as Id<"inspirations">) : null
          }
          onBack={() => setView({ mode: "list" })}
        />
      );
    }
    return (
      <WorkEditor
        sessionToken={sessionToken}
        workId={view.mode === "edit" ? (view.id as Id<"works">) : null}
        onBack={() => setView({ mode: "list" })}
      />
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "writings", label: "Writings", count: posts?.length },
    { id: "series", label: "Series", count: series?.length },
    { id: "projects", label: "Projects", count: projects?.length },
    { id: "works", label: "Works", count: works?.length },
    { id: "inspirations", label: "Inspirations", count: inspirations?.length },
  ];

  return (
    <div className={`min-h-screen px-6 py-10 ${shell}`}>
      <div className="max-w-3xl mx-auto space-y-8 font-sans">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className={`text-xl font-semibold ${heading}`}>
              Portfolio Admin
            </h1>
            <p className={`text-xs mt-1 ${muted}`}>
              Manage all published content
            </p>
          </div>
          <div className="flex items-center gap-1">
            {ThemeToggle}
            <a
              href="/"
              className={`inline-flex items-center gap-1.5 text-xs px-2 py-1.5 ${softBtn}`}
            >
              <ChevronLeftIcon className="size-3.5" />
              Site
            </a>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className={`inline-flex items-center gap-1.5 text-xs px-2 py-1.5 cursor-pointer ${softBtn}`}
            >
              <LogOut className="w-3 h-3" />
              Log out
            </button>
          </div>
        </header>

        <section
          className={`flex flex-wrap items-center justify-between border-b pb-px ${border}`}
        >
          <div className="flex flex-wrap gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-3 py-2 text-xs uppercase tracking-wide cursor-pointer transition-colors ${
                  tab === t.id
                    ? "text-amber-500 border-b-2 border-amber-500"
                    : isDark
                      ? "text-zinc-500 hover:text-zinc-300"
                      : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {t.label}
                {typeof t.count === "number" && (
                  <span
                    className={`ml-1.5 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setView({ mode: "create" })}
            className="inline-flex items-center gap-1 text-zinc-900 dark:text-zinc-50 text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New{" "}
            {tab === "writings"
              ? "writing"
              : tab === "series"
                ? "series"
                : tab === "projects"
                  ? "project"
                  : tab === "inspirations"
                    ? "inspiration"
                    : "work"}
          </button>
        </section>

        <InspirationFilterBar
          query={listQuery}
          onQueryChange={setListQuery}
          placeholder={
            tab === "inspirations"
              ? "Search by name, URL, tags…"
              : `Search ${tab}…`
          }
          tone={isDark ? "admin-dark" : "admin-light"}
          className="mb-2"
        />

        {tab === "writings" && (
          <ItemList
            theme={theme}
            loading={posts === undefined}
            empty={
              listQuery ? "No writings match your search." : "No writings yet."
            }
            items={filteredPosts?.map((p) => ({
              id: p._id,
              title: p.title,
              meta: `${p.slug} · ${p.date}${p.externalUrl ? " · external" : ""}`,
              status: p.status,
              badge: p.category,
            }))}
            reorderable={false}
            onEdit={(id) => setView({ mode: "edit", id: id as Id<"posts"> })}
            onDelete={(id, title) => {
              if (confirm(`Delete “${title}”?`)) {
                void removePost({
                  sessionToken,
                  postId: id as Id<"posts">,
                });
              }
            }}
          />
        )}

        {tab === "series" && (
          <ItemList
            theme={theme}
            loading={series === undefined}
            empty={
              listQuery ? "No series match your search." : "No series yet."
            }
            items={filteredSeries?.map((s) => ({
              id: s._id,
              title: s.title,
              meta: `${s.slug} · ${s.type} · ${s.parts.length} parts`,
              status: s.status,
              badge: s.type,
            }))}
            onReorder={(orderedIds) => {
              void reorderSeries({
                sessionToken,
                orderedIds: orderedIds as Id<"series">[],
              });
            }}
            onEdit={(id) => setView({ mode: "edit", id: id as Id<"series"> })}
            onDelete={(id, title) => {
              if (
                confirm(
                  `Delete series “${title}”? Linked writings are unlinked, not deleted.`,
                )
              ) {
                void removeSeries({
                  sessionToken,
                  seriesId: id as Id<"series">,
                });
              }
            }}
          />
        )}

        {tab === "projects" && (
          <ItemList
            theme={theme}
            loading={projects === undefined}
            empty={
              listQuery ? "No projects match your search." : "No projects yet."
            }
            items={filteredProjects?.map((p) => ({
              id: p._id,
              title: p.title,
              meta: `${p.slug} · ${p.date}`,
              status: p.status,
            }))}
            onReorder={(orderedIds) => {
              void reorderProjects({
                sessionToken,
                orderedIds: orderedIds as Id<"projects">[],
              });
            }}
            onEdit={(id) => setView({ mode: "edit", id: id as Id<"projects"> })}
            onDelete={(id, title) => {
              if (confirm(`Delete “${title}”?`)) {
                void removeProject({
                  sessionToken,
                  projectId: id as Id<"projects">,
                });
              }
            }}
          />
        )}

        {tab === "works" && (
          <ItemList
            theme={theme}
            loading={works === undefined}
            empty={listQuery ? "No works match your search." : "No works yet."}
            items={filteredWorks?.map((w) => ({
              id: w._id,
              title: w.title,
              meta: w.slug,
              status: w.status,
            }))}
            onReorder={(orderedIds) => {
              void reorderWorks({
                sessionToken,
                orderedIds: orderedIds as Id<"works">[],
              });
            }}
            onEdit={(id) => setView({ mode: "edit", id: id as Id<"works"> })}
            onDelete={(id, title) => {
              if (confirm(`Delete “${title}”?`)) {
                void removeWork({
                  sessionToken,
                  workId: id as Id<"works">,
                });
              }
            }}
          />
        )}

        {tab === "inspirations" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {inspirationCategories.map((cat) => {
                const active = inspirationCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setInspirationCategory(cat.id)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium cursor-pointer transition-colors ${
                      active
                        ? "bg-amber-500 text-zinc-950"
                        : isDark
                          ? "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                          : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
            <ItemList
              theme={theme}
              loading={inspirations === undefined}
              empty={
                listQuery || inspirationCategory !== "all"
                  ? "No inspirations match your filters."
                  : "No inspirations yet."
              }
              items={filteredInspirations?.map((item) => ({
                id: item._id,
                title: item.name,
                meta: `${item.slug} · ${categoryLabels[item.category as InspirationCategory] ?? item.category} · ${item.kind}`,
                status: item.status,
                badge: item.kind,
              }))}
              onReorder={(orderedIds) => {
                void reorderInspirations({
                  sessionToken,
                  orderedIds: orderedIds as Id<"inspirations">[],
                });
              }}
              onEdit={(id) =>
                setView({ mode: "edit", id: id as Id<"inspirations"> })
              }
              onDelete={(id, title) => {
                if (confirm(`Delete “${title}”?`)) {
                  void removeInspiration({
                    sessionToken,
                    inspirationId: id as Id<"inspirations">,
                  });
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

function ItemList({
  theme,
  loading,
  empty,
  items,
  onEdit,
  onDelete,
  onReorder,
  reorderable = true,
}: {
  theme: Theme;
  loading: boolean;
  empty: string;
  items?: Array<{
    id: string;
    title: string;
    meta: string;
    status: string;
    badge?: string;
  }>;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onReorder?: (orderedIds: string[]) => void;
  reorderable?: boolean;
}) {
  const isDark = theme === "dark";
  const [localItems, setLocalItems] = useState(items ?? []);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLocalItems(items ?? []);
  }, [items]);

  const persistOrder = (next: typeof localItems) => {
    if (!onReorder) return;
    setLocalItems(next);
    setBusy(true);
    try {
      onReorder(next.map((item) => item.id));
    } finally {
      setBusy(false);
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= localItems.length || from === to) return;
    const next = [...localItems];
    const [row] = next.splice(from, 1);
    if (!row) return;
    next.splice(to, 0, row);
    persistOrder(next);
  };

  if (loading) {
    return (
      <p
        className={`text-sm font-sans ${isDark ? "text-zinc-500" : "text-zinc-500"}`}
      >
        Loading…
      </p>
    );
  }
  if (!localItems.length) {
    return <p className="text-sm text-zinc-500">{empty}</p>;
  }

  return (
    <div className="space-y-2">
      <p
        className={`text-[11px] font-sans mb-1 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}
      >
        {reorderable
          ? "Drag or use arrows to set homepage order (top = first)."
          : "Sorted by publication date (newest first)."}
      </p>
      {localItems.map((item, index) => (
        <div
          key={item.id}
          draggable={reorderable && !busy}
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIndex === null) return;
            move(dragIndex, index);
            setDragIndex(null);
          }}
          onDragEnd={() => setDragIndex(null)}
          className={`flex flex-wrap items-center justify-between gap-3 border rounded-lg px-3 py-3 ${
            isDark
              ? "border-zinc-800 bg-zinc-900/30"
              : "border-zinc-200 bg-white"
          } ${dragIndex === index ? "opacity-60" : ""}`}
        >
          <div className="flex items-start gap-2 min-w-0 flex-1">
            {reorderable && (
              <span
                className={`mt-0.5 shrink-0 cursor-grab active:cursor-grabbing ${
                  isDark ? "text-zinc-600" : "text-zinc-400"
                }`}
                title="Drag to reorder"
                aria-hidden
              >
                <GripVertical className="w-4 h-4" />
              </span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] tabular-nums ${
                    isDark ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  {index + 1}
                </span>
                <h2
                  className={`text-sm font-medium truncate ${
                    isDark ? "text-zinc-100" : "text-zinc-900"
                  }`}
                >
                  {item.title}
                </h2>
                <span
                  className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${
                    item.status === "published"
                      ? "bg-emerald-500/15 text-emerald-500"
                      : isDark
                        ? "bg-zinc-700/50 text-zinc-400"
                        : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {item.status}
                </span>
                {item.badge && (
                  <span className="text-[10px] text-zinc-500 capitalize">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{item.meta}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {reorderable && (
              <>
                <button
                  type="button"
                  disabled={busy || index === 0}
                  onClick={() => move(index, index - 1)}
                  className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-30 cursor-pointer"
                  title="Move up"
                  aria-label="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={busy || index === localItems.length - 1}
                  onClick={() => move(index, index + 1)}
                  className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-30 cursor-pointer"
                  title="Move down"
                  aria-label="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onEdit(item.id)}
              className="text-xs text-amber-500 hover:text-amber-400 cursor-pointer px-1"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id, item.title)}
              className="text-xs text-rose-400/80 hover:text-rose-300 cursor-pointer px-1"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
