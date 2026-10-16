export type ContentHeading = {
  id: string;
  label: string;
  level: number;
};

export function headingSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[`*_~\[\]()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
}

export function extractContentHeadings(content: string): ContentHeading[] {
  const seen = new Map<string, number>();

  return content
    .split("\n")
    .flatMap((line) => {
      const match = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line.trim());
      if (!match) return [];
      const label = match[2]?.replace(/[`*_~\[\]()]/g, "").trim();
      if (!label) return [];
      const base = headingSlug(label);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return [{ id: count ? `${base}-${count + 1}` : base, label, level: match[1]?.length ?? 2 }];
    });
}
