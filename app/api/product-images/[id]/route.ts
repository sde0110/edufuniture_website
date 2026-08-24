import { bindings, ensureSchema, json } from "@/lib/platform";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const { id } = await context.params;
  const row = await bindings().DB.prepare("SELECT object_key, content_type, filename FROM product_images WHERE id = ?")
    .bind(id).first<{ object_key: string; content_type: string; filename: string }>();
  if (!row) return json({ error: "이미지를 찾을 수 없습니다." }, { status: 404 });
  const object = await bindings().UPLOADS.get(row.object_key);
  if (!object) return json({ error: "이미지를 찾을 수 없습니다." }, { status: 404 });
  return new Response(object.body, {
    headers: {
      "Content-Type": row.content_type,
      "Cache-Control": "public, max-age=86400",
      ETag: object.httpEtag,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(row.filename)}`,
    },
  });
}
