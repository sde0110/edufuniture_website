# 에듀퍼니처 웹사이트

학교용 책걸상·교육가구 제작 납품 업체 에듀퍼니처의 홈페이지입니다. Next.js(App Router)로 만들었고 Vercel에 배포합니다.

## 실행

```bash
npm install
vercel env pull .env.local   # ADMIN_PASSWORD, ADMIN_SESSION_SECRET, BLOB_READ_WRITE_TOKEN
npm run dev
npm run build
```

## 구조

- `lib/site.ts` — 회사 정보, 제품 분야, 공간 예시 이미지, 진행 과정. 문구 수정은 대부분 여기서 합니다.
- `app/page.tsx` — 메인(히어로, 회사소개, 제품, 납품사례, 진행과정, 견적문의)
- `app/products/[key]/page.tsx` — 제품 분야별 상세와 납품사례 게시글
- `app/admin/page.tsx` — 관리자(견적 문의 관리, 납품사례 게시글 등록). 푸터 저작권 문구를 세 번 클릭하면 열립니다.
- `lib/blob-storage.ts` — 문의·게시글·이미지를 Vercel Blob(private)에 저장

관리자가 게시글을 올리거나 지우면 메인과 해당 제품 페이지가 바로 갱신됩니다. 게시글의 첫 번째 사진이 메인 납품사례와 제품 카드의 대표 이미지로 쓰입니다. 게시글이 하나도 없을 때는 `public/assets/portfolio`의 공간 구성 예시 이미지가 대신 표시됩니다.

견적 문의는 Blob에 저장되고 FormSubmit으로 `bmgshin@naver.com`에 메일이 발송됩니다.
