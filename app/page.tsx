import Image from "next/image";
import Link from "next/link";
import HeroSlider from "./components/HeroSlider";
import QuoteForm from "./components/QuoteForm";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import { listProductPosts, type ProductPost } from "@/lib/blob-storage";
import { company, findProduct, process, products, showcase } from "@/lib/site";

// Admin writes call revalidatePath("/"), so this only bounds staleness.
export const revalidate = 3600;

async function loadPosts(): Promise<ProductPost[]> {
  try {
    return await listProductPosts();
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul" }).replace(/\s/g, "").replace(/\.$/, "");
}

export default async function Home() {
  const posts = await loadPosts();
  const cases = posts.filter((post) => post.image_ids.length > 0).slice(0, 6);
  const sampleCount = cases.length || showcase.length;
  // Featured card fills 2x2 of a 3-column grid; pad the last row with an inquiry card.
  const ctaShape = sampleCount === 1 ? "tall" : (sampleCount + 3) % 3 === 1 ? "wide" : (sampleCount + 3) % 3 === 2 ? "" : null;
  const coverFor = (key: string) => posts.find((post) => post.product_key === key && post.image_ids.length)?.image_ids[0];

  return (
    <>
      <SiteHeader overlay />
      <main id="top">
        <HeroSlider />

        <section className="trust-strip" aria-label="에듀퍼니처의 약속">
          <div><strong>현장 방문 상담</strong><span>직접 보고 정확하게 제안합니다</span></div>
          <div><strong>공간 맞춤 제작</strong><span>규격·색상·수량을 학교에 맞춰</span></div>
          <div><strong>납품·설치까지</strong><span>수업 일정에 맞춘 책임 시공</span></div>
          <div><strong>1:1 직접 응대</strong><span>대표가 처음부터 끝까지 담당</span></div>
        </section>

        <section className="section about" id="about">
          <div className="container about-grid">
            <div className="about-visual">
              <div className="about-image"><Image src={showcase[2].image} alt="모둠 활동형 다목적교실 가구 구성 예시" fill sizes="(max-width: 900px) 100vw, 45vw" /></div>
              <div className="about-badge"><strong>학교를<br />이해하는 가구</strong></div>
            </div>
            <div className="about-copy">
              <p className="eyebrow">ABOUT EDUFURNITURE</p>
              <h2>학교를 이해하는 가구,<br />현장을 생각하는 제작</h2>
              <p>에듀퍼니처는 학교와 교육기관에 필요한 책걸상 및 교육용·사무용 가구를 제작·납품합니다. 매일 사용하는 가구인 만큼 안전성, 내구성, 편안함을 가장 먼저 생각합니다.</p>
              <p>현장 상담부터 공간 제안, 제작, 납품까지 한 번에. 학교의 예산과 일정, 공간에 맞는 현실적인 답을 드리겠습니다.</p>
              <ul className="principles">
                <li><b>01</b><strong>안전하게</strong><span>학생이 매일 쓰는 제품이니까</span></li>
                <li><b>02</b><strong>튼튼하게</strong><span>오래 사용할 수 있는 기본</span></li>
                <li><b>03</b><strong>꼭 맞게</strong><span>학교별 환경을 고려한 제안</span></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section products" id="products">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">OUR PRODUCTS</p>
                <h2>배움의 모든 공간을<br />에듀퍼니처로</h2>
              </div>
              <p>교실부터 특별실까지, 공간의 목적과 학생의 눈높이에 맞춰 구성합니다.</p>
            </div>
            <div className="product-grid">
              {products.map((product) => {
                const cover = coverFor(product.key);
                return (
                  <Link className="product-card" href={`/products/${product.key}`} key={product.key}>
                    <div className="product-card-image">
                      <Image src={cover ? `/api/product-images/${cover}` : product.image} alt={`${product.name} 대표 이미지`} fill sizes="(max-width: 620px) 100vw, (max-width: 1100px) 50vw, 25vw" />
                      <span className="product-card-number">{product.number}</span>
                    </div>
                    <div className="product-card-body">
                      <small>{product.tag}</small>
                      <h3>{product.name}</h3>
                      <p>{product.summary}</p>
                      <span className="link-arrow">자세히 보기 <i aria-hidden="true">→</i></span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section portfolio" id="portfolio">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">PORTFOLIO</p>
                <h2>납품사례</h2>
              </div>
              <p>{cases.length ? "학교 현장에 직접 납품하고 설치한 사례입니다." : "실제 납품 사례를 정리하고 있습니다. 아래는 에듀퍼니처가 제안하는 공간 구성 예시입니다."}</p>
            </div>
            {cases.length > 0 ? (
              <div className="case-grid">
                {cases.map((post, index) => (
                  <Link className={`case-card ${index === 0 ? "featured" : ""}`} href={`/products/${post.product_key}#post-${post.id}`} key={post.id}>
                    <div className="case-card-image">
                      <Image src={`/api/product-images/${post.image_ids[0]}`} alt={post.title} fill sizes={index === 0 ? "(max-width: 900px) 100vw, 66vw" : "(max-width: 900px) 100vw, 33vw"} />
                      {post.image_ids.length > 1 && <span className="case-count">사진 {post.image_ids.length}장</span>}
                    </div>
                    <div className="case-card-body">
                      <span className="chip">{findProduct(post.product_key)?.name ?? "납품사례"}</span>
                      <h3>{post.title}</h3>
                      <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                    </div>
                  </Link>
                ))}
                {ctaShape !== null && (
                  <a className={`case-cta ${ctaShape}`} href="#contact">
                    <div><strong>우리 학교 공간도<br />상담받아 보세요</strong><p>비슷한 규모의 학교 납품 사례를 함께 보여드립니다.</p></div>
                    <span>견적 문의하기 →</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="case-grid">
                {showcase.map((item, index) => (
                  <div className={`case-card is-sample ${index === 0 ? "featured" : ""}`} key={item.image}>
                    <div className="case-card-image">
                      <Image src={item.image} alt={`${item.type} 공간 구성 예시`} fill sizes={index === 0 ? "(max-width: 900px) 100vw, 66vw" : "(max-width: 900px) 100vw, 33vw"} />
                      <span className="case-count">구성 예시</span>
                    </div>
                    <div className="case-card-body">
                      <span className="chip">{item.type}</span>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
                {ctaShape !== null && (
                  <a className={`case-cta ${ctaShape}`} href="#contact">
                    <div><strong>우리 학교 공간도<br />상담받아 보세요</strong><p>비슷한 규모의 학교 납품 사례를 함께 보여드립니다.</p></div>
                    <span>견적 문의하기 →</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="section process" id="process">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">HOW WE WORK</p>
                <h2>문의부터 설치까지,<br />한 사람이 책임집니다</h2>
              </div>
              <p>담당자가 바뀌지 않아 처음 나눈 이야기가 납품 날까지 그대로 이어집니다.</p>
            </div>
            <ol className="process-list">
              {process.map((step, index) => (
                <li key={step.title}>
                  <span>STEP {String(index + 1).padStart(2, "0")}</span>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section contact" id="contact">
          <div className="container contact-grid">
            <div className="contact-intro">
              <p className="eyebrow">REQUEST A QUOTE</p>
              <h2>필요한 가구를<br />알려주세요</h2>
              <p>꼼꼼하게 확인하고 연락드리겠습니다.<br />아래 내용을 함께 적어주시면 더 정확한 견적이 가능합니다.</p>
              <ul className="contact-checklist">
                <li>필요한 제품과 대략적인 수량</li>
                <li>설치할 교실·공간과 학년</li>
                <li>납품 희망 시기와 예산 범위</li>
              </ul>
              <div className="contact-info">
                <a href={company.phoneHref}><small>전화 상담 · {company.hours}</small><strong>{company.phone}</strong></a>
                <a href={`mailto:${company.email}`}><small>이메일</small><strong>{company.email}</strong></a>
                <address><small>주소</small><span>{company.address}</span></address>
              </div>
            </div>
            <QuoteForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
