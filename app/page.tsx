"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { maskPhoneNumber, sanitizePhoneNumber } from "../src/utils/game";
import { diaryPages, Direction, itemIcons, Room, rooms, SceneObject } from "../src/game/rooms";

type Screen = "title" | "intro" | "game" | "ending" | "credits";

type Store={
  room:number;completed:number[];inventory:string[];progress:Record<number,number>;hints:Record<string,number>;
  selectedItem:string|null;sound:boolean;neutral:boolean;finished:boolean;
  setRoom:(n:number)=>void;complete:(r:Room)=>void;advance:(roomId:number,rewards?:string[])=>void;
  hint:(key:string)=>void;selectItem:(item:string|null)=>void;toggleSound:()=>void;setNeutral:(v:boolean)=>void;
  finish:()=>void;reset:()=>void;
};
const useGame=create<Store>()(persist((set)=>({
  room:1,completed:[],inventory:[],progress:{},hints:{},selectedItem:null,sound:true,neutral:false,finished:false,
  setRoom:(room)=>set({room,selectedItem:null}),
  complete:(r)=>set(s=>({completed:s.completed.includes(r.id)?s.completed:[...s.completed,r.id],inventory:s.inventory.includes(r.item)?s.inventory:[...s.inventory,r.item],selectedItem:null})),
  advance:(roomId,rewards=[])=>set(s=>({progress:{...s.progress,[roomId]:(s.progress[roomId]??0)+1},inventory:[...s.inventory,...rewards.filter(item=>!s.inventory.includes(item))],selectedItem:null})),
  hint:(key)=>set(s=>({hints:{...s.hints,[key]:Math.min((s.hints[key]??0)+1,3)}})),
  selectItem:(selectedItem)=>set({selectedItem}),toggleSound:()=>set(s=>({sound:!s.sound})),
  setNeutral:(neutral)=>set({neutral}),finish:()=>set({finished:true}),
  reset:()=>set({room:1,completed:[],inventory:[],progress:{},hints:{},selectedItem:null,finished:false}),
}),{name:"fifth-drawer-save",version:2,storage:createJSONStorage(()=>localStorage),partialize:({room,completed,inventory,progress,hints,selectedItem,sound,neutral,finished})=>({room,completed,inventory,progress,hints,selectedItem,sound,neutral,finished})}));

function Modal({title,children,close}:{title:string;children:React.ReactNode;close:()=>void}){
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>e.key==="Escape"&&close();window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[close]);
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&close()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={close} aria-label="닫기">×</button><p className="eyebrow">기억의 조각</p><h2 id="modal-title">{title}</h2>{children}</section></div>
}

function Title({go}:{go:(s:Screen)=>void}){
 const {completed,neutral,setNeutral,reset}=useGame();const [notice,setNotice]=useState(false);
 return <main className="title-screen"><div className="title-copy"><p className="overline">A QUIET POINT & CLICK MYSTERY</p><h1><span>다섯 번째</span> 서랍</h1><p className="subtitle">The Fifth Drawer</p><div className="rule"/><p className="title-quote">네 개의 서랍은 닫혀 있었다.<br/>다섯 번째만 빼고.</p></div><div className="drawer-menu" aria-label="주 메뉴">
  <button onClick={()=>{reset();setNotice(true)}}><b>01</b><span>새 게임<small>처음부터 기억을 따라갑니다</small></span><i>→</i></button>
  <button disabled={!completed.length} onClick={()=>go("game")}><b>02</b><span>이어하기<small>{completed.length?`${completed.length}개의 기억을 찾았습니다`:"저장된 기억이 없습니다"}</small></span><i>→</i></button>
  <button onClick={()=>setNeutral(!neutral)}><b>03</b><span>호칭 설정<small>{neutral?"소중한 사람":"엄마"}로 표현합니다</small></span><i>{neutral?"중립":"기본"}</i></button>
  <button onClick={()=>go("credits")}><b>04</b><span>크레딧<small>이 이야기를 만든 마음들</small></span><i>→</i></button>
 </div><p className="title-foot">작은 소리와 희미한 흔적을 천천히 살펴보세요.</p>{notice&&<Modal title="어디에도 맞지 않는 열쇠" close={()=>setNotice(false)}><p className="large-copy">오래된 서랍에서 작은 열쇠 하나를 발견했다.<br/>무엇을 여는 열쇠인지는 알 수 없다.</p><p className="paper-note">불을 끄고, 서두르지 말고, 방 안의 흔적을 따라가세요.</p><button className="primary" onClick={()=>go("intro")}>열쇠를 집어 든다 <span>→</span></button></Modal>}</main>
}

