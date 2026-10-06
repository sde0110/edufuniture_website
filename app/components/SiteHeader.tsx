"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { company } from "@/lib/site";

const navigation = [
  { label: "회사소개", href: "/#about" },
  { label: "제품소개", href: "/#products" },
  { label: "납품사례", href: "/#portfolio" },
  { label: "진행과정", href: "/#process" },
];

export default function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [menuOpen]);

  const transparent = overlay && !scrolled && !menuOpen;
  const close = () => setMenuOpen(false);

  return (
    <header className={`site-header ${transparent ? "is-transparent" : "is-solid"}`}>
      <div className="site-header-inner">
        <Link href="/" className="site-logo" aria-label="에듀퍼니처 홈" onClick={close}>
          <Image src={transparent ? "/assets/logo-light.png" : "/assets/logo-dark.png"} alt="에듀퍼니처 Edufurniture" width={1204} height={414} sizes="150px" priority />
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className="site-header-actions">
          <a className="header-phone" href={company.phoneHref}><span aria-hidden="true">☎</span>{company.phone}</a>
          <Link className="btn btn-primary btn-sm" href="/#contact">견적 문의</Link>
          <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}>
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div id="mobile-menu" className={`mobile-menu ${menuOpen ? "open" : ""}`} hidden={!menuOpen}>
        <nav aria-label="모바일 메뉴">
          {navigation.map((item) => <Link key={item.href} href={item.href} onClick={close}>{item.label}<span aria-hidden="true">→</span></Link>)}
          <Link href="/#contact" onClick={close}>견적 문의<span aria-hidden="true">→</span></Link>
        </nav>
        <div className="mobile-menu-contact">
          <small>상담 전화 · {company.hours}</small>
          <a href={company.phoneHref}>{company.phone}</a>
        </div>
      </div>
    </header>
  );
}
