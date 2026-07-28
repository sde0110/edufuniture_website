export type Direction = "front" | "right" | "back" | "left";
export type PuzzleMode = "action" | "code" | "sequence" | "diary";

export type SceneObject = {
  id: string;
  name: string;
  direction: Direction;
  x: number;
  y: number;
  description: string;
  detail: string;
};

export type PuzzleStep = {
  id: string;
  target: string;
  title: string;
  prompt: string;
  mode: PuzzleMode;
  solution?: string | string[];
  choices?: string[];
  requires?: string[];
  reward?: string[];
  result: string;
  hints: string[];
};

export type Room = {
  id: number;
  era: string;
  title: string;
  year: string;
  letter: string;
  item: string;
  icon: string;
  palette: string;
  objects: SceneObject[];
  steps: PuzzleStep[];
  memory: string[];
};

export const diaryPages = [
  ["처음 뒤집은 날", "처음 걸은 날", "작은 발로 거실 끝까지 걸어왔다."],
  ["어린이집에서 울지 않은 날", "처음 혼자 잔 날", "기특하면서도 조금 서운했다."],
  ["말을 점점 하지 않는다.", "기다려줘야 할 것 같다.", "문밖에서라도 기다리기로 했다."],
  ["시험이 얼마 남지 않았다.", "힘들어 보여서 묻지 못했다.", "밥이라도 따뜻하게 해두었다."],
  ["오늘 집을 떠났다.", "잘 살겠지.", "방은 당분간 그대로 두기로 했다."],
  ["방을 정리했다.", "책상 자국이 오래 남아 있었다.", "네가 ______ 못해도 우리는 네 모든 날을 기억한다."],
];

