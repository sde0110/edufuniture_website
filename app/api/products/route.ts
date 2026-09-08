import { listProductImages } from "@/lib/blob-storage";
import { json } from "@/lib/platform";

export async function GET() {
  try {
    const images = await listProductImages();
    return json({ images: images.map(({ pathname: _pathname, url: _url, ...image }) => image) }, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch {
    return json({ images: [] });
  }
}
