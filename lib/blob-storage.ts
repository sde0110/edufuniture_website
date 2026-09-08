import { del, get, list, put } from "@vercel/blob";

export type Inquiry = {
  id: string;
  name: string;
  school: string;
  phone: string;
  details: string;
  status: "new" | "read" | "done";
  email_status: "pending" | "sent" | "failed";
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_key: string;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
  pathname: string;
  url: string;
};

const access = "private" as const;

export async function readJson<T>(pathname: string): Promise<T | null> {
  const result = await get(pathname, { access });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  return JSON.parse(await new Response(result.stream).text()) as T;
}

export async function writeJson(pathname: string, value: unknown, overwrite = false) {
  return put(pathname, JSON.stringify(value), {
    access,
    contentType: "application/json; charset=utf-8",
    addRandomSuffix: false,
    allowOverwrite: overwrite,
    cacheControlMaxAge: 60,
  });
}

export async function listAll(prefix: string) {
  const blobs: Awaited<ReturnType<typeof list>>["blobs"] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

export async function listInquiries() {
  const blobs = await listAll("inquiries/");
  const records = await Promise.all(blobs.map((blob) => readJson<Inquiry>(blob.pathname)));
  return records.filter((item): item is Inquiry => Boolean(item)).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function findInquiryBlob(id: string) {
  const blobs = await listAll("inquiries/");
  return blobs.find((blob) => blob.pathname.endsWith(`-${id}.json`)) ?? null;
}

export function inquiryPath(inquiry: Inquiry) {
  return `inquiries/${Date.parse(inquiry.created_at)}-${inquiry.id}.json`;
}

function decodeFilename(value: string) {
  try {
    return Buffer.from(value, "base64url").toString("utf8");
  } catch {
    return "product-image";
  }
}

export async function listProductImages(): Promise<ProductImage[]> {
  const blobs = await listAll("products/");
  return blobs.flatMap((blob) => {
    const [, productKey, id, encodedFilename] = blob.pathname.split("/");
    if (!productKey || !id || !encodedFilename) return [];
    return [{
      id,
      product_key: productKey,
      filename: decodeFilename(encodedFilename),
      content_type: "image/*",
      size: blob.size,
      created_at: blob.uploadedAt.toISOString(),
      pathname: blob.pathname,
      url: blob.url,
    }];
  }).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function findProductImage(id: string) {
  const images = await listProductImages();
  return images.find((image) => image.id === id) ?? null;
}

export async function deleteBlob(urlOrPathname: string) {
  await del(urlOrPathname);
}
