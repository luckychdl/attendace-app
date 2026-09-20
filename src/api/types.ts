/** 앱 전체에서 공유하는 도메인 타입. 서버 스키마와 1:1로 맞춘다. */

export type GeoPoint = {
  latitude: number;
  longitude: number;
  /** 미터 단위 위치 정확도. 기기가 제공하지 않으면 null */
  accuracy?: number | null;
};

export type Employee = {
  id: string;
  /** 사번 */
  employeeNo: string;
  name: string;
  department: string;
  position: string;
};

export type Session = {
  employee: Employee;
  token: string;
};

/** 근무지(사업장). 출퇴근 체크 가능 반경의 기준점 */
export type Worksite = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  /** 출퇴근 체크를 허용하는 반경(미터) */
  radiusMeters: number;
  /** 근무 시작 시각 (0~23) */
  startHour: number;
  startMinute: number;
  /** 근무 종료 시각 (0~23) */
  endHour: number;
  endMinute: number;
};

export type AttendanceStatus =
  | 'working' // 출근만 한 상태
  | 'normal' // 정상 출퇴근
  | 'late' // 지각
  | 'earlyLeave' // 조기 퇴근
  | 'lateAndEarlyLeave'
  | 'missingCheckOut'; // 퇴근 미체크

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  /** 근무일 (YYYY-MM-DD) */
  workDate: string;
  /** ISO 8601 */
  checkInAt: string;
  checkInLocation: GeoPoint | null;
  /** ISO 8601. 퇴근 전이면 null */
  checkOutAt: string | null;
  checkOutLocation: GeoPoint | null;
  /** 근무 시간(분). 퇴근 전이면 null */
  workedMinutes: number | null;
  status: AttendanceStatus;
  /** 비고 (반경 밖 체크 등 예외 사유) */
  note: string | null;
};

export type CheckInput = {
  employeeId: string;
  location: GeoPoint | null;
  /** 근무지 반경 밖에서 체크한 경우 사유 */
  note?: string | null;
};

export type MonthlySummary = {
  /** YYYY-MM */
  month: string;
  workedDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  totalWorkedMinutes: number;
};
