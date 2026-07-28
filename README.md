# 다섯 번째 서랍 · The Fifth Drawer

다섯 개의 방을 탐색하며 주인공이 기억하지 못했던 가족의 사랑을 발견하는 한국어 감성 포인트앤클릭 방탈출 MVP입니다. 모바일 터치와 데스크톱 마우스/키보드로 처음부터 엔딩까지 플레이할 수 있습니다.

## 실행

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
```

React 19, TypeScript, Vite 기반 vinext, Zustand, CSS, Node Test Runner를 사용합니다. `app/page.tsx`가 타이틀·프롤로그·탐색·퍼즐·엔딩 흐름을 담당하고, `src/utils/game.ts`가 전화번호 정제/마스킹, 최종 정답, 인벤토리 유틸리티를 분리합니다. 방 데이터는 `rooms` 배열에 모여 있어 향후 장면 에셋과 퍼즐 정의를 별도 파일로 쉽게 옮길 수 있습니다.

## 방별 퍼즐

1. 영유아기 — 곰 단추, 가족사진, 모빌 별로 `337`
2. 어린이집 — 도시락 반찬 `김·달걀·당근·멸치`
3. 사춘기 — 반복해서 데운 국의 마지막 시각 `2130`
4. 대학 입시 — 전송되지 않은 메시지 시각 `1147`
5. 현재의 본가 — 되찾은 네 글자 `기억하지`

각 방에는 3단계 힌트, 조사 오브젝트, 획득 아이템, 감정 장면이 있습니다. `?debug=true`에서 `window.gameDebug`로 전체 아이템 획득, 엔딩 이동, 초기화를 빠르게 확인할 수 있습니다.

## 이미지와 사운드

완성 일러스트는 `public/assets/rooms/room-1`부터 `room-5`, `public/assets/items`, `documents`, `characters`, `ui`에 배치해 장면 데이터의 URL로 연결합니다.

음원은 `public/audio/`에 `title.mp3`, `lullaby-musicbox.mp3`, `kindergarten.mp3`, `adolescence-piano.mp3`, `exam-guitar.mp3`, `home-strings.mp3`, `drawer-open.mp3`, `item-found.mp3`, `page-turn.mp3`, `rain.mp3` 이름으로 추가합니다. 현재는 음원이 없어도 오류 없이 진행됩니다. 상업 배포 전 직접 제작하거나 사용 허가를 받은 음원만 추가하세요.

## 연락처와 개인정보

Contact Picker API를 지원하는 모바일 브라우저에서는 반드시 사용자의 버튼 클릭 이후 한 명을 선택합니다. 미지원·취소·전화번호 없음 상황에서는 직접 입력으로 전환됩니다. 데스크톱에는 `tel:` 값만 담은 QR이 나타납니다. 전화번호와 편지 내용은 Zustand 영속 저장 대상에 포함하지 않으며 서버, 분석 도구, 로그로 보내지 않습니다. 편지는 메모리에서만 유지되고 사용자가 원할 때 UTF-8 텍스트 파일로 내려받습니다.

Contact Picker API는 Android Chromium 계열의 보안 컨텍스트에서 주로 지원되며 iOS Safari와 다수 데스크톱 브라우저에서는 지원되지 않습니다. 데스크톱의 `tel:` 처리도 운영체제 설정에 따라 다릅니다.

## 접근성, 배포, 제한

핫스폿과 아이콘 버튼에 접근 가능한 이름을 제공하고, 키보드 조작, 포커스 표시, `aria-live`, 44px 이상 터치 영역, 모션 축소 설정, 색 외 상태 문구를 지원합니다. `npm run build` 결과를 Sites/Cloudflare Worker 호환 호스팅에 배포할 수 있습니다.

실제 이미지·음성·복잡한 다이얼/드래그 퍼즐은 MVP 범위에서 CSS 장면과 텍스트 입력으로 표현했습니다. 다음 단계는 ① 방별 일러스트/음향 제작 ② 모달 완전 포커스 트랩과 상세 퍼즐 조작 확장 ③ 실제 기기별 Contact Picker/전화 QA입니다.
