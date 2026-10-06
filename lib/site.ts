export const company = {
  name: "에듀퍼니처",
  englishName: "EDUFURNITURE",
  ceo: "신인수",
  phone: "010-2313-0520",
  phoneHref: "tel:01023130520",
  fax: "050-4223-0520",
  email: "bmgshin@naver.com",
  address: "부산광역시 남구 수영로 74-5, 806호 (문현동, 무학프라자)",
  hours: "평일 09:00 – 18:00",
};

export const products = [
  {
    key: "student",
    number: "01",
    tag: "CLASSROOM",
    name: "학생용 책걸상",
    summary: "학생의 성장과 바른 자세를 고려한 견고한 기본형 책걸상",
    headline: "매일의 배움에 편안함을 더합니다.",
    description: "학생의 성장과 바른 자세를 고려한 견고한 학교용 책걸상입니다. 교실 규모와 학년, 수업 방식에 맞춰 제품 구성과 배치를 제안합니다.",
    points: ["학생 체형을 고려한 규격", "매일 사용해도 견고한 구조", "학교별 수량·배치 맞춤 상담"],
    image: "/assets/portfolio/classroom-elementary.png",
  },
  {
    key: "teacher",
    number: "02",
    tag: "TEACHER",
    name: "교사용 가구",
    summary: "수업 준비와 교실 운영을 돕는 교탁·교사용 책상·수납장",
    headline: "수업 준비와 교실 운영을 더 효율적으로.",
    description: "교탁, 교사용 책상, 수납장 등 선생님의 업무 동선과 교실 환경을 고려한 가구를 구성합니다.",
    points: ["교실 동선을 고려한 설계", "수업 도구를 위한 실용적인 수납", "공간과 색상에 맞춘 제작"],
    image: "/assets/portfolio/library.png",
  },
  {
    key: "special",
    number: "03",
    tag: "SPECIAL ROOM",
    name: "특별교실 가구",
    summary: "과학실·도서실·돌봄교실 등 목적에 맞춘 공간별 구성",
    headline: "공간의 목적에 꼭 맞는 구성을 만듭니다.",
    description: "과학실, 도서실, 돌봄교실, 다목적실 등 수업과 활동의 특성에 맞춰 안전하고 유연한 공간을 제안합니다.",
    points: ["교실별 용도에 맞춘 구성", "안전과 관리 편의성 고려", "현장 실측 기반 맞춤 제작"],
    image: "/assets/portfolio/classroom-secondary.png",
  },
  {
    key: "custom",
    number: "04",
    tag: "CUSTOM",
    name: "맞춤 제작 가구",
    summary: "현장 실측부터 제작·납품까지 공간에 꼭 맞는 제안",
    headline: "학교의 공간과 예산에 맞는 답을 찾습니다.",
    description: "기성 제품으로 해결하기 어려운 공간도 현장 상담과 실측을 거쳐 제작부터 납품까지 책임집니다.",
    points: ["현장 상담 및 실측", "예산·일정을 고려한 제안", "제작부터 납품까지 일괄 진행"],
    image: "/assets/portfolio/multipurpose.png",
  },
] as const;

export type ProductKey = (typeof products)[number]["key"];

export const productKeys = new Set<string>(products.map((product) => product.key));

export function findProduct(key: string) {
  return products.find((product) => product.key === key);
}

// Sample space renders. Filenames don't match their content; the labels below do.
export const showcase = [
  { image: "/assets/portfolio/classroom-elementary.png", type: "일반교실", title: "배움에 집중하는 편안한 교실", description: "학생의 체형과 수업 동선을 고려한 책걸상 배치" },
  { image: "/assets/portfolio/classroom-secondary.png", type: "과학실", title: "안전하고 견고한 실습 공간", description: "실험 수업에 맞춘 내구성 높은 테이블과 수납 시스템" },
  { image: "/assets/portfolio/science-lab.png", type: "다목적교실", title: "수업에 따라 달라지는 유연한 공간", description: "토론과 모둠 활동을 위한 이동형 교육 가구" },
  { image: "/assets/portfolio/library.png", type: "중·고등교실", title: "오래 사용해도 편안한 기본", description: "튼튼한 프레임과 관리가 쉬운 학생용 책걸상" },
  { image: "/assets/portfolio/multipurpose.png", type: "도서·학습실", title: "머물고 싶은 배움의 라운지", description: "열람과 협업을 아우르는 맞춤형 학습 가구" },
];

export const process = [
  { title: "상담 문의", description: "전화나 견적 문의로 필요한 가구와 일정을 알려주세요." },
  { title: "현장 방문·실측", description: "학교를 직접 방문해 공간과 사용 환경을 확인합니다." },
  { title: "공간·견적 제안", description: "예산과 일정에 맞춘 구성안과 견적을 드립니다." },
  { title: "제작", description: "확정된 규격과 색상으로 꼼꼼하게 제작합니다." },
  { title: "납품·설치", description: "수업 일정에 지장이 없도록 납품과 설치를 마무리합니다." },
];

export const timelines = ["1개월 이내", "1~3개월", "3개월 이후", "미정 · 상담 후 결정"];
