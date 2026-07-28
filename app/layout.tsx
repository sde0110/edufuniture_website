import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
export async function generateMetadata():Promise<Metadata>{const h=await headers(),host=h.get("host")??"localhost:3000",protocol=host.includes("localhost")?"http":"https",image=`${protocol}://${host}/og.png`;return{title:"다섯 번째 서랍 — The Fifth Drawer",description:"존재하지 않던 문 너머, 다섯 번째 서랍을 찾아가는 감성 포인트앤클릭 미스터리",openGraph:{title:"다섯 번째 서랍",description:"네 개의 서랍은 닫혀 있었다. 다섯 번째만 빼고.",images:[image]},twitter:{card:"summary_large_image",title:"다섯 번째 서랍",description:"네 개의 서랍은 닫혀 있었다. 다섯 번째만 빼고.",images:[image]}}}
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>}
