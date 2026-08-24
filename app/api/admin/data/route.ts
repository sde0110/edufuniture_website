import { requireAdmin } from "@/lib/admin-auth";
import { bindings, ensureSchema, json } from "@/lib/platform";

const productKeys = new Set(["student", "teacher", "special", "custom"]);
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  await ensureSchema();
  const [inquiries, images] = await Promise.all([
    bindings().DB.prepare("SELECT * FROM inquiries ORDER BY created_at DESC").all(),
    bindings().DB.prepare("SELECT id, product_key, filename, content_type, size, created_at FROM product_images ORDER BY created_at DESC").all(),
  ]);
  return json({ inquiries: inquiries.results, images: images.results });
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const body = await request.json() as { id?: string; status?: string };
  if (!body.id || !["new", "read", "done"].includes(String(body.status))) return json({ error: "잘못된 상태입니다." }, { status: 400 });
  await ensureSchema();
  await bindings().DB.prepare("UPDATE inquiries SET status = ? WHERE id = ?").bind(body.status, body.id).run();
  return json({ ok: true });
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const form = await request.formData();
  const productKey = String(form.get("productKey") ?? "");
  const file = form.get("image");
  if (!productKeys.has(productKey) || !(file instanceof File)) return json({ error: "제품과 이미지를 선택해 주세요." }, { status: 400 });
  if (!allowedTypes.has(file.type) || file.size > 8 * 1024 * 1024) return json({ error: "JPG, PNG, WebP 파일만 8MB 이하로 올릴 수 있습니다." }, { status: 400 });
  await ensureSchema();
  const id = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "image";
  const objectKey = `products/${productKey}/${id}-${safeName}`;
  await bindings().UPLOADS.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type } });
  await bindings().DB.prepare(`INSERT INTO product_images (id, product_key, object_key, filename, content_type, size, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, productKey, objectKey, file.name.slice(0, 200), file.type, file.size, new Date().toISOString()).run();
  return json({ ok: true, id }, { status: 201 });
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "이미지를 선택해 주세요." }, { status: 400 });
  await ensureSchema();
  const row = await bindings().DB.prepare("SELECT object_key FROM product_images WHERE id = ?").bind(id).first<{ object_key: string }>();
  if (row) await bindings().UPLOADS.delete(row.object_key);
  await bindings().DB.prepare("DELETE FROM product_images WHERE id = ?").bind(id).run();
  return json({ ok: true });
}
