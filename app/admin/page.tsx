"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { upload as uploadBlob } from "@vercel/blob/client";

type Inquiry = {
  id: string; name: string; school: string; phone: string; details: string;
  status: "new" | "read" | "done"; email_status: string; created_at: string;
};
type ProductImage = { id: string; product_key: string; filename: string; size: number; created_at: string };

const productNames: Record<string, string> = {
  student: "학생용 책걸상",
  teacher: "교사용 가구",
  special: "특별교실 가구",
  custom: "맞춤 제작 가구",
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [tab, setTab] = useState<"inquiries" | "products">("inquiries");
  const [uploadTotal, setUploadTotal] = useState(0);

  const loadData = useCallback(async () => {
    const response = await fetch("/api/admin/data", { cache: "no-store" });
    if (response.status === 401) return setAuthenticated(false);
    const data = await response.json();
    setInquiries(data.inquiries ?? []);
    setImages(data.images ?? []);
    setAuthenticated(true);
  }, []);

  useEffect(() => { loadData().catch(() => setAuthenticated(false)); }, [loadData]);

  const login = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) return setError(data.error ?? "로그인하지 못했습니다.");
    setPassword(""); await loadData();
  };

  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); setAuthenticated(false); };

  const updateStatus = async (id: string, status: Inquiry["status"]) => {
    await fetch("/api/admin/data", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    setInquiries((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  };

  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const productKey = String(form.get("productKey") ?? "");
    const files = form.getAll("image").filter((item): item is File => item instanceof File && item.size > 0);
    if (!files.length) { setLoading(false); return setError("이미지를 선택해 주세요."); }
    if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024)) {
      setLoading(false); return setError("모든 이미지는 JPG, PNG, WebP 형식이며 각각 8MB 이하여야 합니다.");
    }
    setUploadTotal(files.length);
    try {
      const results = await Promise.allSettled(files.map(async (file) => {
        const bytes = new TextEncoder().encode(file.name.slice(0, 200));
        let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte);
        const encodedName = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
        return uploadBlob(`products/${productKey}/${crypto.randomUUID()}/${encodedName}`, file, {
          access: "private",
          contentType: file.type,
          handleUploadUrl: "/api/admin/upload",
          multipart: true,
        });
      }));
      await loadData();
      const failed = results.filter((result) => result.status === "rejected").length;
      if (failed) {
        const succeeded = results.length - failed;
        setError(`${succeeded}장은 업로드되었고 ${failed}장은 실패했습니다. 실패한 파일을 다시 시도해 주세요.`);
      } else {
        formElement.reset();
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "업로드하지 못했습니다.");
    } finally {
      setLoading(false);
      setUploadTotal(0);
    }
  };

  const removeImage = async (id: string) => {
    if (!window.confirm("이 이미지를 삭제할까요?")) return;
    const response = await fetch(`/api/admin/data?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setImages((items) => items.filter((item) => item.id !== id));
  };

  if (authenticated === null) return <main className="admin-loading">관리자 페이지를 불러오는 중입니다…</main>;

  if (!authenticated) return (
    <main className="admin-login">
      <a href="/" className="admin-logo"><img src="/assets/edufurniture-logo.png" alt="에듀퍼니처" /></a>
      <form onSubmit={login}>
        <p>ADMINISTRATOR</p><h1>관리자 로그인</h1><span>등록된 관리자 비밀번호를 입력해 주세요.</span>
        <label>비밀번호<input autoFocus type="password" inputMode="numeric" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <div className="admin-error" role="alert">{error}</div>}
        <button disabled={loading}>{loading ? "확인 중…" : "로그인"}</button>
        <a href="/">← 사이트로 돌아가기</a>
      </form>
    </main>
  );

  return (
    <main className="admin-shell">
      <header><a href="/"><img src="/assets/edufurniture-logo.png" alt="에듀퍼니처" /></a><div><strong>관리자</strong><button onClick={logout}>로그아웃</button></div></header>
      <div className="admin-body">
        <aside><p>MANAGEMENT</p><button className={tab === "inquiries" ? "active" : ""} onClick={() => setTab("inquiries")}>견적 문의 <b>{inquiries.filter((item) => item.status === "new").length}</b></button><button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>제품 이미지 <b>{images.length}</b></button><a href="/">사이트 보기 ↗</a></aside>
        <section className="admin-content">
          {tab === "inquiries" ? <>
            <div className="admin-title"><div><p>INQUIRIES</p><h1>견적 문의 관리</h1></div><span>총 {inquiries.length}건</span></div>
            <div className="inquiry-list">
              {inquiries.length === 0 && <div className="admin-empty">아직 접수된 문의가 없습니다.</div>}
              {inquiries.map((item) => <article key={item.id} className={item.status === "new" ? "new" : ""}>
                <div className="inquiry-head"><span>{item.status === "new" ? "새 문의" : item.status === "done" ? "처리 완료" : "확인함"}</span><time>{new Date(item.created_at).toLocaleString("ko-KR")}</time></div>
                <h2>{item.school}</h2><dl><div><dt>담당자</dt><dd>{item.name}</dd></div><div><dt>연락처</dt><dd><a href={`tel:${item.phone}`}>{item.phone}</a></dd></div><div><dt>메일</dt><dd>{item.email_status === "sent" ? "전송됨" : "관리자 페이지에 저장됨"}</dd></div></dl>
                <p>{item.details}</p><div className="inquiry-actions"><button onClick={() => updateStatus(item.id, "read")}>확인함</button><button onClick={() => updateStatus(item.id, "done")}>처리 완료</button></div>
              </article>)}
            </div>
          </> : <>
            <div className="admin-title"><div><p>PRODUCT IMAGES</p><h1>제품 이미지 관리</h1></div><span>여러 장 선택 가능 · 각 파일 최대 8MB</span></div>
            <form className="upload-form" onSubmit={upload}><label>제품 분류<select name="productKey" required>{Object.entries(productNames).map(([key, name]) => <option value={key} key={key}>{name}</option>)}</select></label><label>이미지 선택<input type="file" name="image" accept="image/jpeg,image/png,image/webp" multiple required /></label><button disabled={loading}>{loading ? `${uploadTotal}장 업로드 중…` : "이미지 업로드"}</button></form>
            {error && <div className="admin-error" role="alert">{error}</div>}
            <div className="admin-product-groups">{Object.entries(productNames).map(([key, name]) => <section key={key}><h2>{name}<span>{images.filter((item) => item.product_key === key).length}장</span></h2><div>{images.filter((item) => item.product_key === key).map((image) => <figure key={image.id}><img src={`/api/product-images/${image.id}`} alt={image.filename} /><figcaption><span>{image.filename}</span><button onClick={() => removeImage(image.id)}>삭제</button></figcaption></figure>)}{!images.some((item) => item.product_key === key) && <p>등록된 이미지가 없습니다.</p>}</div></section>)}</div>
          </>}
        </section>
      </div>
    </main>
  );
}
