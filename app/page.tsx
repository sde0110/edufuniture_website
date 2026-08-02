"use client";

import { FormEvent, useEffect, useState } from "react";

const navigation = [
  { label: "회사소개", href: "#about" },
  { label: "제품소개", href: "#products" },
  { label: "공지사항", href: "#notice" },
  { label: "견적문의", href: "#contact" },
];

const portfolio = [
  {
    image: "/assets/portfolio/classroom-elementary.png",
    type: "일반교실",
    title: "배움에 집중하는 편안한 교실",
    description: "학생의 체형과 수업 동선을 고려한 책걸상 배치",
  },
  {
    image: "/assets/portfolio/classroom-secondary.png",
    type: "과학실",
    title: "안전하고 견고한 실습 공간",
    description: "실험 수업에 맞춘 내구성 높은 테이블과 수납 시스템",
  },
  {
    image: "/assets/portfolio/science-lab.png",
    type: "다목적교실",
    title: "수업에 따라 달라지는 유연한 공간",
    description: "토론과 모둠 활동을 위한 이동형 교육 가구",
  },
  {
    image: "/assets/portfolio/library.png",
    type: "중·고등교실",
    title: "오래 사용해도 편안한 기본",
    description: "튼튼한 프레임과 관리가 쉬운 학생용 책걸상",
  },
  {
    image: "/assets/portfolio/multipurpose.png",
    type: "도서·학습실",
    title: "머물고 싶은 배움의 라운지",
    description: "열람과 협업을 아우르는 맞춤형 학습 가구",
  },
];

