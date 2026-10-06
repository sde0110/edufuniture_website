"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type GalleryImage = { src: string; alt: string };

export default function Gallery({ images }: { images: GalleryImage[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const move = useCallback((step: number) => {
    setOpen((current) => current === null ? null : (current + step + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open, move]);

  if (!images.length) return null;

  return (
    <>
      <div className={`gallery count-${Math.min(images.length, 5)}`}>
        {images.slice(0, 5).map((image, index) => (
          <button key={image.src} className="gallery-item" onClick={() => setOpen(index)} aria-label={`${image.alt} 크게 보기`}>
            <Image src={image.src} alt={image.alt} fill sizes="(max-width: 760px) 100vw, 50vw" />
            {index === 4 && images.length > 5 && <span className="gallery-more">+{images.length - 5}</span>}
          </button>
        ))}
      </div>
      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="이미지 크게 보기" onClick={() => setOpen(null)}>
          <button className="lightbox-close" onClick={() => setOpen(null)} aria-label="닫기">×</button>
          <figure onClick={(event) => event.stopPropagation()}>
            <Image src={images[open].src} alt={images[open].alt} fill sizes="100vw" quality={85} />
          </figure>
          {images.length > 1 && <>
            <button className="lightbox-nav prev" onClick={(event) => { event.stopPropagation(); move(-1); }} aria-label="이전 이미지">←</button>
            <button className="lightbox-nav next" onClick={(event) => { event.stopPropagation(); move(1); }} aria-label="다음 이미지">→</button>
            <p className="lightbox-count">{open + 1} / {images.length}</p>
          </>}
        </div>
      )}
    </>
  );
}
