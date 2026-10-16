const bucket = process.env.R2_BUCKET;
const endpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

function config() {
  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 is not configured");
  }
  return { bucket, endpoint, accessKeyId, secretAccessKey };
}

function bytes(value: string) {
  return new TextEncoder().encode(value);
}

function hex(value: ArrayBuffer) {
  return Array.from(new Uint8Array(value), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function sha256(value: string) {
  return hex(await crypto.subtle.digest("SHA-256", bytes(value)));
}

async function hmac(key: ArrayBuffer | Uint8Array, value: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return await crypto.subtle.sign("HMAC", cryptoKey, bytes(value));
}

function encode(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function timestamp(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

async function signedUrl(
  method: "GET" | "PUT" | "DELETE",
  key: string,
  expiresIn: number,
  now = new Date(),
) {
  const values = config();
  const url = new URL(values.endpoint);
  const amzDate = timestamp(now);
  const date = amzDate.slice(0, 8);
  const scope = `${date}/auto/s3/aws4_request`;
  const credential = `${values.accessKeyId}/${scope}`;
  const canonicalUri = `/${encode(values.bucket)}/${key
    .split("/")
    .map(encode)
    .join("/")}`;
  const params: Array<[string, string]> = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Content-Sha256", "UNSIGNED-PAYLOAD"],
    ["X-Amz-Credential", credential],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", String(expiresIn)],
    ["X-Amz-SignedHeaders", "host"],
  ];
  const canonicalQuery = params
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${encode(name)}=${encode(value)}`)
    .join("&");
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    `host:${url.host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    await sha256(canonicalRequest),
  ].join("\n");
  const dateKey = await hmac(bytes(`AWS4${values.secretAccessKey}`), date);
  const regionKey = await hmac(dateKey, "auto");
  const serviceKey = await hmac(regionKey, "s3");
  const signingKey = await hmac(serviceKey, "aws4_request");
  const signature = hex(await hmac(signingKey, stringToSign));
  return `${url.origin}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

export async function deleteR2Object(key: string) {
  const response = await fetch(await signedUrl("DELETE", key, 60), {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Unable to delete R2 object (${response.status})`);
  }
}

export async function getR2Url(key: string) {
  const hour = 60 * 60 * 1000;
  const now = new Date(Math.floor(Date.now() / hour) * hour);
  return await signedUrl("GET", key, 60 * 60 * 24 * 7, now);
}

export async function getR2UploadUrl(key: string) {
  return await signedUrl("PUT", key, 900);
}
