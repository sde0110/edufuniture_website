import { env } from "cloudflare:workers";

export type Bindings = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
};

let schemaReady: Promise<void> | null = null;

export function bindings(): Bindings {
  return env as unknown as Bindings;
}

export function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    const { DB } = bindings();
    if (!DB) throw new Error("D1 binding DB is unavailable");
    await DB.batch([
      DB.prepare(`CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        school TEXT NOT NULL,
        phone TEXT NOT NULL,
        details TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        email_status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL
      )`),
      DB.prepare(`CREATE TABLE IF NOT EXISTS product_images (
        id TEXT PRIMARY KEY,
        product_key TEXT NOT NULL,
        object_key TEXT NOT NULL,
        filename TEXT NOT NULL,
        content_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        created_at TEXT NOT NULL
      )`),
      DB.prepare(`CREATE TABLE IF NOT EXISTS admin_login_attempts (
        key TEXT PRIMARY KEY,
        attempts INTEGER NOT NULL DEFAULT 0,
        locked_until TEXT,
        updated_at TEXT NOT NULL
      )`),
      DB.prepare("CREATE INDEX IF NOT EXISTS inquiries_created_idx ON inquiries(created_at DESC)"),
      DB.prepare("CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images(product_key, created_at DESC)"),
    ]);
  })().catch((error) => {
    schemaReady = null;
    throw error;
  });
  return schemaReady;
}

export function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}
