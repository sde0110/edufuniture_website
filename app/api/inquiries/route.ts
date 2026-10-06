import { inquiryPath, type Inquiry, writeInquiryUpdate, writeJson } from "@/lib/blob-storage";
import { json } from "@/lib/platform";
import { findProduct, productKeys, timelines } from "@/lib/site";

const limits = { name: 50, school: 100, phone: 30, email: 150, details: 2000 };

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (String(body.website ?? "")) return json({ ok: true }, { status: 201 });

    const name = String(body.name ?? "").trim();
    const school = String(body.school ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const details = String(body.details ?? "").trim();
    const products = Array.isArray(body.products) ? [...new Set(body.products.map(String))].filter((key) => productKeys.has(key)) : [];
    const timeline = timelines.includes(String(body.timeline ?? "")) ? String(body.timeline) : "";
    if (!name || !school || !phone || !details) return json({ error: "필수 정보를 모두 입력해 주세요." }, { status: 400 });
    if (body.consent !== true) return json({ error: "개인정보 수집·이용에 동의해 주세요." }, { status: 400 });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "이메일 주소를 확인해 주세요." }, { status: 400 });
    if (name.length > limits.name || school.length > limits.school || phone.length > limits.phone || email.length > limits.email || details.length > limits.details) {
      return json({ error: "입력 내용이 너무 깁니다." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const inquiry: Inquiry = { id, name, school, phone, email: email || undefined, products, timeline: timeline || undefined, details, status: "new", email_status: "pending", created_at: createdAt };
    const pathname = inquiryPath(inquiry);
    await writeJson(pathname, inquiry);

    let emailSent = false;
    try {
      const response = await fetch("https://formsubmit.co/ajax/bmgshin@naver.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          담당자명: name,
          "학교 / 기관명": school,
          연락처: phone,
          "문의자 이메일": email || "미입력",
          "관심 제품": products.map((key) => findProduct(key)?.name ?? key).join(", ") || "미선택",
          "납품 희망 시기": timeline || "미선택",
          "문의 내용": details,
          _subject: `[에듀퍼니처 견적문의] ${school || name}`,
          _template: "table",
          ...(email ? { _replyto: email } : {}),
        }),
      });
      const result = await response.json() as { success?: boolean };
      emailSent = response.ok && result.success !== false;
    } catch {
      emailSent = false;
    }
    await writeInquiryUpdate(id, { email_status: emailSent ? "sent" : "failed" });
    return json({ ok: true, id, emailSent }, { status: 201 });
  } catch {
    return json({ error: "문의 접수 중 오류가 발생했습니다." }, { status: 500 });
  }
}