function Intro({go}:{go:(s:Screen)=>void}){const[step,setStep]=useState(0);const lines=["오랜만에 부모님의 집을 찾았다.","내가 사용하던 방은 이미 사라지고 없었다.","엄마는 서랍을 정리하다 발견했다며 작은 열쇠 하나를 내게 건넸다.","“이게 네 방에 있던 건데, 어디 열쇠인지는 모르겠다.”"];return <main className="prologue"><div className="clock" aria-hidden="true"><span>XI</span><i/><b>VI</b></div><div className={`ghost-door ${step>=3?"visible":""}`}/><section className="dialogue" aria-live="polite" onClick={()=>step<3?setStep(step+1):go("game")}><p className="eyebrow">{step===3?"엄마":"나"}</p><p>{lines[step]}</p><span>{step===3?"문 열기":"계속"} ↘</span></section></main>}

function Game({go}:{go:(s:Screen)=>void}){
 const store=useGame(),room=rooms[store.room-1],stepIndex=Math.min(store.progress[room.id]??0,room.steps.length-1),step=room.steps[stepIndex];
 const[direction,setDirection]=useState<Direction>("front"),[modal,setModal]=useState<"inspect"|"puzzle"|"hint"|"memory"|null>(null);
 const[selected,setSelected]=useState<SceneObject>(room.objects[0]),[answer,setAnswer]=useState(""),[sequence,setSequence]=useState<string[]>([]),[diaryPage,setDiaryPage]=useState(0),[error,setError]=useState("");
 const solved=store.completed.includes(room.id),dirs:Direction[]=["front","right","back","left"],idx=dirs.indexOf(direction),objectsInView=room.objects.filter(object=>object.direction===direction),selectedIndex=Math.max(0,room.objects.findIndex(object=>object.id===selected.id));
 const hintKey=`${room.id}-${step.id}`,level=store.hints[hintKey]??0;
 const finishStep=()=>{
   store.advance(room.id,step.reward);
   setAnswer("");setSequence([]);setDiaryPage(0);setError("");
   if(stepIndex===room.steps.length-1){store.complete(room);setModal("memory")}
   else setModal(null);
 };
 const checkRequired=()=>{
   const missing=(step.requires??[]).filter(item=>!store.inventory.includes(item));
   if(missing.length){setError(`아직 ${missing.join(", ")}이(가) 필요하다.`);return false}
   if(step.mode==="action"&&step.requires?.length===1&&store.selectedItem!==step.requires[0]){setError(`인벤토리에서 ‘${step.requires[0]}’을(를) 먼저 선택하자.`);return false}
   return true;
 };
 const submit=()=>{
   if(!checkRequired())return;
   const ok=answer.replace(/\s/g,"")===String(step.solution??"").replace(/\s/g,"");
   if(!ok)return setError("아직 맞지 않는다. 주변의 단서를 다시 천천히 살펴보자.");
   finishStep();
 };
 const act=()=>{if(checkRequired())finishStep()};
 const choose=(choice:string)=>{
   const expected=step.solution as string[],next=[...sequence,choice];setSequence(next);setError("");
   if(next.length===expected.length){
     if(next.every((value,i)=>value===expected[i]))finishStep();
     else{setSequence([]);setError("순서가 맞지 않아 처음 위치로 돌아왔다.")}
   }
 };
 const advanceRoom=()=>{setModal(null);setDirection("front");setAnswer("");setSequence([]);setDiaryPage(0);setError("");if(room.id===5){store.finish();go("ending")}else{setSelected(rooms[room.id].objects[0]);store.setRoom(room.id+1)}};
 return <main className="game-shell"><header className="game-header"><div><p>다섯 번째 서랍</p><span>The Fifth Drawer</span></div><div className="chapter"><span>기억 {String(room.id).padStart(2,"0")}</span><strong>{room.era}</strong></div><nav><button onClick={()=>setModal("hint")}>힌트 <em>{level}/3</em></button><button onClick={store.toggleSound} aria-label={store.sound?"소리 끄기":"소리 켜기"}>{store.sound?"♪":"♩"}</button><button onClick={()=>go("title")} aria-label="메뉴">☰</button></nav></header>
 <section className={`scene ${room.palette} view-${direction}`}><div className="scene-wash"/><div className="year-stamp">{room.year}</div><div key={`${room.id}-${direction}`} className="room-art" aria-hidden="true">
 {direction==="front"&&<div className="front-scene"><div className="window"><i/><i/><i/></div><div className="cabinet"><span/><span/><span/><span/><span/></div><div className="furniture"/><div className="lamp"/>{room.id===1&&<div className="mobile">☾ · ✦ · ☁ · ᨒ</div>}</div>}
 {direction==="right"&&<div className="right-scene"><div className="wall-panels"/><div className="picture-frame"><i/><i/><i/></div><div className="side-desk"><span/><span/></div><div className="floor-lamp"/></div>}
 {direction==="back"&&<div className="back-scene"><div className="back-door"><i/></div><div className="wall-clock"><i/><b/></div><div className="hall-rug"/>{room.id===3&&<div className="door-note">밥은 먹어.</div>}</div>}
 {direction==="left"&&<div className="left-scene"><div className="tall-shelf"><span/><span/><span/><span/></div><div className="armchair"/><div className="memory-box"><i/><i/><i/></div>{room.id===5&&<div className="stars">✦　·　✦　·</div>}</div>}
 </div>
 {objectsInView.map((object,objectIndex)=><button key={object.id} style={{left:`${object.x}%`,top:`${object.y}%`}} className={`hotspot ${step.target===object.id?"active-hotspot":""}`} aria-label={`${object.name} 확대 조사하기`} onClick={()=>{setSelected(object);setModal("inspect")}}><span>{objectIndex+1}</span><b>{object.name}</b><em>{step.target===object.id?"현재 단서":"조사하기"}</em></button>)}
 <button className="turn left" onClick={()=>setDirection(dirs[(idx+3)%4])} aria-label="왼쪽 방향 보기">‹</button><button className="turn right" onClick={()=>setDirection(dirs[(idx+1)%4])} aria-label="오른쪽 방향 보기">›</button>
 <div className="view-map" aria-label="방향 선택">{dirs.map((d,i)=><button key={d} className={direction===d?"active":""} onClick={()=>setDirection(d)} aria-label={`${i+1}번 방향 보기`}>{i+1}</button>)}</div><div className="direction-label"><span>◌</span> {direction==="front"?"정면":direction==="right"?"오른쪽":direction==="back"?"뒤쪽":"왼쪽"} · 조사 지점 {objectsInView.length}개</div><div className="puzzle-progress"><span>{stepIndex+1} / {room.steps.length}</span><b>{step.title}</b></div></section>
 <footer className="game-footer"><section className="inventory" aria-label="인벤토리"><p>찾은 물건 <span>{store.inventory.length}</span> <small>사용할 물건을 선택하세요</small></p><div>{store.inventory.length?store.inventory.map(item=><button key={item} className={store.selectedItem===item?"selected":""} onClick={()=>store.selectItem(store.selectedItem===item?null:item)} aria-pressed={store.selectedItem===item} aria-label={`${item}${store.selectedItem===item?" 선택됨":""}`}><i>{itemIcons[item]??"·"}</i><small>{item}</small></button>):[0,1,2,3].map(slot=><button key={slot} disabled aria-label={`빈 칸 ${slot+1}`}><b>{slot+1}</b></button>)}</div></section><section className="inner-voice" aria-live="polite"><p>{solved?"기억이 되돌아왔다.":`지금은 ‘${step.title}’의 단서를 찾아야 한다.`}</p><span>{room.title} · {stepIndex+1}번째 퍼즐</span></section></footer>
 {modal==="inspect"&&<Modal title={selected.name} close={()=>setModal(null)}><div className={`inspect-visual ${room.palette} inspect-${selectedIndex%4}`}><div className="inspect-light"/><div className="inspect-object"><i/><i/><i/></div><span>{String(selectedIndex+1).padStart(2,"0")} / 확대 조사</span><b>{room.icon}</b></div><p className="large-copy">{selected.description}</p><p className="paper-note">{selected.detail}</p>{step.target===selected.id?<button className="primary" onClick={()=>{setModal("puzzle");setError("");setSequence([])}}>{step.title} 시작 <span>→</span></button>:<p className="quiet-status">지금 풀 퍼즐의 직접적인 조작 지점은 아니다. 단서는 기억해 두자.</p>}</Modal>}
 {modal==="puzzle"&&<Modal title={step.title} close={()=>setModal(null)}><p className="large-copy">{step.prompt}</p>
   {step.mode==="sequence"&&<><div className="sequence-display">{(step.solution as string[]).map((_,i)=><i key={i}>{sequence[i]??"?"}</i>)}</div><div className="choice-grid">{step.choices?.map(choice=><button key={choice} onClick={()=>choose(choice)}>{choice}</button>)}</div><button className="text-button" onClick={()=>{setSequence([]);setError("")}}>순서 다시 놓기</button></>}
   {step.mode==="code"&&<label className="answer-field">정답 입력<input autoFocus value={answer} maxLength={20} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="단서에서 찾은 답"/></label>}
   {step.mode==="diary"&&<div className="diary-book"><span>{diaryPage+1} / {diaryPages.length}</span>{diaryPages[diaryPage].map(line=><p key={line}>{line}</p>)}</div>}
   {error&&<p className="error" role="alert">{error}</p>}
   {step.mode==="action"&&<button className="primary" onClick={act}>실행하기 <span>→</span></button>}
   {step.mode==="code"&&<button className="primary" onClick={submit}>확인하기 <span>→</span></button>}
   {step.mode==="diary"&&<button className="primary" onClick={()=>{if(!checkRequired())return;if(diaryPage<diaryPages.length-1)setDiaryPage(diaryPage+1);else finishStep()}}>{diaryPage<diaryPages.length-1?"다음 페이지":"마지막 문장 기억하기"} <span>→</span></button>}
 </Modal>}
 {modal==="hint"&&<Modal title={`${step.title} · 힌트 ${Math.max(1,level)}/3`} close={()=>setModal(null)}><p className="large-copy">{step.hints[Math.max(0,level-1)]}</p><button className="primary" onClick={()=>store.hint(hintKey)}>{level>=3?"마지막 힌트입니다":"조금 더 알려주세요"} <span>＋</span></button></Modal>}
 {modal==="memory"&&<Modal title={`${room.item}을(를) 찾았다`} close={advanceRoom}><div className="found-item">{room.icon}</div>{room.memory.map(line=><p className="memory-line" key={line}>{line}</p>)}{room.letter&&<div className="found-letter"><span>되찾은 글자</span><b>{room.letter}</b></div>}<button className="primary" onClick={advanceRoom}>{room.id===5?"마지막 페이지 넘기기":"다음 기억으로"} <span>→</span></button></Modal>}</main>
}

