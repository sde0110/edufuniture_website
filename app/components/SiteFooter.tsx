"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { company } from "@/lib/site";

export default function SiteFooter() {
  const clicks = useRef<number[]>([]);

  // Hidden admin entry: triple-click the copyright line.
  const openAdminOnTripleClick = () => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((time) => now - time < 1200), now];
    if (clicks.current.length >= 3) window.location.href = "/admin";
  };

  return (
    <>
      <footer className="site-footer">
        <div className="footer-top">
          <Link href="/" className="footer-logo" aria-label="에듀퍼니처 홈"><Image src="/assets/logo-light.png" alt="에듀퍼니처 Edufurniture" width={1204} height={414} sizes="150px" /></Link>
          <nav aria-label="하단 메뉴">
            <Link href="/#about">회사소개</Link>
            <Link href="/#products">제품소개</Link>
            <Link href="/#portfolio">납품사례</Link>
            <Link href="/#process">진행과정</Link>
            <Link href="/#contact">견적문의</Link>
          </nav>
        </div>
        <div className="footer-info">
          <p>
            <span>상호 {company.name}</span>
            <span>대표 {company.ceo}</span>
            <span>교육용·사무용 제작가구</span>
          </p>
          <p>
            <span>M. <a href={company.phoneHref}>{company.phone}</a></span>
            <span>F. {company.fax}</span>
            <span>E. <a href={`mailto:${company.email}`}>{company.email}</a></span>
          </p>
          <p><span>{company.address}</span></p>
        </div>
        <button className="copyright-trigger" onClick={openAdminOnTripleClick} aria-label="저작권 정보">© {new Date().getFullYear()} EDUFURNITURE. ALL RIGHTS RESERVED.</button>
      </footer>
      <div className="mobile-cta" role="navigation" aria-label="빠른 상담">
        <a href={company.phoneHref} className="mobile-cta-call">전화 상담</a>
        <Link href="/#contact" className="mobile-cta-quote">견적 문의</Link>
      </div>
    </>
  );
}
