import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAdmin } from "@/lib/admin-auth";
import { json } from "@/lib/platform";
import { productKeys } from "@/lib/site";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    const body = await request.json() as HandleUploadBody;
    if (body.type === "blob.generate-client-token") {
      const denied = await requireAdmin(request);
      if (denied) return denied;
    }

    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        const [, productKey, id, filename] = pathname.split("/");
        if (!productKeys.has(productKey) || !/^[0-9a-f-]{36}$/i.test(id ?? "") || !filename || pathname.split("/").length !== 4) {
          throw new Error("잘못된 업로드 경로입니다.");
        }
        return {
          access: "private",
          allowedContentTypes: allowedTypes,
          maximumSizeInBytes: 8 * 1024 * 1024,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({ productKey, id }),
        };
      },
      onUploadCompleted: async () => {},
    });
    return json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "이미지 업로드를 준비하지 못했습니다.";
    return json({ error: message }, { status: 400 });
  }
}
