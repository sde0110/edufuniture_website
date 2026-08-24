import { isAdmin } from "@/lib/admin-auth";
import { json } from "@/lib/platform";

export async function GET(request: Request) {
  return json({ authenticated: await isAdmin(request) }, { status: await isAdmin(request) ? 200 : 401 });
}
