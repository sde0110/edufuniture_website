import { bindings, ensureSchema, json } from "@/lib/platform";

export async function GET() {
  try {
    await ensureSchema();
    const result = await bindings().DB.prepare(`SELECT id, product_key, filename, content_type, size, created_at
      FROM product_images ORDER BY product_key, created_at DESC`).all();
    return json({ images: result.results }, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch {
    return json({ images: [] });
  }
}
