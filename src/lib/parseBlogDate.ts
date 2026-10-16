const MONTHS: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

export function parseBlogDate(dateStr: string): { year: string; mmdd: string } {
  const trimmed = dateStr.trim();

  // ISO: 2026-07-18
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) {
    return { year: iso[1]!, mmdd: `${iso[2]}/${iso[3]}` };
  }

  // "July 18, 2026" | "Jul 18, 2026" | "Jul 2026"
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    const monthKey = (parts[0] ?? "").toLowerCase().replace(/\.$/, "");
    const mm = MONTHS[monthKey];
    if (!mm) {
      return { year: "2026", mmdd: "01/01" };
    }

    if (parts.length === 2) {
      // "Jul 2026"
      const yearStr = parts[1] ?? "2026";
      return { year: yearStr, mmdd: `${mm}/01` };
    }

    const dayStr = (parts[1] ?? "01").replace(",", "");
    const yearStr = (parts[2] ?? "2026").replace(",", "");
    const dd = dayStr.padStart(2, "0");
    return {
      year: yearStr,
      mmdd: `${mm}/${dd}`,
    };
  }

  return { year: "2026", mmdd: "01/01" };
}
