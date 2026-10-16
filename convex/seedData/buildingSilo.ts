/** Sample series for the Convex seed. The slug matches content/series/field-notes.md. */
export const templateSeries = {
  slug: "field-notes",
  title: "Field Notes",
  type: "Series",
  description:
    "A two-part sample series about keeping a portfolio in plain files.",
  content:
    "Field Notes is fictional. Posts with seriesSlug field-notes are attached as parts when you run the seed.",
  date: "Jun 2026",
  status: "published" as const,
  tags: ["writing", "design"],
};
