/** Sample project bodies applied by the Convex seed and by projectNotesSeed.apply. */
export const templateProjects = [
  {
    slug: "northwind",
    title: "Northwind",
    description:
      "A fictional reading desk for long essays. Sample project for the template.",
    date: "Apr 2026",
    link: "https://example.com/northwind",
    tags: ["design", "writing"],
  },
  {
    slug: "harbor",
    title: "Harbor",
    description: "An imaginary inbox for drafts, with no account and no backend.",
    date: "Nov 2025",
    link: "https://example.com/harbor",
    tags: ["tools"],
  },
  {
    slug: "paperweight",
    title: "Paperweight",
    description: "A pretend typesetting toy that turns Markdown into a printable page.",
    date: "Aug 2024",
    link: "https://example.com/paperweight",
    tags: ["design"],
  },
];

export const projectNotesBySlug: Record<string, string> = {
  northwind: `Northwind is not a real product. It is sample project copy for the template.

Replace this note after you seed Convex, or edit content/projects for local mode.

**Stack:** Next.js, TypeScript.`,
  harbor: `Harbor is a made-up project. Use it as the pattern for a second card.

**Stack:** TypeScript.`,
  paperweight: `Paperweight rounds out the sample project list.

**Stack:** Markdown.`,
};

export const stackParagraphsBySlug: Record<string, string> = {
  northwind: "**Stack:** Next.js, TypeScript, local content adapter.",
  harbor: "**Stack:** TypeScript.",
  paperweight: "**Stack:** Markdown.",
};
