"use client";

import { FormEvent, useEffect, useState } from "react";
import { company, productKeys, products, timelines } from "@/lib/site";

type QuoteDraft = {
  products: string[];
  name: string;
  school: string;
  phone: string;
  email: string;
  timeline: string;
  details: string;
};

const emptyQuote: QuoteDraft = { products: [], name: "", school: "", phone: "", email: "", timeline: "", details: "" };
const quoteDraftKey = "edufurniture-quote-draft";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.startsWith("02")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function QuoteForm() {
  const [quote, setQuote] = useState<QuoteDraft>(emptyQuote);
  const [consent, setConsent] = useState(false);
  const [ready, setReady] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let draft = emptyQuote;
    try {
      const saved = window.sessionStorage.getItem(quoteDraftKey);
      if (saved) draft = { ...emptyQuote, ...JSON.parse(saved) };
    } catch {
      // Ignore unreadable drafts; the form still works without them.
    }
    const requested = new URLSearchParams(window.location.search).get("product");
    if (requested && productKeys.has(requested) && !draft.products.includes(requested)) {
      draft = { ...draft, products: [...draft.products, requested] };
    }
    // Restoring browser-only state after hydration is the intended use here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuote(draft);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || submitState === "success") return;
    try {
      const hasDraft = quote.products.length > 0 || [quote.name, quote.school, quote.phone, quote.email, quote.timeline, quote.details].some((value) => value.trim());
      if (hasDraft) window.sessionStorage.setItem(quoteDraftKey, JSON.stringify(quote));
      else window.sessionStorage.removeItem(quoteDraftKey);
    } catch {
      // Storage can be unavailable in private browsing.
    }
  }, [quote, ready, submitState]);

  const update = <K extends keyof QuoteDraft>(field: K, value: QuoteDraft[K]) => {
    setQuote((current) => ({ ...current, [field]: value }));
    if (submitState === "error") setSubmitState("idle");
  };

  const toggleProduct = (key: string) => {
    update("products", quote.products.includes(key) ? quote.products.filter((item) => item !== key) : [...quote.products, key]);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitState("sending");
    setErrorMessage("");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...quote, consent, website: String(data.get("website") || "") }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error ?? "");
      try { window.sessionStorage.removeItem(quoteDraftKey); } catch {}
      setSubmitState("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "");
      setSubmitState("error");
    }
  };

  const reset = () => {
    setQuote(emptyQuote);
    setConsent(false);
    setSubmitState("idle");
  };

  if (submitState === "success") {
    return (
      <div className="quote-card quote-success" role="status">
        <span className="quote-success-icon" aria-hidden="true">✓</span>
        <h3>견적 문의가 접수되었습니다</h3>
        <p><strong>{quote.school}</strong> {quote.name}님, 문의 감사합니다.<br />내용을 확인한 뒤 <strong>{quote.phone}</strong>로 빠르게 연락드리겠습니다.</p>
        <p className="quote-success-sub">급한 일정이라면 지금 바로 전화 주셔도 좋습니다.</p>
        <div className="quote-success-actions">
          <a className="btn btn-primary" href={company.phoneHref}>{company.phone} 전화하기</a>
          <button className="btn btn-ghost" onClick={reset}>새 문의 작성</button>
        </div>
      </div>
    );
  }

  return (
    <form className="quote-card quote-form" onSubmit={submit}>
      <fieldset className="field-products">
        <legend>관심 제품 <small>(복수 선택)</small></legend>
        <div className="product-chips">
          {products.map((product) => (
            <label key={product.key} className={quote.products.includes(product.key) ? "checked" : ""}>
              <input type="checkbox" checked={quote.products.includes(product.key)} onChange={() => toggleProduct(product.key)} />
              {product.name}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>담당자명 <b aria-hidden="true">*</b></span>
        <input name="name" required autoComplete="name" maxLength={50} value={quote.name} onChange={(event) => update("name", event.target.value)} placeholder="홍길동" />
      </label>
      <label className="field">
        <span>학교 / 기관명 <b aria-hidden="true">*</b></span>
        <input name="school" required autoComplete="organization" maxLength={100} value={quote.school} onChange={(event) => update("school", event.target.value)} placeholder="○○초등학교" />
      </label>
      <label className="field">
        <span>연락처 <b aria-hidden="true">*</b></span>
        <input name="phone" type="tel" inputMode="numeric" required autoComplete="tel" value={quote.phone} onChange={(event) => update("phone", formatPhone(event.target.value))} placeholder="010-0000-0000" pattern="[0-9\-]{9,13}" title="숫자만 입력하시면 자동으로 형식이 맞춰집니다." />
      </label>
      <label className="field">
        <span>이메일 <small>(선택)</small></span>
        <input name="email" type="email" autoComplete="email" maxLength={150} value={quote.email} onChange={(event) => update("email", event.target.value)} placeholder="견적서를 메일로 받으실 경우" />
      </label>
      <label className="field field-full">
        <span>납품 희망 시기 <small>(선택)</small></span>
        <select name="timeline" value={quote.timeline} onChange={(event) => update("timeline", event.target.value)}>
          <option value="">선택해 주세요</option>
          {timelines.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="field field-full">
        <span>문의 내용 <b aria-hidden="true">*</b></span>
        <textarea name="details" required maxLength={2000} value={quote.details} onChange={(event) => update("details", event.target.value)} placeholder={"예) 3학년 교실 4개, 학생용 책걸상 120조\n교체 시기는 겨울방학 중 희망합니다."} />
        <small className="field-count">{quote.details.length} / 2000</small>
      </label>
      <label className="honey-field" aria-hidden="true">웹사이트<input name="website" tabIndex={-1} autoComplete="off" /></label>

      <label className="consent">
        <input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        <span>
          <strong>개인정보 수집·이용에 동의합니다. <b aria-hidden="true">*</b></strong>
          <small>수집 항목: 담당자명, 학교/기관명, 연락처, 이메일 · 목적: 견적 상담 및 회신 · 보관: 상담 완료 후 1년. 문의 내용은 메일 전송 서비스(FormSubmit)를 통해 담당자에게 전달됩니다.</small>
        </span>
      </label>

      {submitState === "error" && (
        <div className="form-status error" role="alert">
          {errorMessage || "전송하지 못했습니다."} 잠시 후 다시 시도하시거나 <a href={company.phoneHref}>{company.phone}</a>로 연락해 주세요.
        </div>
      )}
      <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={submitState === "sending"}>
        {submitState === "sending" ? "전송 중입니다…" : "견적 문의 보내기"}
      </button>
      <p className="form-footnote">작성 중인 내용은 이 탭에 임시 저장되어, 페이지를 이동해도 사라지지 않습니다.</p>
    </form>
  );
}
