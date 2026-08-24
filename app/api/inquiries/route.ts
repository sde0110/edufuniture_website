import { bindings, ensureSchema, json } from "@/lib/platform";

const limits = { name: 50, school: 100, phone: 30, details: 2000 };

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (String(body.website ?? "")) return json({ ok: true }, { status: 201 });

    const name = String(body.name ?? "").trim();
    const school = String(body.school ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const details = String(body.details ?? "").trim();
    if (!name || !school || !phone || !details) return json({ error: "필수 정보를 모두 입력해 주세요." }, { status: 400 });
    if (name.length > limits.name || school.length > limits.school || phone.length > limits.phone || details.length > limits.details) {
      return json({ error: "입력 내용이 너무 깁니다." }, { status: 400 });
    }

    await ensureSchema();
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await bindings().DB.prepare(`INSERT INTO inquiries (id, name, school, phone, details, status, email_status, created_at)
      VALUES (?, ?, ?, ?, ?, 'new', 'pending', ?)`)
      .bind(id, name, school, phone, details, createdAt).run();

    let emailSent = false;
    try {
      const response = await fetch("https://formsubmit.co/ajax/bmgshin@naver.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          담당자명: name,
          "학교 / 기관명": school,
          연락처: phone,
          "문의 내용": details,
          _subject: `[에듀퍼니처 견적문의] ${school || name}`,
          _template: "table",
        }),
      });
      const result = await response.json() as { success?: boolean };
      emailSent = response.ok && result.success !== false;
    } catch {
      emailSent = false;
    }
    await bindings().DB.prepare("UPDATE inquiries SET email_status = ? WHERE id = ?").bind(emailSent ? "sent" : "failed", id).run();
    return json({ ok: true, id, emailSent }, { status: 201 });
  } catch {
    return json({ error: "문의 접수 중 오류가 발생했습니다." }, { status: 500 });
  }
}
