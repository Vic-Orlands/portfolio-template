import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readdir, readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { createInterface } from "node:readline";
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const snapshot = process.argv[2];
const output = process.argv[3];

if (!snapshot || !output) {
  throw new Error("Usage: node scripts/migrate-convex-storage-to-r2.mjs SNAPSHOT_DIR OUTPUT_DIR");
}

const credentials = process.env.R2_CREDENTIALS_FILE
  ? JSON.parse(await readFile(process.env.R2_CREDENTIALS_FILE, "utf8"))
  : process.env;
const bucket = credentials.R2_BUCKET;
const endpoint = credentials.R2_ENDPOINT;
const accessKeyId = credentials.R2_ACCESS_KEY_ID;
const secretAccessKey = credentials.R2_SECRET_ACCESS_KEY;

if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
  throw new Error("R2_BUCKET, R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY are required");
}

const client = new S3Client({
  region: "auto",
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
  maxAttempts: 5,
});

const mimeTypes = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
  ".webp": "image/webp",
};

const storageDir = join(snapshot, "_storage");
const files = (await readdir(storageDir)).filter(
  (file) => file !== "documents.jsonl",
);
const keyByStorageId = new Map(
  files.map((file) => [basename(file, extname(file)), `media/${file}`]),
);

async function upload(file) {
  const key = `media/${file}`;
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return `exists ${key}`;
  } catch (error) {
    if (error?.$metadata?.httpStatusCode !== 404) throw error;
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: await readFile(join(storageDir, file)),
      ContentType: mimeTypes[extname(file).toLowerCase()] ?? "application/octet-stream",
      CacheControl: "private, max-age=604800",
    }),
  );
  return `uploaded ${key}`;
}

for (let index = 0; index < files.length; index += 2) {
  const results = await Promise.all(files.slice(index, index + 2).map(upload));
  for (const result of results) process.stdout.write(`${result}\n`);
}

await mkdir(output, { recursive: true });

const mappings = {
  posts: ["coverStorageId", "coverKey"],
  series: ["coverStorageId", "coverKey"],
  projects: ["imageStorageId", "imageKey"],
  works: ["mediaStorageId", "mediaKey"],
  workMedia: ["storageId", "key"],
  inspirations: ["coverStorageId", "coverKey"],
};

for (const [table, [storageField, keyField]] of Object.entries(mappings)) {
  const source = join(snapshot, table, "documents.jsonl");
  try {
    await readFile(source, "utf8");
  } catch {
    continue;
  }
  const target = createWriteStream(join(output, `${table}.jsonl`));
  const lines = createInterface({ input: createReadStream(source) });
  for await (const line of lines) {
    if (!line.trim()) continue;
    const document = JSON.parse(line);
    const storageId = document[storageField];
    if (storageId) {
      const key = keyByStorageId.get(storageId);
      if (!key) throw new Error(`Missing file for ${table}.${storageId}`);
      document[keyField] = key;
    }
    target.write(`${JSON.stringify(document)}\n`);
  }
  target.end();
}

process.stdout.write(`Migrated ${files.length} objects and prepared table imports in ${output}\n`);
