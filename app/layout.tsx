import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
export async function generateMetadata():Promise<Metadata>{const h=await headers(),host=h.get("host")??"localhost:3000",protocol=host.includes("localhost")?"http":"https",image=`${protocol}://${host}/og.png`;return{title:"다섯 번째 서랍 — The Fifth Drawer",description:"다섯 개의 방을 지나, 기억하지 못했던 사랑을 발견하는 감성 온라인 방탈출",openGraph:{title:"다섯 번째 서랍",description:"기억하지 못한 날에도 사랑은 그곳에 있었다.",images:[image]},twitter:{card:"summary_large_image",title:"다섯 번째 서랍",description:"기억하지 못한 날에도 사랑은 그곳에 있었다.",images:[image]}}}
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>}
