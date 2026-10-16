/** True when a project has a real destination (not blank / placeholder). */
export function hasProjectLink(link: string | null | undefined) {
  const trimmed = link?.trim() ?? "";
  if (!trimmed) return false;
  // Admin default / unfinished: "https://" or "http://"
  if (/^https?:\/\/\/?$/i.test(trimmed)) return false;
  return true;
}
