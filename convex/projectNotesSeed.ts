import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import {
  stackParagraphsBySlug,
  projectNotesBySlug,
} from "./seedData/projectNotes";

/** Refreshes sample project notes for slugs that already exist. */
export const apply = internalMutation({
  args: {
    slugs: v.optional(v.array(v.string())),
  },
  returns: v.object({
    updated: v.array(v.string()),
    missing: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const requested =
      args.slugs ??
      Array.from(
        new Set([
          ...Object.keys(projectNotesBySlug),
          ...Object.keys(stackParagraphsBySlug),
        ]),
      );
    const updated: string[] = [];
    const missing: string[] = [];

    for (const slug of requested) {
      const project = await ctx.db
        .query("projects")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!project) {
        missing.push(slug);
        continue;
      }

      let content = projectNotesBySlug[slug]?.trim() ?? project.content ?? "";
      const stackParagraph = stackParagraphsBySlug[slug];
      if (stackParagraph) {
        content = /\*\*Stack:\*\*[^\n]*/.test(content)
          ? content.replace(/\*\*Stack:\*\*[^\n]*/, stackParagraph)
          : `${content.trim()}\n\n${stackParagraph}`;
      }
      if (!content.trim()) {
        missing.push(slug);
        continue;
      }

      await ctx.db.patch(project._id, {
        content: content.trim(),
        updatedAt: Date.now(),
      });
      updated.push(slug);
    }

    return { updated, missing };
  },
});
