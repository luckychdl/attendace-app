# 오늘근무 (onwork)

직원용 출퇴근 체크 앱. React Native + Expo (SDK 57, expo-router).
GPS로 근무지 반경 안에 있는지 확인한 뒤 출근/퇴근을 기록합니다.

## 주요 기능

- **회원가입 · 여러 회사** — 회사명을 넣어 가입합니다. 처음 등록하는 회사명이면 회사가 만들어지고 가입자가 관리자가 되며,
  이미 있는 회사명이면 그 회사의 팀원으로 들어갑니다. 직원 · 근무지 · 휴가 결재는 회사별로 따로 돕니다. (실서버 모드)
- **로그인** — 회사명 + 사번 + 비밀번호 (목 모드는 사번 + 비밀번호). 세션은 기기에 저장되어 앱을 다시 켜도 유지됩니다.
- **GPS 출퇴근 체크** — 근무지 좌표와의 거리를 계산해 허용 반경(기본 200m) 안에서만 체크 버튼이 활성화됩니다.
  반경 밖에서는 사유를 남기고 예외 체크(외부 근무/출장)를 할 수 있습니다.
- **오늘 근태 요약** — 실시간 시계, 출근/퇴근 시각, 누적 근무시간, 상태 배지(정상/지각/조기퇴근 등).
- **월별 근태 기록** — 월 이동, 근무일·지각·조기퇴근 집계, 일별 목록. 연차일도 함께 표시됩니다.
- **휴가(연차) 신청·관리** — 잔여 연차 확인, 연차/오전 반차/오후 반차/시차(2시간 단위) 신청(달력에서 기간 선택),
  결재 대기 중이거나 시작 전인 신청 취소. 팀장은 같은 부서 팀원의 신청을 승인/반려합니다.
- **내정보 / 근무지 설정** — 허용 반경 변경, 현재 위치를 근무지 기준점으로 지정, 로그아웃.

## 실행

```bash
npm install
npm start          # 개발 서버 (a: Android, i: iOS, w: Web)
npm run typecheck  # 타입 체크
```

첫 로그인용 데모 계정 (목 모드에서만 동작):

| 사번 | 이름 | 비밀번호 |
| --- | --- | --- |
| 1001 | 김민준 | 1234 |
| 1002 | 이서연 | 1234 |
| 2001 | 박지호 | 1234 |

처음 로그인하면 지난 영업일 12일분의 근태 기록이 목 데이터로 채워집니다.
휴가 목 데이터도 함께 들어가므로, **1001(팀장)** 로 로그인하면 이서연(1002)의 결재 대기 건을 바로 처리해 볼 수 있습니다.

> 위치 권한은 실기기 또는 시뮬레이터의 위치 설정이 필요합니다.
> 시뮬레이터에서는 기본 근무지(서울시청)와 멀어 반경 밖으로 잡히므로,
> **내정보 → 현재 위치를 근무지로 지정**을 눌러 기준점을 옮기면 체크를 테스트할 수 있습니다.

## 서버 연동

서버는 [attendance-app-server](../attendance-app-server)(NestJS + Supabase)입니다. 서버를 먼저 띄운 뒤
`.env`에 주소를 넣고 개발 서버를 다시 시작하면, 화면 코드를 건드리지 않고 실서버로 전환됩니다.

```bash
# 1) 서버 (../attendance-app-server — Supabase 키 설정과 시드는 서버 README 참고)
npm run dev

# 2) 앱
cp .env.example .env
npx expo start -c      # .env 를 바꾼 뒤에는 캐시를 비우고 다시 시작
```

| 실행 환경 | `EXPO_PUBLIC_API_BASE_URL` |
| --- | --- |
| iOS 시뮬레이터 · 웹 | `http://localhost:3000` |
| Android 에뮬레이터 | `http://10.0.2.2:3000` |
| 실기기 | `http://<PC의 LAN IP>:3000` (같은 Wi-Fi) |

주소가 비어 있으면 [src/api/client.ts](src/api/client.ts)의 `USE_MOCK_API`가 `true`가 되고,
API 함수들이 AsyncStorage 기반 로컬 저장소를 사용합니다. 주소를 채우면 아래 엔드포인트로 요청합니다.
로그인을 뺀 모든 요청에는 `Authorization: Bearer <token>`이 붙습니다.

| 함수 | 메서드 | 경로 |
| --- | --- | --- |
| `authApi.signup` | POST | `/auth/signup` |
| `authApi.login` | POST | `/auth/login` |
| `authApi.restore` | GET | `/auth/me` |
| `attendanceApi.getToday` | GET | `/attendance/today?employeeId=` |
| `attendanceApi.list` | GET | `/attendance/records?employeeId=&from=&to=` |
| `attendanceApi.summary` | GET | `/attendance/summary?employeeId=&month=` |
| `attendanceApi.checkIn` | POST | `/attendance/check-in` |
| `attendanceApi.checkOut` | POST | `/attendance/check-out` |
| `worksiteApi.get` / `update` | GET / PATCH | `/worksite` |
| `leaveApi.balance` | GET | `/leave/balance?employeeId=&year=` |
| `leaveApi.list` | GET | `/leave/requests?employeeId=&from=&to=` |
| `leaveApi.inbox` | GET | `/leave/inbox?approverId=` |
| `leaveApi.request` | POST | `/leave/requests` |
| `leaveApi.cancel` | POST | `/leave/requests/:id/cancel` |
| `leaveApi.approve` / `reject` | POST | `/leave/requests/:id/approve` · `/reject` |

