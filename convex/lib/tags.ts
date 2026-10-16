/** Normalize a tag for storage and lookup: lowercase, no leading #, hyphenated. */
export function normalizeTag(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeTags(tags: string[] | undefined): string[] {
  if (!tags?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const tag = normalizeTag(raw);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
  }
  return out;
}

export function docHasTag(
  doc: { tags?: string[] },
  tag: string,
): boolean {
  const normalized = normalizeTag(tag);
  return (doc.tags ?? []).some((t) => normalizeTag(t) === normalized);
}
