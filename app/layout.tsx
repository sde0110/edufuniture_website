import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const image = `${protocol}://${host}/og.png`;

  return {
    title: "에듀퍼니처 | 학교용 책걸상·교육가구 전문",
    description: "학교와 교육기관을 위한 책걸상, 교육용·사무용 제작가구 전문 에듀퍼니처입니다.",
    openGraph: {
      title: "에듀퍼니처 | 학교를 이해하는 가구",
      description: "현장 상담부터 공간 제안, 제작, 납품까지 한 번에.",
      images: [image],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "에듀퍼니처 | 학교를 이해하는 가구",
      description: "학교용 책걸상·교육가구 제작 및 납품",
      images: [image],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