요청/응답 스키마는 [src/api/types.ts](src/api/types.ts)가 기준입니다.

실서버 모드에서 달라지는 동작:

- **세션** — 앱을 켤 때 `/auth/me`로 토큰을 확인하고 인사 정보(부서·역할)를 새로 받습니다.
  서버에 닿지 못하면 저장된 세션으로 들어가고, 어느 요청이든 401이 오면 세션을 비우고 로그인 화면으로 돌아갑니다.
- **근무지** — 로그인한 뒤 서버에서 받아 기기에 캐시합니다. 변경은 팀장(`role: 'manager'`)만 할 수 있어,
  팀원의 내정보 화면에는 반경 선택과 "현재 위치를 근무지로 지정"이 보이지 않습니다.
- **오류 문구** — 서버가 실패 응답 본문으로 내려주는 문장을 그대로 알림창에 띄웁니다.
- **판정** — 근무일·지각·연차 일수·공휴일은 서버가 정합니다. 신청 화면이 미리 보여 주는 차감 일수는
  공휴일을 모르므로 실제 값과 다를 수 있습니다.
- **회원가입** — 로그인 화면의 "회사 등록 · 회원가입"에서 가입합니다. 목 모드에는 없습니다.
- 데모 계정은 서버 시드(`npm run seed -- --demo`) 기준으로 회사명 `데모회사`, 사번 1001 · 1002 · 2000 · 2001, 비밀번호 `1234`입니다.

## 폴더 구조

```
src/
  app/                    # 화면(라우트)만 둔다 — expo-router
    _layout.tsx           #   세션에 따라 로그인/탭 분기
    login.tsx
    signup.tsx            #   회원가입 (회사 등록 / 기존 회사에 합류)
    (tabs)/               #   출근체크 · 근태기록 · 휴가 · 내정보
    leave/new.tsx         #   휴가 신청 (모달)
  api/                    # 서버 통신 계층 (mock ↔ 실서버 스위치)
    types.ts              #   도메인 타입 = 서버 스키마
    mock/                 #   목 데이터 (API 주소가 비어 있을 때만 사용)
  hooks/                  # 상태 훅 (인증, 근무지, 위치, 근태)
  features/attendance/    # 출퇴근 화면 전용 컴포넌트
  features/leave/         # 휴가 화면 전용 컴포넌트 (잔여 현황, 기간 달력)
  components/             # 공용 UI
  lib/                    # 순수 함수 (거리 계산, 날짜 포맷, 근태 판정)
  storage/                # AsyncStorage 래퍼
  constants/              # 테마, 근무지 기본값
```

## 근태 판정 규칙

[src/lib/attendance-rules.ts](src/lib/attendance-rules.ts)에서 관리합니다.
근무 시작/종료 시각은 근무지 설정(`Worksite`)을 따르고, 5분(`GRACE_MINUTES`)의 여유를 둡니다.

- 출근이 시작 시각 + 5분 초과 → `지각`
- 퇴근이 종료 시각 - 5분 이전 → `조기퇴근`
- 퇴근 미체크: 당일이면 `근무중`, 지난 날짜면 `퇴근 미체크`
- 반차·시차가 승인된 날은 출근·퇴근 시각에 붙은 휴가만큼 기준 시각이 옮겨집니다.
  09:00–18:00 근무에서 오전 반차면 14:00 출근, 16–18시 시차면 16:00 퇴근, 둘 다면 14:00–16:00 근무가 기준입니다.
  한낮의 시차(예: 10–12시)는 출퇴근 기준을 바꾸지 않습니다.

## 휴가 규칙

[src/lib/leave-rules.ts](src/lib/leave-rules.ts)에서 관리합니다.

- 연간 부여 연차는 목 모드에서 15일 고정(`ANNUAL_LEAVE_DAYS`). 실서버는 근속연수로 계산해 내려준다고 가정합니다.
- 차감 일수는 주말을 뺀 평일 수, 반차는 0.5일, 시차는 시간 ÷ 8 (2시간 = 0.25일). 공휴일은 서버가 판단합니다.
- 시차는 2·4·6시간 중 고르고 정시에 시작합니다. 점심시간(12–13시)은 근무로 치지 않으므로
  끼게 되면 끝나는 시각이 한 시간 밀립니다 (11시 2시간 → 11:00–14:00).
- 반차의 경계는 하루 근무(점심 제외)의 절반이 지난 시각입니다. 09:00–18:00 이면 14:00.
- 잔여 = 부여 − 승인 − 결재 대기. 잔여를 넘는 신청, 지난 날짜·시각, 이미 신청한 휴가와 시간이 겹치는 신청은 거절됩니다.
  (같은 날이라도 시간대가 다르면 — 오전 반차 + 오후 시차처럼 — 함께 쓸 수 있습니다.)
- 결재 대기 중인 신청, 또는 승인됐지만 시작일 전인 신청은 본인이 취소할 수 있습니다.
- 결재자는 같은 부서의 팀장(`role: 'manager'`)입니다. 팀장 본인 신청은 목 모드에서 바로 승인됩니다.

## 남은 작업 아이디어

- 관리자 화면 (직원별 근태 조회, 엑셀 내보내기)
- 푸시 알림으로 출근/퇴근 리마인드 (expo-notifications)
- 근무지 다중 등록 (현재는 단일 사업장)
