import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const demos = [
  ["drag-to-delete", "Drag to delete", "A swipe-to-delete row with a clear destructive threshold and a keyboard fallback."],
  ["dock-floating-tooltip", "Dock with floating tooltip", "A springy application dock whose tooltip keeps a deliberate gap above the scaled icon."],
  ["container-expand-stagger", "Container expand with staggered children", "A compact action menu that expands its container before revealing children in sequence."],
  ["shared-layout-list-detail", "Shared layout: list to detail", "A list item that preserves visual identity as it expands into a focused detail card."],
  ["sliding-tab-indicator", "Sliding tab indicator", "A shared indicator that glides between tabs with a restrained spring."],
  ["status-color-morph", "Status swap with color morph", "A status badge whose icon, label, width, and color transition as one stateful surface."],
  ["optimistic-reorder-flip", "Optimistic reorder (FLIP)", "A responsive task reorder using layout animation to preserve spatial continuity."],
  ["keyboard-shortcut-feedback", "Keyboard shortcut micro-feedback", "A tactile keycap response for Cmd+K and Ctrl+K without requiring a pointer click."],
  ["panel-slide-crossfade", "Panel slide + cross-fade", "A settings panel that slides in while the underlying workspace recedes and cross-fades."],
  ["magnetic-button", "Magnetic button", "A button that subtly follows the pointer and returns with spring tension."],
  ["number-ticker", "Number ticker", "An odometer-style counter where changed digits roll cleanly into place."],
];

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const password = process.env.ADMIN_PASSWORD;
if (!convexUrl || !password) throw new Error("Missing Convex URL or admin password");

const client = new ConvexHttpClient(convexUrl);
const { sessionToken } = await client.mutation(api.auth.login, { password });
const existing = await client.query(api.works.listAll, { sessionToken, now: Date.now() });
const existingSlugs = new Set(existing.map((work) => work.slug));
let created = 0;

for (const [slug, title, description] of demos) {
  if (existingSlugs.has(slug)) continue;
  await client.mutation(api.works.create, {
    sessionToken,
    slug,
    title,
    category: "Card",
    description,
    date: "Aug 2026",
    content: description,
    technologies: ["Motion", "React", "TypeScript"],
    status: "published",
    tags: ["interaction", "motion", "component"],
  });
  created += 1;
}

const previewDirectory = process.env.SCRIBBLE_PREVIEW_DIRECTORY;
const replacePreviews = process.env.SCRIBBLE_REPLACE_PREVIEWS === "1";
if (previewDirectory) {
  const works = await client.query(api.works.listAll, { sessionToken, now: Date.now() });
  for (const [slug] of demos) {
    const work = works.find((item) => item.slug === slug);
    if (!work || (work.mediaUrl && !replacePreviews)) continue;
    const bytes = await readFile(join(previewDirectory, `${slug}.png`));
    const { key, url } = await client.mutation(api.r2.generateUploadUrl, {
      sessionToken,
      fileName: `${slug}.png`,
    });
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "image/png" },
      body: bytes,
    });
    if (!response.ok) throw new Error(`Could not upload ${slug}`);
    await client.mutation(api.works.update, {
      sessionToken,
      workId: work._id,
      slug: work.slug,
      title: work.title,
      category: work.category,
      description: work.description,
      date: work.date,
      content: work.content,
      technologies: work.technologies,
      link: work.link,
      status: work.status,
      tags: work.tags,
      mediaKey: key,
      mediaStorageId: null,
      mediaType: "image",
    });
  }
}

await client.mutation(api.auth.logout, { sessionToken });
console.log(`Created ${created} interaction scribbles; ${demos.length - created} already existed.`);
