import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("privacy-safe phone and game utilities are present", async () => {
  const source = await readFile("src/utils/game.ts", "utf8");
  assert.match(source, /replace\(\/\\D\/g/);
  assert.match(source, /기억하지/);
  assert.match(source, /items\.includes/);
  assert.match(source, /text\/plain;charset=utf-8/);
});

test("the complete playable flow is represented", async () => {
  const source = await readFile("app/page.tsx", "utf8");
  for (const text of ["새 게임", "이어하기", "영유아기", "어린이집", "사춘기", "대학 입시", "다섯 번째 서랍", "마음속으로 편지 남기기", "전화 걸기"]) {
    assert.match(source, new RegExp(text));
  }
});
