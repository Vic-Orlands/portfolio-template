import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const storageId = process.argv[2];
const sourceUrl = process.argv[3];

function convexRun(fn, args) {
  const argv = ["convex", "run", fn];
  if (args !== undefined) argv.push(JSON.stringify(args));
  const output = execFileSync("npx", argv, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  const trimmed = output.trim();
  const start = trimmed.indexOf("{");
  if (start < 0) throw new Error(`Unexpected convex run output for ${fn}: ${trimmed}`);
  return JSON.parse(trimmed.slice(start));
}

if (!storageId || !sourceUrl) {
  throw new Error(
    "Usage: node scripts/move-storage-to-r2.mjs STORAGE_ID SOURCE_URL",
  );
}

const download = await fetch(sourceUrl);
if (!download.ok) {
  throw new Error(`Could not download Convex file (${download.status})`);
}
const bytes = await download.arrayBuffer();
const contentType = download.headers.get("content-type") || "image/jpeg";
const suffix = contentType.includes("png")
  ? ".png"
  : contentType.includes("webp")
    ? ".webp"
    : contentType.includes("mp4")
      ? ".mp4"
      : ".jpg";

const { key, url } = convexRun("r2:generateInternalUploadUrl", {
  fileName: `migrated${suffix}`,
});

const upload = await fetch(url, {
  method: "PUT",
  headers: { "Content-Type": contentType },
  body: bytes,
});
if (!upload.ok) {
  throw new Error(`R2 upload failed (${upload.status}): ${await upload.text()}`);
}

const result = convexRun("seed:swapStorageIdForR2Key", { storageId, key });
console.log(JSON.stringify({ key, ...result }, null, 2));
