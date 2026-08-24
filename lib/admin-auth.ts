import { bindings, ensureSchema, json } from "./platform";

export const adminCookie = "edufurniture_admin";
const sessionHours = 8;

function secret(name: "ADMIN_PASSWORD" | "ADMIN_SESSION_SECRET") {
  const value = bindings()[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret("ADMIN_SESSION_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

export async function passwordMatches(value: string) {
  const [left, right] = await Promise.all([digest(value), digest(secret("ADMIN_PASSWORD"))]);
  let difference = left.length ^ right.length;
  for (let index = 0; index < Math.min(left.length, right.length); index++) difference |= left[index] ^ right[index];
  return difference === 0;
}

export async function createSessionCookie(request: Request) {
  const expires = Date.now() + sessionHours * 60 * 60 * 1000;
  const payload = String(expires);
  const token = `${payload}.${await hmac(payload)}`;
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${adminCookie}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${sessionHours * 3600}${secure}`;
}

export function clearSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${adminCookie}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export async function isAdmin(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const value = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${adminCookie}=`))?.slice(adminCookie.length + 1);
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) <= Date.now()) return false;
  return signature === await hmac(expires);
}

export async function requireAdmin(request: Request): Promise<Response | null> {
  if (!sameOrigin(request)) return json({ error: "잘못된 요청입니다." }, { status: 403 });
  if (!await isAdmin(request)) return json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  return null;
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

async function loginKey(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  return bytesToBase64Url(await digest(`edufurniture:${ip}`));
}

export async function loginAllowed(request: Request) {
  await ensureSchema();
  const key = await loginKey(request);
  const row = await bindings().DB.prepare("SELECT attempts, locked_until FROM admin_login_attempts WHERE key = ?").bind(key).first<{ attempts: number; locked_until: string | null }>();
  return !row?.locked_until || new Date(row.locked_until).getTime() <= Date.now();
}

export async function recordLoginFailure(request: Request) {
  await ensureSchema();
  const key = await loginKey(request);
  const current = await bindings().DB.prepare("SELECT attempts FROM admin_login_attempts WHERE key = ?").bind(key).first<{ attempts: number }>();
  const attempts = (current?.attempts ?? 0) + 1;
  const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
  await bindings().DB.prepare(`INSERT INTO admin_login_attempts (key, attempts, locked_until, updated_at)
    VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET attempts = excluded.attempts, locked_until = excluded.locked_until, updated_at = excluded.updated_at`)
    .bind(key, attempts >= 5 ? 0 : attempts, lockedUntil, new Date().toISOString()).run();
}

export async function clearLoginFailures(request: Request) {
  await ensureSchema();
  await bindings().DB.prepare("DELETE FROM admin_login_attempts WHERE key = ?").bind(await loginKey(request)).run();
}
