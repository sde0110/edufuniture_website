import { clearLoginFailures, createSessionCookie, loginAllowed, passwordMatches, recordLoginFailure, sameOrigin } from "@/lib/admin-auth";
import { json } from "@/lib/platform";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "잘못된 요청입니다." }, { status: 403 });
  if (!await loginAllowed(request)) return json({ error: "로그인 시도가 많습니다. 15분 후 다시 시도해 주세요." }, { status: 429 });
  const body = await request.json() as { password?: string };
  if (!await passwordMatches(String(body.password ?? ""))) {
    await recordLoginFailure(request);
    return json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  await clearLoginFailures(request);
  return json({ ok: true }, { headers: { "Set-Cookie": await createSessionCookie(request) } });
}
