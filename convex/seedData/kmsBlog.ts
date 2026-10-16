/** Sample posts for `npx convex run seed:seedTemplate`. Not personal content. */
export const templatePosts = [
  {
    slug: "quiet-interfaces",
    title: "Quiet Interfaces",
    category: "tech" as const,
    description:
      "A sample essay on why a portfolio page can be mostly type, space, and a few careful links.",
    content:
      "This essay is placeholder copy for the portfolio template. Replace it after you connect Convex, or edit the matching file in content/posts for local mode.\n\nA quiet page asks for one thing at a time.",
    date: "Jun 12, 2026",
    tags: ["design", "writing"],
    status: "published" as const,
    seriesSlug: "field-notes",
    partOrder: 1,
  },
  {
    slug: "paper-and-pixels",
    title: "Paper and Pixels",
    category: "other" as const,
    description: "Sample notes on keeping a series of short essays in plain files.",
    content:
      "Field Notes is a fictional series shipped with the template. This is part two.\n\nReplace this note with your own.",
    date: "Mar 8, 2026",
    tags: ["writing", "notes"],
    status: "published" as const,
    seriesSlug: "field-notes",
    partOrder: 2,
  },
  {
    slug: "published-elsewhere",
    title: "A Note Published Elsewhere",
    category: "other" as const,
    description: "Sample external essay. Readers leave the site for example.com.",
    content: "External essays store a URL and a short description.",
    externalUrl: "https://example.com/writing/a-note-published-elsewhere",
    date: "Jan 20, 2026",
    tags: ["writing"],
    status: "published" as const,
  },
];
