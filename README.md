# 출근체크 (attendance-app)

직원용 출퇴근 체크 앱. React Native + Expo (SDK 57, expo-router).
GPS로 근무지 반경 안에 있는지 확인한 뒤 출근/퇴근을 기록합니다.

## 주요 기능

- **사번 로그인** — 사번 + 비밀번호, 세션은 기기에 저장되어 앱을 다시 켜도 유지됩니다.
- **GPS 출퇴근 체크** — 근무지 좌표와의 거리를 계산해 허용 반경(기본 200m) 안에서만 체크 버튼이 활성화됩니다.
  반경 밖에서는 사유를 남기고 예외 체크(외부 근무/출장)를 할 수 있습니다.
- **오늘 근태 요약** — 실시간 시계, 출근/퇴근 시각, 누적 근무시간, 상태 배지(정상/지각/조기퇴근 등).
- **월별 근태 기록** — 월 이동, 근무일·지각·조기퇴근 집계, 일별 목록.
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

> 위치 권한은 실기기 또는 시뮬레이터의 위치 설정이 필요합니다.
> 시뮬레이터에서는 기본 근무지(서울시청)와 멀어 반경 밖으로 잡히므로,
> **내정보 → 현재 위치를 근무지로 지정**을 눌러 기준점을 옮기면 체크를 테스트할 수 있습니다.

## 서버 연동

`.env.example`를 `.env`로 복사하고 API 주소를 채우면, 화면 코드를 건드리지 않고 실서버로 전환됩니다.

```bash
cp .env.example .env
# EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

주소가 비어 있으면 [src/api/client.ts](src/api/client.ts)의 `USE_MOCK_API`가 `true`가 되고,
API 함수들이 AsyncStorage 기반 로컬 저장소를 사용합니다. 주소를 채우면 아래 엔드포인트로 요청합니다.

| 함수 | 메서드 | 경로 |
| --- | --- | --- |
| `authApi.login` | POST | `/auth/login` |
| `attendanceApi.getToday` | GET | `/attendance/today?employeeId=` |
| `attendanceApi.list` | GET | `/attendance/records?employeeId=&from=&to=` |
| `attendanceApi.summary` | GET | `/attendance/summary?employeeId=&month=` |
| `attendanceApi.checkIn` | POST | `/attendance/check-in` |
| `attendanceApi.checkOut` | POST | `/attendance/check-out` |
| `worksiteApi.get` / `update` | GET / PATCH | `/worksite` |

요청/응답 스키마는 [src/api/types.ts](src/api/types.ts)가 기준입니다.

## 폴더 구조

```
src/
  app/                    # 화면(라우트)만 둔다 — expo-router
    _layout.tsx           #   세션에 따라 로그인/탭 분기
    login.tsx
    (tabs)/               #   출근체크 · 근태기록 · 내정보
  api/                    # 서버 통신 계층 (mock ↔ 실서버 스위치)
    types.ts              #   도메인 타입 = 서버 스키마
    mock/                 #   목 데이터 (실연동 후 삭제)
  hooks/                  # 상태 훅 (인증, 근무지, 위치, 근태)
  features/attendance/    # 출퇴근 화면 전용 컴포넌트
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

## 남은 작업 아이디어

- 관리자 화면 (직원별 근태 조회, 엑셀 내보내기)
- 휴가·연차 신청
- 푸시 알림으로 출근/퇴근 리마인드 (expo-notifications)
- 근무지 다중 등록 (현재는 단일 사업장)
