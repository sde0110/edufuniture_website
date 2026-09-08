import { get } from "@vercel/blob";
import { findProductImage } from "@/lib/blob-storage";
import { json } from "@/lib/platform";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const image = await findProductImage(id);
  if (!image) return json({ error: "이미지를 찾을 수 없습니다." }, { status: 404 });
  const result = await get(image.pathname, { access: "private", ifNoneMatch: request.headers.get("if-none-match") ?? undefined });
  if (!result) return json({ error: "이미지를 찾을 수 없습니다." }, { status: 404 });
  if (result.statusCode === 304) return new Response(null, { status: 304, headers: { ETag: result.blob.etag, "Cache-Control": "public, max-age=86400" } });
  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=86400",
      ETag: result.blob.etag,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(image.filename)}`,
    },
  });
}
