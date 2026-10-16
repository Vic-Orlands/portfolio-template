import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { estimateReadingTime, slugify } from "./lib/readingTime";
import { nextSortOrder } from "./lib/content";
import { normalizeTags } from "./lib/tags";
import { templatePosts } from "./seedData/kmsBlog";
import { templateSeries } from "./seedData/buildingSilo";
import {
  projectNotesBySlug,
  templateProjects,
} from "./seedData/projectNotes";
import { inspirationsSeed } from "./seedData/inspirations";
import type { Id } from "./_generated/dataModel";

const templateWorks = [
  {
    slug: "orion-study",
    title: "Orion Study",
    category: "3D" as const,
    description: "A sample scribble shipped with the template.",
    date: "May 2026",
    content:
      "Orion Study is fictional. Replace it from the admin CMS or from content/works in local mode.",
    technologies: ["Canvas", "TypeScript"],
    link: "https://example.com/works/orion-study",
    tags: ["design"],
  },
  {
    slug: "bento-study",
    title: "Bento Study",
    category: "Grid" as const,
    description: "A sample bento layout study.",
    date: "Apr 2026",
    content: "Bento Study is placeholder scribble copy.",
    technologies: ["CSS"],
    link: "https://example.com/works/bento-study",
    tags: ["design"],
  },
  {
    slug: "prism-study",
    title: "Prism Study",
    category: "Card" as const,
    description: "A sample card study with no external media.",
    date: "Jan 2026",
    content: "Prism Study is placeholder scribble copy.",
    technologies: ["CSS"],
    tags: ["design"],
  },
];

/**
 * Idempotent template seed. Inserts sample posts, a series, projects, works,
 * and inspirations when their slugs are free. Safe to run more than once.
 *
 *   npx convex run seed:seedTemplate
 */
export const seedTemplate = internalMutation({
  args: {},
  returns: v.object({
    postsCreated: v.number(),
    seriesCreated: v.boolean(),
    projectsCreated: v.number(),
    worksCreated: v.number(),
    inspirationsCreated: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    let postsCreated = 0;
    let projectsCreated = 0;
    let worksCreated = 0;
    let inspirationsCreated = 0;

    const existingSeries = await ctx.db
      .query("series")
      .withIndex("by_slug", (q) => q.eq("slug", templateSeries.slug))
      .unique();

    const seriesId: Id<"series"> =
      existingSeries?._id ??
      (await ctx.db.insert("series", {
        slug: templateSeries.slug,
        title: templateSeries.title,
        type: templateSeries.type,
        description: templateSeries.description,
        content: templateSeries.content,
        date: templateSeries.date,
        status: templateSeries.status,
        sortOrder: await nextSortOrder(ctx, "series"),
        tags: normalizeTags([...templateSeries.tags]),
        updatedAt: now,
        publishedAt: now,
      }));

    for (const post of templatePosts) {
      const existingPost = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", post.slug))
        .unique();
      if (existingPost) continue;

      await ctx.db.insert("posts", {
        slug: post.slug,
        title: post.title,
        category: post.category,
        description: post.description,
        content: post.content,
        externalUrl:
          "externalUrl" in post ? post.externalUrl : undefined,
        date: post.date,
        readingTime: estimateReadingTime(post.content),
        status: post.status,
        seriesId: "seriesSlug" in post ? seriesId : undefined,
        partOrder: "partOrder" in post ? post.partOrder : undefined,
        sortOrder: await nextSortOrder(ctx, "posts"),
        tags: normalizeTags([...post.tags]),
        updatedAt: now,
        publishedAt: now,
      });
      postsCreated += 1;
    }

    for (const project of templateProjects) {
      const existing = await ctx.db
        .query("projects")
        .withIndex("by_slug", (q) => q.eq("slug", project.slug))
        .unique();
      if (existing) continue;
      await ctx.db.insert("projects", {
        slug: project.slug,
        title: project.title,
        description: project.description,
        content: projectNotesBySlug[project.slug] ?? "",
        date: project.date,
        link: project.link,
        status: "published",
        sortOrder: await nextSortOrder(ctx, "projects"),
        tags: normalizeTags([...project.tags]),
        updatedAt: now,
        publishedAt: now,
      });
      projectsCreated += 1;
    }

    for (const work of templateWorks) {
      const existing = await ctx.db
        .query("works")
        .withIndex("by_slug", (q) => q.eq("slug", work.slug))
        .unique();
      if (existing) continue;
      await ctx.db.insert("works", {
        slug: work.slug,
        title: work.title,
        category: work.category,
        description: work.description,
        date: work.date,
        content: work.content,
        technologies: work.technologies,
        link: "link" in work ? work.link : undefined,
        status: "published",
        sortOrder: await nextSortOrder(ctx, "works"),
        tags: normalizeTags([...work.tags]),
        updatedAt: now,
        publishedAt: now,
      });
      worksCreated += 1;
    }

    for (const item of inspirationsSeed) {
      const slug = slugify(item.name);
      const existing = await ctx.db
        .query("inspirations")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (existing) continue;
      await ctx.db.insert("inspirations", {
        slug,
        name: item.name,
        url: item.url,
        blurb: item.blurb,
        about: item.about,
        category: item.category,
        kind: item.kind,
        styles: [...item.styles],
        tags: normalizeTags(item.tags ? [...item.tags] : undefined),
        status: "published",
        sortOrder: await nextSortOrder(ctx, "inspirations"),
        updatedAt: now,
        publishedAt: now,
      });
      inspirationsCreated += 1;
    }

    return {
      postsCreated,
      seriesCreated: existingSeries === null,
      projectsCreated,
      worksCreated,
      inspirationsCreated,
    };
  },
});