export const rooms: Room[] = [
  {
    id: 1, era: "영유아기", title: "아주 작은 나의 방", year: "1998", letter: "기",
    item: "모빌의 별", icon: "✦", palette: "nursery",
    objects: [
      {id:"crib",name:"거대한 아기 침대",direction:"front",x:28,y:56,description:"아기의 눈높이에서는 난간이 작은 벽처럼 높다.",detail:"난간 사이로 크림색 담요와 오래된 딸랑이가 보인다."},
      {id:"teddy",name:"커다란 곰 인형",direction:"front",x:62,y:57,description:"몸통만 한 단추가 배에 나란히 달려 있다.",detail:"단추는 셋. 첫 번째 숫자 단서일지도 모른다."},
      {id:"mobile",name:"달·별·구름·새 모빌",direction:"front",x:48,y:23,description:"천천히 도는 모빌 아래에 작은 태엽 구멍이 있다.",detail:"별 장식은 모두 일곱 개다."},
      {id:"rocker",name:"흔들의자",direction:"right",x:34,y:58,description:"누군가 방금 일어난 듯 의자가 아주 조금 흔들린다.",detail:"방석 틈에 금속성 물건이 반짝인다."},
      {id:"lamp",name:"따뜻한 스탠드",direction:"right",x:70,y:35,description:"노란 빛이 방을 포근하게 감싸고 있다.",detail:"낡은 갓에는 손으로 꿰맨 작은 별무늬가 있다."},
      {id:"family-photo",name:"가족사진",direction:"right",x:64,y:57,description:"사진 속에는 세 사람이 서로 기대어 서 있다.",detail:"사진 가장자리에 필름을 끼울 만한 얇은 홈이 있다."},
      {id:"toy-box",name:"그림 버튼 장난감 상자",direction:"back",x:30,y:61,description:"달, 별, 구름, 새 그림 버튼이 달린 나무 상자다.",detail:"버튼 다섯 개를 올바른 순서로 눌러야 열릴 것 같다."},
      {id:"bottle",name:"빈 젖병 자리",direction:"back",x:69,y:65,description:"선반의 둥근 먼지 자국만 비어 있다.",detail:"원래 이곳에 젖병이 놓여 있었던 것 같다."},
      {id:"dresser",name:"세 자리 서랍장",direction:"left",x:44,y:55,description:"황동 다이얼 세 개가 달린 낮은 서랍장이다.",detail:"곰의 단추, 사진 속 사람, 모빌의 별 순서로 생각해 보자."},
      {id:"night-note",name:"빛바랜 자장가 카드",direction:"left",x:72,y:35,description:"삐뚤빼뚤한 글씨로 자장가 한 소절이 적혀 있다.",detail:"마지막 줄 옆에 ‘새벽’이라는 단어가 동그라미 쳐져 있다."},
    ],
    steps: [
      {id:"handle",target:"rocker",title:"방석 틈의 반짝임",prompt:"방석을 들어 올려 안쪽을 살펴보자.",mode:"action",reward:["태엽 손잡이"],result:"작고 차가운 태엽 손잡이를 찾았다.",hints:["흔들리는 가구를 살펴보자.","흔들의자의 방석 틈을 확인하자.","흔들의자를 조사하면 태엽 손잡이를 얻는다."]},
      {id:"wind-mobile",target:"mobile",title:"멈춰 있던 모빌",prompt:"태엽 손잡이를 끼워 천천히 돌려 보자.",mode:"action",requires:["태엽 손잡이"],result:"달 → 별 → 별 → 구름 → 새가 차례로 빛났다.",hints:["방금 얻은 금속 물건이 맞는 곳이 있다.","모빌 아래 태엽 구멍을 보자.","태엽 손잡이를 모빌에 사용한다."]},
      {id:"toy-sequence",target:"toy-box",title:"모빌이 보여준 순서",prompt:"빛난 장식과 같은 순서로 그림 버튼을 누르자.",mode:"sequence",choices:["달","별","구름","새"],solution:["달","별","별","구름","새"],reward:["젖병","필름 조각"],result:"상자가 열리고 젖병과 투명한 필름 조각이 나왔다.",hints:["모빌에서 빛난 장식을 기억하자.","별은 연속으로 두 번이었다.","달 → 별 → 별 → 구름 → 새"]},
      {id:"drawer-337",target:"dresser",title:"새벽의 숫자",prompt:"곰 인형 단추 · 가족사진 속 사람 · 모빌의 별을 차례로 세자.",mode:"code",solution:"337",result:"새벽 3시 37분. 많이 울었지만 우유를 먹고 잠들었다. 네가 숨 쉬는 걸 확인하고 나서야 나도 잠들었다.",hints:["방 안에서 셀 수 있는 세 가지다.","곰, 사진, 별의 순서다.","정답은 337이다."]},
      {id:"film-memory",target:"family-photo",title:"사진 위의 또 다른 장면",prompt:"사진 가장자리의 홈에 필름 조각을 끼워 보자.",mode:"action",requires:["필름 조각"],result:"겹쳐진 필름 속에서 흔들의자와 아이를 안은 따뜻한 실루엣이 이어졌다.",hints:["투명한 조각이 들어갈 얇은 홈이 있다.","필름 조각을 가족사진에 사용하자.","가족사진을 조사해 필름을 겹친다."]},
    ],
    memory:["나는 이 밤을 기억하지 못한다.","엄마는 내가 조용히 숨 쉬는 걸 확인하고서야 잠들었다."],
  },
  {
    id: 2, era: "어린이집", title: "비 오는 날의 교실", year: "2003", letter: "억",
    item: "네잎클로버", icon: "♧", palette: "classroom",
    objects: [
      {id:"blackboard",name:"그림이 가득한 칠판",direction:"front",x:49,y:34,description:"집, 토끼, 우산 그림 아래 서로 다른 색의 표시가 있다.",detail:"사물함 이름표와 이어지는 단서 같다."},
      {id:"tables",name:"낮은 책상과 의자",direction:"front",x:33,y:66,description:"작은 의자들이 비뚤게 밀려 있다.",detail:"한 자리 아래에 보라색 크레파스가 굴러다닌다."},
      {id:"name-tags",name:"떨어진 이름표",direction:"front",x:72,y:68,description:"별, 토끼, 우산, 집 그림이 붙은 이름표 네 장이다.",detail:"칠판 그림과 사물함 표시를 맞추면 주인공의 자리를 찾을 수 있다."},
      {id:"lockers",name:"원아 사물함",direction:"right",x:45,y:49,description:"낮은 사물함마다 그림 스티커가 붙어 있다.",detail:"집 → 우산 → 토끼 → 별 순서로 빈자리가 이어진다."},
      {id:"nap-bedding",name:"낮잠 이불",direction:"right",x:73,y:65,description:"작은 이불이 가지런히 접혀 있다.",detail:"한 이불 위에 투명 필름이 놓여 있다."},
      {id:"notebook",name:"원아수첩",direction:"right",x:27,y:62,description:"선생님의 기록 아래 흐릿하게 지워진 답글이 있다.",detail:"지우개와 투명 필름, 색연필을 순서대로 사용하면 글씨가 드러날 것 같다."},
      {id:"toy-kitchen",name:"장난감 주방",direction:"back",x:29,y:50,description:"작은 싱크대와 냄비, 접시가 정돈돼 있다.",detail:"접시 아래에 지우개가 숨겨져 있다."},
      {id:"lunch-box",name:"장난감 도시락",direction:"back",x:62,y:62,description:"김, 달걀, 당근, 멸치 모양 반찬이 흩어져 있다.",detail:"원아수첩 그림 순서대로 담으면 바닥이 열릴 것 같다."},
      {id:"dolls",name:"인형과 크레파스",direction:"back",x:78,y:36,description:"곰 인형이 색연필 한 자루를 안고 있다.",detail:"수첩의 숨은 답글을 드러내는 마지막 도구다."},
      {id:"rain-window",name:"비 오는 창문",direction:"left",x:50,y:39,description:"빗물이 유리 위를 길게 흘러 바깥이 흐릿하다.",detail:"교실 수건으로 닦으면 밖을 볼 수 있을 것 같다."},
    ],
    steps: [
      {id:"tags",target:"name-tags",title:"내 이름표의 자리",prompt:"칠판과 사물함 그림을 따라 이름표를 배치하자.",mode:"sequence",choices:["집","우산","토끼","별"],solution:["집","우산","토끼","별"],reward:["원아수첩"],result:"마지막 사물함에서 빛바랜 원아수첩을 찾았다.",hints:["칠판의 그림과 사물함 표시를 비교하자.","집 그림에서 시작한다.","집 → 우산 → 토끼 → 별"]},
      {id:"notebook-replies",target:"notebook",title:"지워진 답글",prompt:"흐릿한 답글을 드러낼 도구를 올바른 순서로 사용하자.",mode:"sequence",choices:["지우개","투명 필름","색연필"],solution:["지우개","투명 필름","색연필"],requires:["원아수첩"],result:"‘좋아하는 김을 조금 보내겠습니다. 억지로 먹이지 않으셔도 괜찮습니다.’라는 답글이 나타났다.",hints:["세 도구 모두 교실 안에 보였다.","지우고, 덮고, 따라 그린다.","지우개 → 투명 필름 → 색연필"]},
      {id:"lunch",target:"lunch-box",title:"오늘의 도시락",prompt:"원아수첩 속 그림 순서대로 반찬을 담자.",mode:"sequence",choices:["김","달걀","당근","멸치"],solution:["김","달걀","당근","멸치"],reward:["교실 수건"],result:"도시락 밑바닥에서 네잎클로버와 ‘오늘도 씩씩하게 다녀오자’라는 메모가 나왔다.",hints:["수첩 답글에는 좋아하는 반찬이 적혀 있다.","김부터 시작해 보자.","김 → 달걀 → 당근 → 멸치"]},
      {id:"window-memory",target:"rain-window",title:"유리창 너머",prompt:"교실 수건으로 빗물을 천천히 닦아 내자.",mode:"action",requires:["교실 수건"],result:"우산을 든 사람이 아이들이 나오기 전부터 창밖에 서 있었다.",hints:["비 때문에 바깥이 잘 보이지 않는다.","도시락에서 얻은 수건을 사용하자.","비 오는 창문을 조사한다."]},
    ],
    memory:["나는 엄마가 늦게 왔다고 기억했다.","하지만 엄마는 내가 나오기 전부터 기다리고 있었다."],
  },
  {
    id: 3, era: "사춘기", title: "닫힌 문 앞", year: "2011", letter: "하",
    item: "숟가락", icon: "⌇", palette: "hallway",
    objects: [
      {id:"closed-door",name:"굳게 닫힌 방문",direction:"front",x:50,y:43,description:"손잡이를 돌려도 문은 열리지 않는다.",detail:"이 문은 열 수 없다. 누군가의 마음은 억지로 열 수 없으니까."},
      {id:"hall-chair",name:"방문 앞 의자",direction:"front",x:72,y:63,description:"부엌에서 가져온 듯한 낡은 의자다.",detail:"문 앞에 놓으면 누군가 오래 앉아 기다릴 수 있겠다."},
      {id:"schedule",name:"가족 일정표",direction:"right",x:24,y:35,description:"오늘 날짜에 작은 생일 표시가 있다.",detail:"케이크를 준비하며 남긴 흔적들이 그림으로 표시돼 있다."},
      {id:"fridge",name:"냉장고",direction:"right",x:67,y:45,description:"문에는 장보기 영수증과 밀가루 묻은 손자국이 남아 있다.",detail:"초, 성냥, 밀가루, 불, 시간의 순서를 암시한다."},
      {id:"cake",name:"찌그러진 케이크 상자",direction:"right",x:47,y:66,description:"급하게 들고 온 듯 한쪽이 살짝 눌려 있다.",detail:"다섯 개의 작은 그림 자물쇠가 달려 있다."},
      {id:"table-food",name:"차려진 생일상",direction:"back",x:35,y:61,description:"미역국, 계란말이, 멸치볶음, 김치, 생선구이가 식어 간다.",detail:"빈 자리를 기다리듯 수저 한 벌만 놓이지 않았다."},
      {id:"microwave",name:"전자레인지 기록",direction:"back",x:73,y:38,description:"사용 기록이 네 줄 남아 있다.",detail:"18:20 · 19:10 · 20:05 · 21:30"},
      {id:"kitchen-clock",name:"주방시계 서랍",direction:"back",x:70,y:63,description:"시계 아래 네 칸짜리 시간 다이얼이 있다.",detail:"전자레인지에 국을 데운 시간 순서를 그대로 입력해야 한다."},
      {id:"stove",name:"작은 가스레인지 불",direction:"left",x:30,y:53,description:"가장 약한 불로 오래 끓인 흔적이 남아 있다.",detail:"케이크 단서의 네 번째 장면이다."},
      {id:"hallway",name:"조용한 복도",direction:"left",x:67,y:46,description:"부엌의 따뜻한 빛이 닫힌 문 앞까지 길게 이어진다.",detail:"발소리 대신 시계 초침만 들리는 듯하다."},
    ],
    steps: [
      {id:"door",target:"closed-door",title:"열리지 않는 문",prompt:"손잡이를 한 번 더 잡아 본다.",mode:"action",result:"문은 열리지 않았다. 하지만 문 아래로 따뜻한 부엌빛이 가늘게 스며든다.",hints:["가장 먼저 닫힌 문을 확인하자.","문을 여는 것이 이 방의 목표는 아니다.","방문을 조사하고 물러난다."]},
      {id:"cake-order",target:"cake",title:"생일 케이크",prompt:"주방에 남은 준비 흔적을 시간 순서대로 누르자.",mode:"sequence",choices:["초","성냥","밀가루","가스불","전자레인지"],solution:["밀가루","가스불","전자레인지","초","성냥"],result:"상자가 열렸다. 눌린 케이크 위에 ‘방에서 나오면 불자’라고 적혀 있다.",hints:["케이크는 만들고, 식힌 뒤, 장식하고 불을 붙인다.","밀가루 자국에서 시작한다.","밀가루 → 가스불 → 전자레인지 → 초 → 성냥"]},
      {id:"soup-times",target:"kitchen-clock",title:"반복해서 데운 국",prompt:"전자레인지 기록을 이른 시각부터 차례로 입력하자.",mode:"sequence",choices:["18:20","19:10","20:05","21:30"],solution:["18:20","19:10","20:05","21:30"],reward:["숟가락과 쪽지"],result:"서랍 안 쪽지에는 ‘화를 내고 문을 닫았지만 배가 고프면 나오겠지. 국이 너무 짜지 않았으면 좋겠다.’라고 적혀 있다.",hints:["전자레인지 기록 네 줄을 보자.","가장 이른 시각은 18:20이다.","18:20 → 19:10 → 20:05 → 21:30"]},
      {id:"chair-memory",target:"hall-chair",title:"기다리던 자리",prompt:"의자를 닫힌 방문 앞으로 옮겨 놓자.",mode:"action",requires:["숟가락과 쪽지"],result:"의자 위에 잠시 따뜻한 실루엣이 겹치고, 문 너머를 향한 작은 목소리가 들린다. “밥은 먹어.”",hints:["누군가 기다릴 수 있는 자리가 필요하다.","방문 앞 의자를 옮겨 보자.","의자를 조사해 문 앞에 놓는다."]},
    ],
    memory:["나는 엄마가 나를 내버려두었다고 생각했다.","엄마는 내가 열어주지 않는 문 앞에서 기다리고 있었다."],
  },
  {
    id: 4, era: "대학 입시", title: "불 꺼지지 않는 책상", year: "2016", letter: "지",
    item: "낡은 손목시계", icon: "◷", palette: "study",
    objects: [
      {id:"books",name:"빽빽한 수험서",direction:"front",x:27,y:55,description:"책등마다 형광펜 색과 숫자가 표시돼 있다.",detail:"국어 2 · 수학 4 · 영어 0 · 탐구 7"},
      {id:"workbook",name:"접힌 문제집",direction:"front",x:52,y:63,description:"제목의 첫 글자와 접힌 페이지 번호가 나란히 보인다.",detail:"책 네 권을 계획표 순서로 놓으면 숫자 2407이 된다."},
      {id:"study-plan",name:"달력과 학습계획표",direction:"front",x:72,y:31,description:"오늘 할 일 옆에 문제집 네 권의 색이 순서대로 칠해져 있다.",detail:"책상 서랍 비밀번호의 순서를 알려 준다."},
      {id:"desk-drawer",name:"책상 서랍",direction:"right",x:38,y:61,description:"네 자리 숫자 자물쇠가 달려 있다.",detail:"문제집 제목과 접힌 페이지를 계획표 순서로 조합하자."},
      {id:"phone",name:"꺼진 휴대전화",direction:"right",x:64,y:55,description:"배터리가 완전히 닳아 화면이 켜지지 않는다.",detail:"옆면 충전 단자는 아직 멀쩡하다."},
      {id:"charger",name:"비어 있는 충전기 자리",direction:"right",x:76,y:68,description:"먼지 자국만 남고 케이블은 보이지 않는다.",detail:"책상 서랍 안에 들어 있을지도 모른다."},
      {id:"computer",name:"잠긴 컴퓨터",direction:"back",x:43,y:42,description:"수험번호와 마지막 메시지 시각을 요구한다.",detail:"두 숫자를 붙여 여덟 자리로 입력해야 한다."},
      {id:"admission-card",name:"수험표 받침",direction:"back",x:70,y:63,description:"투명 받침에 ‘수험번호’라는 각인만 남아 있다.",detail:"수험표를 찾으면 컴퓨터 잠금의 앞 네 자리를 알 수 있다."},
      {id:"watch",name:"멈춘 손목시계",direction:"left",x:38,y:66,description:"책상 아래로 굴러 들어간 낡은 손목시계다.",detail:"시계줄 안쪽에 접힌 수리점 영수증이 끼워져 있다."},
      {id:"receipt",name:"수리점 영수증",direction:"left",x:62,y:54,description:"수리 취소. 사유: 원서 접수비 사용.",detail:"누군가의 포기가 조용히 이 방의 시간을 멈춰 세웠다."},
    ],
    steps: [
      {id:"workbook-code",target:"desk-drawer",title:"문제집 페이지",prompt:"학습계획표 순서로 문제집의 접힌 페이지 숫자를 입력하자.",mode:"code",solution:"2407",reward:["수험표 2407","휴대전화 충전기"],result:"서랍에서 수험표와 휴대전화 충전기를 찾았다.",hints:["문제집 네 권의 접힌 페이지를 보자.","계획표의 색 순서대로 조합한다.","정답은 2407이다."]},
      {id:"phone-messages",target:"phone",title:"전송되지 않은 메시지",prompt:"서랍에서 찾은 충전기를 휴대전화에 연결하자.",mode:"action",requires:["휴대전화 충전기"],result:"‘비 오니까 우산 챙겨. 밥은 냉장고에 있어. 결과가 어떻든 괜찮아.’ 전송되지 않은 마지막 메시지는 11:47이었다.",hints:["휴대전화는 배터리가 없다.","서랍에서 얻은 충전기를 사용하자.","꺼진 휴대전화를 조사한다."]},
      {id:"computer-lock",target:"computer",title:"합격 발표",prompt:"수험번호와 마지막 메시지 시각을 붙여 입력하자.",mode:"code",solution:"24071147",result:"합격을 축하합니다. 문밖에서 울음 섞인 통화가 들린 뒤, 담담한 목소리가 이어졌다. “고생했다. 밥 먹자.”",hints:["앞 네 자리는 수험표, 뒤 네 자리는 메시지 시각이다.","수험번호는 2407, 시각은 1147이다.","정답은 24071147이다."]},
      {id:"watch-memory",target:"watch",title:"멈춘 시간",prompt:"손목시계 안쪽에 끼워진 영수증을 펼쳐 보자.",mode:"action",result:"수리 취소. 사유: 원서 접수비 사용. 시계는 멈췄지만 누군가의 응원은 멈추지 않았다.",hints:["책상 아래에 작은 금속 물건이 있다.","멈춘 손목시계를 살펴보자.","손목시계 안쪽 영수증을 펼친다."]},
    ],
    memory:["그날 나는 내 노력이 결실을 맺었다고 생각했다.","그 노력 뒤에 누군가의 포기가 있었다는 건 몰랐다."],
  },
  {
    id: 5, era: "현재", title: "내 방이 사라진 본가", year: "오늘", letter: "",
    item: "성장일기", icon: "▤", palette: "home",
    objects: [
      {id:"living-room",name:"따뜻한 거실",direction:"front",x:48,y:60,description:"TV 앞 소파에 두 사람의 뒷모습이 나란히 앉아 있다.",detail:"얼굴은 보이지 않지만 오래 함께한 자세만은 선명하다."},
      {id:"tv-video",name:"잡음 섞인 가족영상",direction:"front",x:48,y:35,description:"오래된 영상이 눈처럼 흔들린다.",detail:"사진 순서를 맞추면 영상의 시간이 다시 이어질 것 같다."},
      {id:"photo-cabinet",name:"가족사진 장식장",direction:"right",x:39,y:48,description:"서로 다른 시기의 사진 다섯 장이 뒤섞여 있다.",detail:"아기, 어린이집, 생일, 대학, 최근 사진을 시간순으로 놓아야 한다."},
      {id:"old-dresser",name:"오래된 다섯 칸 서랍장",direction:"right",x:70,y:58,description:"맨 아래 다섯 번째 서랍만 손가락 하나만큼 열려 있다.",detail:"네 개의 기억 물건을 올려놓을 홈이 보인다."},
      {id:"former-door",name:"내 방이 있던 문",direction:"back",x:31,y:42,description:"문은 그대로지만 안쪽은 이제 옷방이다.",detail:"문 뒤에 떼어 낸 스티커의 하얀 자국이 남아 있다."},
      {id:"closet-room",name:"옷방이 된 공간",direction:"back",x:68,y:51,description:"옷 사이로 예전 벽지 한 조각이 보인다.",detail:"가구는 사라졌지만 공간의 크기는 몸이 먼저 기억한다."},
      {id:"traces",name:"사라진 방의 네 흔적",direction:"back",x:50,y:67,description:"키 자국, 책상 눌림, 스티커 자국, 야광별이 서로 다른 곳에 남았다.",detail:"낮은 곳에서 높은 곳으로 기억을 따라가 보자."},
      {id:"height-marks",name:"벽의 키 측정 자국",direction:"left",x:24,y:42,description:"연도와 함께 작은 선들이 위로 자라 있다.",detail:"사라진 방을 찾는 첫 번째 흔적이다."},
      {id:"desk-imprint",name:"바닥의 책상 눌림",direction:"left",x:45,y:69,description:"장판에 네모난 가구 자국이 희미하게 남아 있다.",detail:"두 번째 흔적이다."},
      {id:"ceiling-stars",name:"천장의 야광별",direction:"left",x:68,y:22,description:"낮인데도 몇 개의 별이 희미하게 빛난다.",detail:"네 번째 흔적이자, 첫 번째 방의 모빌과 닮은 마지막 표식이다."},
      {id:"diary",name:"잠긴 성장일기",direction:"left",x:72,y:61,description:"작은 열쇠 구멍이 있는 두꺼운 기록장이다.",detail:"사라진 방의 흔적을 모두 따라가면 열쇠를 찾을 수 있을 것 같다."},
    ],
    steps: [
      {id:"trace-order",target:"traces",title:"사라진 방의 흔적",prompt:"남아 있는 흔적을 기억의 시간 순서대로 조사하자.",mode:"sequence",choices:["키 측정 자국","책상 눌림","스티커 자국","천장 야광별"],solution:["키 측정 자국","책상 눌림","스티커 자국","천장 야광별"],reward:["작은 일기 열쇠"],result:"벽의 얇은 틈이 열리고 작은 일기 열쇠가 나왔다.",hints:["벽과 바닥, 문 뒤와 천장을 차례로 보자.","키 자국에서 시작해 별에서 끝난다.","키 측정 → 책상 눌림 → 스티커 → 천장 야광별"]},
      {id:"photo-order",target:"photo-cabinet",title:"흩어진 가족사진",prompt:"사진 다섯 장을 오래된 것부터 최근 순서로 놓자.",mode:"sequence",choices:["아기","어린이집","생일","대학","최근 부모님"],solution:["아기","어린이집","생일","대학","최근 부모님"],result:"TV 영상의 잡음이 사라졌다. “나중에 네가 크면 이걸 볼까?” “엄마도 같이 봐야지.”",hints:["가장 어린 모습부터 시작한다.","생일 사진은 어린이집 다음, 대학 전이다.","아기 → 어린이집 → 생일 → 대학 → 최근 부모님"]},
      {id:"four-items",target:"old-dresser",title:"네 가지 기억의 물건",prompt:"지금까지 얻은 별, 클로버, 숟가락, 손목시계를 네 홈에 차례로 놓자.",mode:"action",requires:["모빌의 별","네잎클로버","숟가락","낡은 손목시계"],result:"물건 아래에서 ‘기 · 억 · 하 · 지’ 네 글자가 차례로 드러났다.",hints:["앞선 네 방에서 얻은 물건이 필요하다.","별, 클로버, 숟가락, 손목시계 순서다.","인벤토리의 네 기억 물건을 서랍에 놓는다."]},
      {id:"diary-pages",target:"diary",title:"성장일기",prompt:"작은 열쇠로 일기를 열고, 마지막 기록까지 직접 넘겨 보자.",mode:"diary",requires:["작은 일기 열쇠"],result:"마지막 페이지에 한 문장이 빈칸으로 남아 있다.",hints:["흔적을 따라 얻은 작은 열쇠를 쓰자.","일기 페이지를 끝까지 넘긴다.","마지막 페이지의 빈칸을 읽는다."]},
      {id:"final-answer",target:"old-dresser",title:"다섯 번째 서랍",prompt:"‘네가 ______ 못해도 우리는 네 모든 날을 기억한다.’ 빈칸을 채우자.",mode:"code",solution:"기억하지",result:"다섯 번째 서랍 안에서 가족사진과 오래 접힌 편지가 모습을 드러냈다.",hints:["네 물건 아래에서 드러난 글자를 이어 보자.","기 · 억 · 하 · 지를 한 단어로 쓴다.","정답은 기억하지다."]},
    ],
    memory:["나는 사랑을 찾기 위해 다섯 개의 방을 지나왔다.","하지만 그 사랑은 서랍 속에 숨겨져 있던 것이 아니었다.","내가 기억하지 못했던 날에도, 내가 문을 닫았던 날에도, 사랑은 계속 그 자리에 있었다."],
  },
];

export const itemIcons: Record<string, string> = {
  "태엽 손잡이":"⌁","젖병":"♙","필름 조각":"▧","모빌의 별":"✦",
  "원아수첩":"▤","교실 수건":"▱","네잎클로버":"♧",
  "숟가락과 쪽지":"⌇","숟가락":"⌇",
  "수험표 2407":"▣","휴대전화 충전기":"⌁","낡은 손목시계":"◷",
  "작은 일기 열쇠":"⚿","성장일기":"▤",
};