function Ending({go}:{go:(s:Screen)=>void}){
 const{neutral}=useGame();const[mode,setMode]=useState<"choice"|"phone"|"letter"|"drawers">("choice"),[phone,setPhone]=useState(""),[name,setName]=useState(""),[letter,setLetter]=useState(""),[show,setShow]=useState(false);const clean=sanitizePhoneNumber(phone),canCall=clean.replace(/\D/g,"").length>=7;
 const pick=async()=>{const nav=navigator as Navigator&{contacts?:{select:(p:string[],o:{multiple:boolean})=>Promise<{name?:string[];tel?:string[]}[]>}};if(!nav.contacts?.select)return setMode("phone");try{const c=(await nav.contacts.select(["name","tel"],{multiple:false}))[0];if(c?.tel?.[0]){setPhone(c.tel[0]);setName(c.name?.[0]??"선택한 사람");setMode("phone")}}catch{setMode("phone")}};
 const download=()=>{const blob=new Blob([letter],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="다섯번째서랍_마음의편지.txt";a.click();URL.revokeObjectURL(url)};
 if(mode==="drawers")return <main className="final-screen"><div className="ending-drawers" aria-label="다섯 개의 서랍이 닫힙니다">{rooms.map((r,i)=><div key={r.id} style={{animationDelay:`${i*.35}s`}}><span>{r.icon}</span><b>{r.item}</b></div>)}</div><p className="overline">THE FIFTH DRAWER</p><h1>다섯 번째 서랍은<br/><em>아직 끝나지 않은</em> 우리의 이야기다.</h1><p>사랑은 기억 속에만 남는 것이 아니라<br/>오늘 다시 전할 수 있는 마음이다.</p><button className="primary" onClick={()=>go("credits")}>크레딧 보기 <span>→</span></button></main>;
 return <main className="ending-screen"><section className="ending-copy"><p className="overline">마지막 기억</p><h1>지금 떠오르는<br/><em>사람이 있나요?</em></h1><p>마음은 나중으로 미룰수록<br/>전하기 어려워질지도 모릅니다.</p><blockquote>“{neutral?"언제든지 돌아와도 돼.":"언제든지 돌아와도 돼. 엄마는 늘 여기 있을게."}”</blockquote></section><section className="contact-card">
 {mode==="choice"&&<><p>엄마가 아니어도 괜찮아요.<br/>지금 마음을 전하고 싶은 사람에게 연락해보세요.</p><button className="call-button" onClick={pick}><span>☎</span><b>{neutral?"소중한 사람에게 전화 걸기":"엄마에게 전화 걸기"}</b><i>연락처에서 직접 선택합니다 →</i></button><button className="soft-button" onClick={()=>setMode("letter")}>마음속으로 편지 남기기</button><button className="text-button" onClick={()=>setMode("drawers")}>통화하지 않고 엔딩 보기</button><button className="text-button" onClick={()=>go("game")}>조금 더 머물기</button></>}
 {mode==="phone"&&<><p className="eyebrow">선택한 사람에게 전화를 걸까요?</p><h2>{name||"전화번호 직접 입력"}</h2><label className="answer-field">전화번호<input value={phone} inputMode="tel" autoComplete="tel" onChange={e=>setPhone(e.target.value)} placeholder="010-0000-0000"/></label>{canCall&&<><p className="masked">{show?clean:maskPhoneNumber(clean)} <button onClick={()=>setShow(!show)}>{show?"번호 숨기기":"번호 보기"}</button></p><div className="qr"><QRCodeSVG value={`tel:${clean}`} size={132}/><span>휴대전화 카메라로<br/>QR 코드를 스캔해주세요</span></div></>}<a className={`primary ${!canCall?"disabled":""}`} href={canCall?`tel:${clean}`:undefined}>전화 걸기 <span>→</span></a><button className="text-button" onClick={()=>setMode("choice")}>이전으로</button></>}
 {mode==="letter"&&<><p className="eyebrow">마음속 편지</p><h2>전하지 못했던 말을<br/>이곳에 적어보세요.</h2><textarea value={letter} maxLength={500} onChange={e=>setLetter(e.target.value)} placeholder="천천히, 마음이 가는 만큼…"/><div className="letter-meta"><span>새로고침하면 사라집니다</span><b>{letter.length} / 500</b></div><p>전해지지 못한 마음도 사라지는 것은 아닙니다.</p><button className="primary" disabled={!letter} onClick={download}>내 편지 내려받기 <span>↓</span></button><button className="text-button" onClick={()=>setMode("drawers")}>편지를 마음에 두고 엔딩 보기</button></>}</section></main>
}

function Credits({go}:{go:(s:Screen)=>void}){return <main className="credits"><p className="overline">THE FIFTH DRAWER</p><h1>다섯 번째 서랍</h1><p>기획 · 디자인 · 개발<br/>당신의 기억을 오래 바라본 사람들</p><div className="credit-rule"/><blockquote>네가 기억하지 못하는 순간에도<br/>누군가는 언제나 너를 사랑하고 있었다.</blockquote><button className="primary" onClick={()=>go("title")}>처음으로 <span>↙</span></button></main>}

export default function Page(){const[screen,setScreen]=useState<Screen>("title"),store=useGame();const complete=store.complete,reset=store.reset;useEffect(()=>{if(new URLSearchParams(location.search).get("debug")==="true")(window as Window&{gameDebug?:unknown}).gameDebug={unlockAll:()=>rooms.forEach(complete),ending:()=>setScreen("ending"),reset}},[complete,reset]);return screen==="title"?<Title go={setScreen}/>:screen==="intro"?<Intro go={setScreen}/>:screen==="game"?<Game go={setScreen}/>:screen==="ending"?<Ending go={setScreen}/>:<Credits go={setScreen}/>}
