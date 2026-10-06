import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "../../components/Gallery";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { listProductImages, listProductPosts } from "@/lib/blob-storage";
import { company, findProduct, products } from "@/lib/site";

// Admin writes call revalidatePath for this route, so this only bounds staleness.
export const revalidate = 3600;

export function generateStaticParams() {
  return products.map((product) => ({ key: product.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const product = findProduct((await params).key);
  if (!product) return {};
  return { title: product.name, description: `${product.headline} ${product.description}` };
}

async function loadContent(key: string) {
  try {
    const [allImages, allPosts] = await Promise.all([listProductImages(), listProductPosts()]);
    return {
      images: allImages.filter((image) => image.product_key === key),
      posts: allPosts.filter((post) => post.product_key === key),
    };
  } catch {
    return { images: [], posts: [] };
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" });
}

export default async function ProductPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const product = findProduct(key);
  if (!product) notFound();

  const { images, posts } = await loadContent(key);
  const imageIds = new Set(images.map((image) => image.id));
  const attachedImageIds = new Set(posts.flatMap((post) => post.image_ids));
  const legacyImages = images.filter((image) => !attachedImageIds.has(image.id));
  const cover = posts.find((post) => post.image_ids.length)?.image_ids[0];
  const others = products.filter((item) => item.key !== product.key);

  return (
    <>
      <SiteHeader />
      <main className="product-page">
        <section className="product-hero">
          <div className="container product-hero-grid">
            <div className="product-hero-copy">
              <nav className="breadcrumb" aria-label="현재 위치"><Link href="/">홈</Link><span aria-hidden="true">/</span><Link href="/#products">제품소개</Link><span aria-hidden="true">/</span><b>{product.name}</b></nav>
              <p className="eyebrow">{product.number} · {product.tag}</p>
              <h1>{product.name}</h1>
              <p className="product-headline">{product.headline}</p>
              <p>{product.description}</p>
              <ul className="product-points">
                {product.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <div className="product-hero-actions">
                <Link className="btn btn-primary btn-lg" href={`/?product=${product.key}#contact`}>이 제품 견적 문의</Link>
                <a className="btn btn-ghost btn-lg" href={company.phoneHref}>{company.phone}</a>
              </div>
            </div>
            <div className="product-hero-image">
              <Image src={cover ? `/api/product-images/${cover}` : product.image} alt={`${product.name} 대표 이미지`} fill priority sizes="(max-width: 900px) 100vw, 50vw" />
              {!cover && <span className="image-note">공간 구성 예시</span>}
            </div>
          </div>
        </section>

        <section className="section product-stories">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">PORTFOLIO</p>
                <h2>{product.name} 납품사례</h2>
              </div>
              <p>{posts.length ? `총 ${posts.length}건의 사례가 있습니다. 사진을 누르면 크게 볼 수 있습니다.` : "제품과 납품 사례를 정리하고 있습니다."}</p>
            </div>

            <div className="story-list">
              {posts.map((post) => {
                const postImages = post.image_ids.filter((id) => imageIds.has(id));
                return (
                  <article className="story" id={`post-${post.id}`} key={post.id}>
                    <header>
                      <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                      <h3>{post.title}</h3>
                      {post.content && <p>{post.content}</p>}
                    </header>
                    <Gallery images={postImages.map((id, index) => ({ src: `/api/product-images/${id}`, alt: `${post.title} 사진 ${index + 1}` }))} />
                  </article>
                );
              })}
              {legacyImages.length > 0 && (
                <article className="story">
                  <header><h3>{product.name} 제품 이미지</h3></header>
                  <Gallery images={legacyImages.map((image, index) => ({ src: `/api/product-images/${image.id}`, alt: `${product.name} 제품 이미지 ${index + 1}` }))} />
                </article>
              )}
              {!posts.length && !legacyImages.length && (
                <div className="empty-state">
                  <strong>납품사례를 준비하고 있습니다.</strong>
                  <p>제품 구성과 실제 설치 사례가 궁금하시면 편하게 문의해 주세요.<br />비슷한 학교의 납품 사진을 직접 보여드립니다.</p>
                  <Link className="btn btn-primary" href={`/?product=${product.key}#contact`}>견적·상담 문의</Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="section other-products">
          <div className="container">
            <p className="eyebrow">MORE PRODUCTS</p>
            <div className="other-grid">
              {others.map((item) => (
                <Link href={`/products/${item.key}`} key={item.key} className="other-card">
                  <small>{item.number} · {item.tag}</small>
                  <strong>{item.name}</strong>
                  <span>{item.summary}</span>
                  <i aria-hidden="true">→</i>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="container cta-band-inner">
            <h2>학교에 필요한 구성을<br />함께 찾아보세요.</h2>
            <div>
              <Link className="btn btn-light btn-lg" href={`/?product=${product.key}#contact`}>견적 문의하기</Link>
              <a className="btn btn-glass btn-lg" href={company.phoneHref}>전화 상담 {company.phone}</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
