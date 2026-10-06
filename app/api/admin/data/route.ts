import { requireAdmin } from "@/lib/admin-auth";
import { deleteBlob, findProductImage, findProductPostBlob, listInquiries, listProductImages, listProductPosts, productPostPath, readJson, type ProductPost, writeInquiryUpdate, writeJson } from "@/lib/blob-storage";
import { revalidatePath } from "next/cache";
import { json } from "@/lib/platform";
import { productKeys } from "@/lib/site";

function refreshPublicPages(productKey?: string) {
  revalidatePath("/");
  if (productKey) revalidatePath(`/products/${productKey}`);
  else revalidatePath("/products/[key]", "page");
}

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const [inquiries, images, posts] = await Promise.all([listInquiries(), listProductImages(), listProductPosts()]);
  return json({ inquiries, posts, images: images.map(({ pathname: _pathname, url: _url, ...image }) => image) });
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const body = await request.json() as { productKey?: string; title?: string; content?: string; imageIds?: string[] };
  const productKey = String(body.productKey ?? "");
  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? "").trim();
  const imageIds = Array.isArray(body.imageIds) ? [...new Set(body.imageIds.map(String))] : [];
  if (!productKeys.has(productKey) || !title) return json({ error: "제품 분야와 제목을 입력해 주세요." }, { status: 400 });
  if (title.length > 150 || content.length > 5000 || imageIds.length > 50) return json({ error: "게시글 내용이 너무 깁니다." }, { status: 400 });
  const images = await listProductImages();
  if (imageIds.some((id) => !images.some((image) => image.id === id && image.product_key === productKey))) {
    return json({ error: "게시글 이미지 정보를 확인할 수 없습니다." }, { status: 400 });
  }
  const post: ProductPost = {
    id: crypto.randomUUID(), product_key: productKey, title, content,
    image_ids: imageIds, created_at: new Date().toISOString(),
  };
  await writeJson(productPostPath(post), post);
  refreshPublicPages(productKey);
  return json({ ok: true, post }, { status: 201 });
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const body = await request.json() as { id?: string; status?: string };
  if (!body.id || !["new", "read", "done"].includes(String(body.status))) return json({ error: "잘못된 상태입니다." }, { status: 400 });
  const inquiry = (await listInquiries()).find((item) => item.id === body.id);
  if (!inquiry) return json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });
  await writeInquiryUpdate(body.id, { status: body.status as "new" | "read" | "done" });
  return json({ ok: true });
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id");
  const postId = new URL(request.url).searchParams.get("postId");
  if (postId) {
    const blob = await findProductPostBlob(postId);
    if (!blob) return json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    const post = await readJson<ProductPost>(blob.pathname);
    if (post) {
      const images = await listProductImages();
      await Promise.all(post.image_ids.map(async (imageId) => {
        const image = images.find((item) => item.id === imageId);
        if (image) await deleteBlob(image.url);
      }));
    }
    await deleteBlob(blob.url);
    refreshPublicPages(post?.product_key);
    return json({ ok: true });
  }
  if (!id) return json({ error: "이미지 또는 게시글을 선택해 주세요." }, { status: 400 });
  const image = await findProductImage(id);
  if (image) await deleteBlob(image.url);
  refreshPublicPages(image?.product_key);
  return json({ ok: true });
}
