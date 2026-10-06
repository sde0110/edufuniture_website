import type { Metadata, Viewport } from "next";
import "./globals.css";

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = {
  metadataBase: new URL(productionHost ? `https://${productionHost}` : "http://localhost:3000"),
  title: {
    default: "에듀퍼니처 | 학교용 책걸상·교육가구 전문",
    template: "%s | 에듀퍼니처",
  },
  description: "학교와 교육기관을 위한 책걸상, 교사용·특별교실·맞춤 제작 가구. 현장 상담부터 공간 제안, 제작, 납품까지 한 번에.",
  openGraph: {
    title: "에듀퍼니처 | 학교를 이해하는 가구",
    description: "현장 상담부터 공간 제안, 제작, 납품까지 한 번에.",
    images: ["/og.png"],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "에듀퍼니처 | 학교를 이해하는 가구",
    description: "학교용 책걸상·교육가구 제작 및 납품",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f4ee",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
