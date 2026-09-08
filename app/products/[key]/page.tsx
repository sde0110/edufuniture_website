import Link from "next/link";
import { notFound } from "next/navigation";
import { listProductImages } from "@/lib/blob-storage";

const products = {
  student: {
    number: "01",
    tag: "CLASSROOM",
    name: "학생용 책걸상",
    headline: "매일의 배움에 편안함을 더합니다.",
    description: "학생의 성장과 바른 자세를 고려한 견고한 학교용 책걸상입니다. 교실 규모와 학년, 수업 방식에 맞춰 제품 구성과 배치를 제안합니다.",
    points: ["학생 체형을 고려한 규격", "매일 사용해도 견고한 구조", "학교별 수량·배치 맞춤 상담"],
  },
  teacher: {
    number: "02",
    tag: "TEACHER",
    name: "교사용 가구",
    headline: "수업 준비와 교실 운영을 더 효율적으로.",
    description: "교탁, 교사용 책상, 수납장 등 선생님의 업무 동선과 교실 환경을 고려한 가구를 구성합니다.",
    points: ["교실 동선을 고려한 설계", "수업 도구를 위한 실용적인 수납", "공간과 색상에 맞춘 제작"],
  },
  special: {
    number: "03",
    tag: "SPECIAL ROOM",
    name: "특별교실 가구",
    headline: "공간의 목적에 꼭 맞는 구성을 만듭니다.",
    description: "과학실, 도서실, 돌봄교실, 다목적실 등 수업과 활동의 특성에 맞춰 안전하고 유연한 공간을 제안합니다.",
    points: ["교실별 용도에 맞춘 구성", "안전과 관리 편의성 고려", "현장 실측 기반 맞춤 제작"],
  },
  custom: {
    number: "04",
    tag: "CUSTOM",
    name: "맞춤 제작 가구",
    headline: "학교의 공간과 예산에 맞는 답을 찾습니다.",
    description: "기성 제품으로 해결하기 어려운 공간도 현장 상담과 실측을 거쳐 제작부터 납품까지 책임집니다.",
    points: ["현장 상담 및 실측", "예산·일정을 고려한 제안", "제작부터 납품까지 일괄 진행"],
  },
} as const;

type ProductKey = keyof typeof products;

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!(key in products)) notFound();
  const product = products[key as ProductKey];
  const images = (await listProductImages()).filter((image) => image.product_key === key);

  return (
    <main className="product-detail">
      <header className="product-detail-header">
        <Link href="/" aria-label="에듀퍼니처 메인으로"><img src="/assets/edufurniture-logo.png" alt="에듀퍼니처" /></Link>
        <Link href="/#products">제품소개로 돌아가기</Link>
      </header>
      <section className="product-detail-hero">
        <div><span>{product.number}</span><p>{product.tag}</p></div>
        <div><h1>{product.name}</h1><h2>{product.headline}</h2><p>{product.description}</p></div>
      </section>
      <section className="product-detail-points" aria-label={`${product.name} 특징`}>
        {product.points.map((point, index) => <div key={point}><span>0{index + 1}</span><strong>{point}</strong></div>)}
      </section>
      <section className="product-detail-gallery">
        <div><p>PRODUCT GALLERY</p><h2>제품 이미지</h2><span>관리자가 등록한 제품과 납품 사례를 확인하세요.</span></div>
        {images.length ? <div className="product-detail-grid">{images.map((image) => <figure key={image.id}><img src={`/api/product-images/${image.id}`} alt={`${product.name} - ${image.filename}`} /><figcaption>{image.filename}</figcaption></figure>)}</div> : <div className="product-detail-empty"><strong>제품 이미지를 준비하고 있습니다.</strong><p>자세한 제품 구성과 납품 상담은 견적문의를 이용해 주세요.</p></div>}
      </section>
      <section className="product-detail-contact"><div><p>PROJECT INQUIRY</p><h2>학교에 필요한 구성을<br />함께 찾아보세요.</h2></div><Link href="/#contact">견적 문의하기 <span>↗</span></Link></section>
    </main>
  );
}
