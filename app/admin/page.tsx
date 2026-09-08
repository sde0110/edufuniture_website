"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { upload as uploadBlob } from "@vercel/blob/client";

type Inquiry = {
  id: string; name: string; school: string; phone: string; email?: string; details: string;
  status: "new" | "read" | "done"; email_status: string; created_at: string;
};
type ProductImage = { id: string; product_key: string; filename: string; size: number; created_at: string };
type ProductPost = { id: string; product_key: string; title: string; content: string; image_ids: string[]; created_at: string };

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
  const [posts, setPosts] = useState<ProductPost[]>([]);
  const [tab, setTab] = useState<"inquiries" | "products">("inquiries");
  const [uploadTotal, setUploadTotal] = useState(0);
  const [inquiryFilter, setInquiryFilter] = useState<"all" | Inquiry["status"]>("all");
  const [inquiryQuery, setInquiryQuery] = useState("");
  const [updatingInquiry, setUpdatingInquiry] = useState<string | null>(null);
  const [inquiryError, setInquiryError] = useState("");

  const loadData = useCallback(async () => {
    const response = await fetch("/api/admin/data", { cache: "no-store" });
    if (response.status === 401) return setAuthenticated(false);
    const data = await response.json();
    setInquiries(data.inquiries ?? []);
    setImages(data.images ?? []);
    setPosts(data.posts ?? []);
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
    setUpdatingInquiry(id); setInquiryError("");
    try {
      const response = await fetch("/api/admin/data", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "문의 상태를 변경하지 못했습니다.");
      setInquiries((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    } catch (statusError) {
      setInquiryError(statusError instanceof Error ? statusError.message : "문의 상태를 변경하지 못했습니다.");
    } finally {
      setUpdatingInquiry(null);
    }
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
      const uploads = files.map(async (file) => {
        const bytes = new TextEncoder().encode(file.name.slice(0, 200));
        let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte);
        const encodedName = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
        const id = crypto.randomUUID();
        await uploadBlob(`products/${productKey}/${id}/${encodedName}`, file, {
          access: "private",
          contentType: file.type,
          handleUploadUrl: "/api/admin/upload",
          multipart: true,
        });
        return id;
      });
      const results = await Promise.allSettled(uploads);
      const imageIds = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
      if (imageIds.length) {
        const response = await fetch("/api/admin/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productKey, title: String(form.get("title") ?? ""), content: String(form.get("content") ?? ""), imageIds }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "게시글을 등록하지 못했습니다.");
      }
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

  const removePost = async (id: string) => {
    if (!window.confirm("이 게시글과 포함된 이미지를 모두 삭제할까요?")) return;
    const response = await fetch(`/api/admin/data?postId=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) await loadData();
  };

  const removeImage = async (id: string) => {
    if (!window.confirm("이 이미지를 삭제할까요?")) return;
    const response = await fetch(`/api/admin/data?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setImages((items) => items.filter((item) => item.id !== id));
  };

  const normalizedQuery = inquiryQuery.trim().toLowerCase();
  const visibleInquiries = inquiries.filter((item) => {
    if (inquiryFilter !== "all" && item.status !== inquiryFilter) return false;
    if (!normalizedQuery) return true;
    return [item.name, item.school, item.phone, item.email ?? "", item.details].some((value) => value.toLowerCase().includes(normalizedQuery));
  });

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
        <aside><p>MANAGEMENT</p><button className={tab === "inquiries" ? "active" : ""} onClick={() => setTab("inquiries")}>견적 문의 <b>{inquiries.filter((item) => item.status === "new").length}</b></button><button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>제품 게시글 <b>{posts.length}</b></button><a href="/">사이트 보기 ↗</a></aside>
        <section className="admin-content">
          {tab === "inquiries" ? <>
            <div className="admin-title"><div><p>INQUIRIES</p><h1>견적 문의 관리</h1></div><span>총 {inquiries.length}건</span></div>
            <div className="inquiry-tools"><div className="inquiry-filters"><button className={inquiryFilter === "all" ? "active" : ""} onClick={() => setInquiryFilter("all")}>전체 {inquiries.length}</button><button className={inquiryFilter === "new" ? "active" : ""} onClick={() => setInquiryFilter("new")}>읽지 않음 {inquiries.filter((item) => item.status === "new").length}</button><button className={inquiryFilter === "read" ? "active" : ""} onClick={() => setInquiryFilter("read")}>확인함 {inquiries.filter((item) => item.status === "read").length}</button><button className={inquiryFilter === "done" ? "active" : ""} onClick={() => setInquiryFilter("done")}>처리 완료 {inquiries.filter((item) => item.status === "done").length}</button></div><label><span>문의 검색</span><input type="search" value={inquiryQuery} onChange={(event) => setInquiryQuery(event.target.value)} placeholder="학교, 담당자, 전화, 이메일 검색" /></label></div>
            {inquiryError && <div className="admin-error" role="alert">{inquiryError}</div>}
            <div className="inquiry-list">
              {visibleInquiries.length === 0 && <div className="admin-empty">조건에 맞는 문의가 없습니다.</div>}
              {visibleInquiries.map((item) => <article key={item.id} className={`inquiry-${item.status}`}>
                <div className="inquiry-head"><span>{item.status === "new" ? "읽지 않음" : item.status === "done" ? "처리 완료" : "확인함"}</span><time>{new Date(item.created_at).toLocaleString("ko-KR")}</time></div>
                <h2>{item.school}</h2><dl><div><dt>담당자</dt><dd>{item.name}</dd></div><div><dt>연락처</dt><dd><a href={`tel:${item.phone}`}>{item.phone}</a></dd></div><div><dt>이메일</dt><dd>{item.email ? <a href={`mailto:${item.email}`}>{item.email}</a> : <span>기존 문의 · 미입력</span>}</dd></div><div><dt>메일 전달</dt><dd>{item.email_status === "sent" ? "전송됨" : item.email_status === "pending" ? "전송 중" : "저장됨"}</dd></div></dl>
                <p>{item.details}</p><div className="inquiry-actions"><button className={item.status === "new" ? "active" : ""} disabled={updatingInquiry === item.id} onClick={() => updateStatus(item.id, "new")}>읽지 않음</button><button className={item.status === "read" ? "active" : ""} disabled={updatingInquiry === item.id} onClick={() => updateStatus(item.id, "read")}>확인함</button><button className={item.status === "done" ? "active" : ""} disabled={updatingInquiry === item.id} onClick={() => updateStatus(item.id, "done")}>처리 완료</button></div>
              </article>)}
            </div>
          </> : <>
            <div className="admin-title"><div><p>PRODUCT STORIES</p><h1>제품 게시글 관리</h1></div><span>제목 · 설명 · 여러 이미지 등록</span></div>
            <form className="post-form" onSubmit={upload}><label>제품 분야<select name="productKey" required>{Object.entries(productNames).map(([key, name]) => <option value={key} key={key}>{name}</option>)}</select></label><label>게시글 제목<input type="text" name="title" maxLength={150} placeholder="예: 부산 ○○초등학교 교실 납품 사례" required /></label><label className="post-content-field">게시글 내용<textarea name="content" maxLength={5000} placeholder="제품 특징, 납품 내용, 공간 구성 등을 입력해 주세요." /></label><label className="post-file-field">이미지 선택<input type="file" name="image" accept="image/jpeg,image/png,image/webp" multiple required /><small>여러 장 선택 가능 · 각 파일 최대 8MB</small></label><button disabled={loading}>{loading ? `${uploadTotal}장 업로드 중…` : "게시글 등록"}</button></form>
            {error && <div className="admin-error" role="alert">{error}</div>}
            <div className="admin-post-list">{posts.map((post) => <article key={post.id}><div><span>{productNames[post.product_key]}</span><time>{new Date(post.created_at).toLocaleDateString("ko-KR")}</time></div><h2>{post.title}</h2>{post.content && <p>{post.content}</p>}<div className="admin-post-images">{post.image_ids.map((id) => <img key={id} src={`/api/product-images/${id}`} alt="" />)}</div><button onClick={() => removePost(post.id)}>게시글 삭제</button></article>)}{posts.length === 0 && <div className="admin-empty">아직 등록된 제품 게시글이 없습니다.</div>}</div>
            {images.some((image) => !posts.some((post) => post.image_ids.includes(image.id))) && <div className="admin-legacy-images"><h2>기존 단독 이미지</h2><p>게시글 기능 추가 전에 등록된 이미지입니다. 분야별 페이지 하단에 함께 표시됩니다.</p><div>{images.filter((image) => !posts.some((post) => post.image_ids.includes(image.id))).map((image) => <figure key={image.id}><img src={`/api/product-images/${image.id}`} alt={image.filename} /><figcaption><span>{image.filename}</span><button onClick={() => removeImage(image.id)}>삭제</button></figcaption></figure>)}</div></div>}
          </>}
        </section>
      </div>
    </main>
  );
}