const products = [
  { number: "01", name: "학생용 책걸상", copy: "학생의 성장과 바른 자세를 고려한 견고한 기본형 제품", tag: "Classroom" },
  { number: "02", name: "교사용 가구", copy: "수업 준비와 교실 운영을 효율적으로 돕는 교탁·책상·수납장", tag: "Teacher" },
  { number: "03", name: "특별교실 가구", copy: "과학실, 도서실, 돌봄교실 등 목적에 맞춘 공간별 구성", tag: "Special Room" },
  { number: "04", name: "맞춤 제작 가구", copy: "학교 현장 실측부터 제작·납품까지 공간에 꼭 맞는 제안", tag: "Custom" },
];

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % portfolio.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const goTo = (index: number) => setSlide((index + portfolio.length) % portfolio.length);

  const submitQuote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "");
    const school = String(data.get("school") || "");
    const phone = String(data.get("phone") || "");
    const details = String(data.get("details") || "");
    const subject = encodeURIComponent(`[견적문의] ${school || name}`);
    const body = encodeURIComponent(`담당자: ${name}\n학교/기관: ${school}\n연락처: ${phone}\n\n문의 내용\n${details}`);
    window.location.href = `mailto:bmgshin@naver.com?subject=${subject}&body=${body}`;
  };

  return (
    <main>
      <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="메뉴 열기">메뉴 <span>☰</span></button>
      {menuOpen && <button className="sidebar-dim" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기" />}

      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <button className="sidebar-close" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기">×</button>
        <a className="brand" href="#top" onClick={() => setMenuOpen(false)}>
          <BrandMark />
          <span><strong>에듀퍼니처</strong><small>Edufurniture</small></span>
        </a>
        <p className="brand-copy">학교의 하루를<br />더 편안하게 만듭니다.</p>
        <nav aria-label="주요 메뉴">
          {navigation.map((item, index) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>{item.label}<i>↗</i>
            </a>
          ))}
        </nav>
        <div className="sidebar-contact">
          <span>상담전화</span>
          <a href="tel:01023130520">010.2313.0520</a>
          <small>평일 09:00 — 18:00</small>
        </div>
      </aside>

      <div className="page-content" id="top">
        <section className="hero" aria-label="에듀퍼니처 포트폴리오">
          <div
            className="carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            {portfolio.map((item, index) => (
              <article className={`slide ${index === slide ? "active" : ""}`} key={item.title} aria-hidden={index !== slide}>
                <img src={item.image} alt={`${item.type} 교육 가구 구성 샘플`} />
                <div className="slide-shade" />
                <div className="hero-copy">
                  <p><span>EDUFURNITURE</span> 학교용 제작가구 전문</p>
                  <h1>배움이 시작되는 곳,<br /><em>좋은 가구</em>에서 시작됩니다.</h1>
                  <div className="project-caption">
                    <span>{item.type}</span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </div>
                </div>
              </article>
            ))}
            <div className="carousel-controls">
              <button onClick={() => goTo(slide - 1)} aria-label="이전 이미지">←</button>
              <div className="dots">
                {portfolio.map((item, index) => (
                  <button key={item.type} className={index === slide ? "active" : ""} onClick={() => goTo(index)} aria-label={`${index + 1}번 이미지 보기`}>
                    <i />
                  </button>
                ))}
              </div>
              <span><b>{String(slide + 1).padStart(2, "0")}</b> / 05</span>
              <button onClick={() => goTo(slide + 1)} aria-label="다음 이미지">→</button>
            </div>
            <p className="sample-label">※ 포트폴리오 이미지는 공간 구성 예시입니다.</p>
          </div>
        </section>

        <section className="about section" id="about">
          <div className="section-heading">
            <p>ABOUT EDUFURNITURE</p>
            <h2>학교를 이해하는 가구,<br />현장을 생각하는 제작.</h2>
          </div>
          <div className="about-copy">
            <p>에듀퍼니처는 학교와 교육기관에 필요한 책걸상 및 교육용·사무용 가구를 제작·납품합니다. 매일 사용하는 가구인 만큼 안전성, 내구성, 편안함을 가장 먼저 생각합니다.</p>
            <p>현장 상담부터 공간 제안, 제작, 납품까지 한 번에. 학교의 예산과 일정, 공간에 맞는 현실적인 답을 드리겠습니다.</p>
            <a href="#contact">회사 소개 및 견적 상담 <span>↗</span></a>
          </div>
          <div className="principles">
            <div><b>01</b><strong>안전하게</strong><span>학생이 매일 쓰는 제품이니까</span></div>
            <div><b>02</b><strong>튼튼하게</strong><span>오래 사용할 수 있는 기본</span></div>
            <div><b>03</b><strong>꼭 맞게</strong><span>학교별 환경을 고려한 제안</span></div>
          </div>
        </section>

        <section className="products section" id="products">
          <div className="section-heading light">
            <p>OUR PRODUCTS</p>
            <h2>배움의 모든 공간을<br />에듀퍼니처로.</h2>
          </div>
          <div className="product-list">
            {products.map((product) => (
              <article key={product.number}>
                <span>{product.number}</span>
                <div><small>{product.tag}</small><h3>{product.name}</h3><p>{product.copy}</p></div>
                <i>↗</i>
              </article>
            ))}
          </div>
        </section>

        <section className="notice section" id="notice">
          <div className="section-heading">
            <p>NOTICE</p>
            <h2>에듀퍼니처<br />새소식</h2>
          </div>
          <div className="notice-list">
            <article><time>2026.08.02</time><strong>에듀퍼니처 홈페이지를 새롭게 준비했습니다.</strong><span>공지</span></article>
            <article><time>2026.07.15</time><strong>학교 가구 대량 납품 및 맞춤 제작 상담 안내</strong><span>안내</span></article>
            <article><time>2026.07.01</time><strong>견적 문의 시 필요한 정보를 확인해 주세요.</strong><span>안내</span></article>
          </div>
        </section>

        <section className="contact section" id="contact">
          <div className="contact-intro">
            <p>REQUEST A QUOTE</p>
            <h2>필요한 가구를 알려주세요.<br />꼼꼼하게 확인하고 연락드리겠습니다.</h2>
            <div className="contact-info">
              <a href="tel:01023130520"><small>전화</small>010.2313.0520</a>
              <a href="mailto:bmgshin@naver.com"><small>이메일</small>bmgshin@naver.com</a>
              <address><small>주소</small>부산광역시 남구 수영로 74-5<br />806호 (문현동, 무학프라자)</address>
            </div>
          </div>
          <form onSubmit={submitQuote}>
            <label>담당자명<input name="name" required placeholder="성함을 입력해 주세요" /></label>
            <label>학교 / 기관명<input name="school" required placeholder="학교 또는 기관명을 입력해 주세요" /></label>
            <label>연락처<input name="phone" type="tel" required placeholder="010-0000-0000" /></label>
            <label>문의 내용<textarea name="details" required placeholder="필요한 제품, 수량, 납품 희망일 등을 알려주세요." /></label>
            <p>제출하면 기본 메일 앱에서 문의 메일이 작성됩니다.</p>
            <button type="submit">견적 문의 보내기 <span>↗</span></button>
          </form>
        </section>

        <footer>
          <a className="brand footer-brand" href="#top"><BrandMark /><span><strong>에듀퍼니처</strong><small>Edufurniture</small></span></a>
          <p>대표 신인수　|　교육용·사무용 제작가구<br />M. 010.2313.0520　F. 050.4223.0520　E. bmgshin@naver.com</p>
          <small>© {new Date().getFullYear()} EDUFURNITURE. ALL RIGHTS RESERVED.</small>
        </footer>
      </div>
    </main>
  );
}
