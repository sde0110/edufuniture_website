import { clearSessionCookie, requireAdmin } from "@/lib/admin-auth";
import { json } from "@/lib/platform";

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  return json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie(request) } });
}
