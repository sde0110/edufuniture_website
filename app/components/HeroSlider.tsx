"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { company, showcase } from "@/lib/site";

export default function HeroSlider() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % showcase.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const current = showcase[slide];

  return (
    <section
      className="hero"
      aria-label="에듀퍼니처 공간 구성 예시"
    >
      <div className="hero-media" aria-hidden="true">
        {showcase.map((item, index) => (
          <div className={`hero-slide ${index === slide ? "active" : ""}`} key={item.image}>
            <Image src={item.image} alt="" fill priority={index === 0} sizes="100vw" quality={80} />
          </div>
        ))}
        <div className="hero-shade" />
      </div>

      <div className="hero-inner">
        <p className="eyebrow eyebrow-light">학교용 책걸상 · 교육가구 제작 납품</p>
        <h1>배움이 시작되는 곳,<br /><em>좋은 가구</em>에서 시작됩니다</h1>
        <p className="hero-lead">현장 상담부터 공간 제안, 제작, 납품까지 한 번에.<br />학교의 예산과 일정에 맞는 현실적인 답을 드립니다.</p>
        <div className="hero-actions">
          <a className="btn btn-primary btn-lg" href="#contact">무료 견적 받기</a>
          <a className="btn btn-glass btn-lg" href="#portfolio">납품사례 보기</a>
        </div>
        <a className="hero-phone" href={company.phoneHref}>바로 상담 <strong>{company.phone}</strong></a>
      </div>

      <div className="hero-caption">
        <div>
          <span className="chip">{current.type}</span>
          <strong>{current.title}</strong>
          <small>{current.description}</small>
        </div>
        <div className="hero-progress" aria-hidden="true">
          {showcase.map((item, index) => <i key={item.image} className={index === slide ? "active" : ""} />)}
        </div>
      </div>
      <p className="hero-note">※ 이미지는 공간 구성 예시입니다.</p>
    </section>
  );
}
