import { requireAdmin } from "@/lib/admin-auth";
import { deleteBlob, findInquiryBlob, findProductImage, listInquiries, listProductImages, readJson, type Inquiry, writeJson } from "@/lib/blob-storage";
import { json } from "@/lib/platform";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const [inquiries, images] = await Promise.all([listInquiries(), listProductImages()]);
  return json({ inquiries, images: images.map(({ pathname: _pathname, url: _url, ...image }) => image) });
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const body = await request.json() as { id?: string; status?: string };
  if (!body.id || !["new", "read", "done"].includes(String(body.status))) return json({ error: "잘못된 상태입니다." }, { status: 400 });
  const blob = await findInquiryBlob(body.id);
  if (!blob) return json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });
  const inquiry = await readJson<Inquiry>(blob.pathname);
  if (!inquiry) return json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });
  inquiry.status = body.status as Inquiry["status"];
  await writeJson(blob.pathname, inquiry, true);
  return json({ ok: true });
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "이미지를 선택해 주세요." }, { status: 400 });
  const image = await findProductImage(id);
  if (image) await deleteBlob(image.url);
  return json({ ok: true });
}
