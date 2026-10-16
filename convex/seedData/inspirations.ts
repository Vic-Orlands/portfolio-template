type InspirationSeedItem = {
  name: string;
  url: string;
  blurb: string;
  about: string;
  category: "design" | "writing" | "tools" | "ai" | "reference";
  kind: string;
  styles: string[];
  tags?: string[];
};

/** Sample bookmarks. URLs stay on example.com. */
export const inspirationsSeed: InspirationSeedItem[] = [
  {
    name: "Example Gallery",
    url: "https://example.com/gallery",
    blurb: "A fictional gallery of layout, type, and spacing references.",
    about:
      "Replace this bookmark with sites you actually return to. The default set uses example.com.",
    category: "design",
    kind: "Gallery",
    styles: ["Editorial", "Type"],
    tags: ["design", "reference"],
  },
  {
    name: "Sample Writing Desk",
    url: "https://example.com/writing",
    blurb: "Placeholder writing reference for essays, notes, and outlines.",
    about: "A stand-in for the blogs you want listed under inspirations.",
    category: "writing",
    kind: "Publication",
    styles: ["Essays"],
    tags: ["writing"],
  },
  {
    name: "Northwind Tools",
    url: "https://example.com/tools",
    blurb: "Imaginary tools the sample author keeps nearby while building.",
    about: "Use this entry as the shape for a tool bookmark.",
    category: "tools",
    kind: "Tool",
    styles: ["Utility"],
    tags: ["tools"],
  },
  {
    name: "Paperweight Models",
    url: "https://example.com/models",
    blurb: "Fictional notes on small language-model workflows.",
    about: "Sample AI reference. Swap the URL and blurb when you personalize the site.",
    category: "ai",
    kind: "Reference",
    styles: ["Notes"],
    tags: ["ai"],
  },
  {
    name: "Harbor Patterns",
    url: "https://example.com/patterns",
    blurb: "A pretend pattern library for interface craft.",
    about: "Listed under the design-engineer tab.",
    category: "reference",
    kind: "Library",
    styles: ["Patterns", "UI"],
    tags: ["design"],
  },
];
