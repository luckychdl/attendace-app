import type { LeaveRequest, LeaveStatus, LeaveType, Worksite } from '@/api/types';
import type { ToneColor } from '@/constants/theme';
import { formatMonthDay, fromDateKey, parseClock, toDateKey } from '@/lib/date';

/** 연간 기본 부여 연차(일). 실서버에서는 입사일·근속연수로 계산해 내려준다. */
export const ANNUAL_LEAVE_DAYS = 15;

/** 연차 하루를 몇 시간으로 치는지. 시차 차감의 기준이다. */
export const WORK_HOURS_PER_DAY = 8;

/** 시차는 2시간 단위로 쓴다. */
export const HOURLY_LEAVE_HOURS = [2, 4, 6] as const;

/** 점심시간(자정 기준 분). 근무로 치지 않으므로 시차가 이 구간을 끼면 끝나는 시각이 한 시간 밀린다. */
export const LUNCH = { start: 12 * 60, end: 13 * 60 } as const;

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  annual: '연차',
  halfAm: '오전 반차',
  halfPm: '오후 반차',
  hourly: '시차',
};

export const LEAVE_STATUS_LABEL: Record<LeaveStatus, string> = {
  pending: '결재 대기',
  approved: '승인',
  rejected: '반려',
  cancelled: '취소',
};

/** 기다리는 건 강조색, 확정된 건 good, 되돌려진 건 warn, 스스로 거둔 건 muted. */
export const LEAVE_STATUS_TONE: Record<LeaveStatus, ToneColor> = {
  pending: 'accent',
  approved: 'good',
  rejected: 'warn',
  cancelled: 'muted',
};

/** 반차와 시차는 하루 안에서 끝난다. */
export function isSingleDay(type: LeaveType) {
  return type !== 'annual';
}

export function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** 아직 살아 있는 신청. 잔여 일수를 잡아먹고 다른 신청과 겹치면 안 된다. */
export function isActive(leave: LeaveRequest) {
  return leave.status === 'pending' || leave.status === 'approved';
}

/** startDate ~ endDate 사이의 날짜 키. 양 끝 포함 */
export function datesInRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  const cursor = fromDateKey(startDate);
  const end = fromDateKey(endDate);
  while (cursor <= end) {
    dates.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

// ─── 근무 시간 계산 ───────────────────────────────────────────

export function workStartMinutes(worksite: Worksite) {
  return worksite.startHour * 60 + worksite.startMinute;
}

export function workEndMinutes(worksite: Worksite) {
  return worksite.endHour * 60 + worksite.endMinute;
}

/** from ~ to 사이에서 점심시간을 뺀 근무 분 */
function workMinutesBetween(from: number, to: number) {
  const lunch = Math.max(0, Math.min(to, LUNCH.end) - Math.max(from, LUNCH.start));
  return to - from - lunch;
}

/** from 에서 근무 minutes 분이 지난 시각. 점심시간은 건너뛴다. */
export function addWorkMinutes(from: number, minutes: number) {
  let at = from >= LUNCH.start && from < LUNCH.end ? LUNCH.end : from;
  let left = minutes;
  if (at < LUNCH.start && at + left > LUNCH.start) {
    left -= LUNCH.start - at;
    at = LUNCH.end;
  }
  return at + left;
}

/**
 * 반차의 경계 시각. 하루 근무의 딱 절반이 지난 때다.
 * 09:00–18:00 이면 점심을 빼고 4시간이 지난 14:00.
 */
export function halfDaySplitMinutes(worksite: Worksite) {
  const start = workStartMinutes(worksite);
  return addWorkMinutes(start, workMinutesBetween(start, workEndMinutes(worksite)) / 2);
}

export type TimeSlot = { start: number; end: number };

/**
 * 시차로 고를 수 있는 시간대. 정시에 시작하고, 점심시간에는 시작하지 않으며,
 * 퇴근 시각을 넘지 않는다. 09–18시 2시간이면 09·10·11·13·14·15·16시 시작.
 */
export function hourlySlots(worksite: Worksite, hours: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const endOfDay = workEndMinutes(worksite);
  for (let start = workStartMinutes(worksite); start < endOfDay; start += 60) {
    if (start >= LUNCH.start && start < LUNCH.end) continue;
    const end = addWorkMinutes(start, hours * 60);
    if (end <= endOfDay) slots.push({ start, end });
  }
  return slots;
}

// ─── 차감과 겹침 ──────────────────────────────────────────────

/**
 * 차감 일수. 주말은 세지 않는다. 공휴일은 서버가 판단한다.
 * 반차는 0.5일, 시차는 시간 ÷ 8. 둘 다 평일이어야 센다.
 */
export function countLeaveDays(
  type: LeaveType,
  startDate: string,
  endDate: string,
  hours: number | null = null,
) {
  const weekdays = datesInRange(startDate, endDate).filter(
    (key) => !isWeekend(fromDateKey(key)),
  ).length;
  if (type === 'annual') return weekdays;
  const onWeekday = Math.min(weekdays, 1);
  if (type === 'hourly') return (onWeekday * (hours ?? 0)) / WORK_HOURS_PER_DAY;
  return onWeekday * 0.5;
}

type Occupancy = Pick<LeaveRequest, 'type' | 'startDate' | 'endDate' | 'startTime' | 'endTime'>;

/** 휴가가 하루 중 차지하는 시간대(자정 기준 분). 연차는 하루 전체다. */
export function leaveWindow(
  leave: Pick<Occupancy, 'type' | 'startTime' | 'endTime'>,
  worksite: Worksite,
): TimeSlot {
  switch (leave.type) {
    case 'halfAm':
      return { start: workStartMinutes(worksite), end: halfDaySplitMinutes(worksite) };
    case 'halfPm':
      return { start: halfDaySplitMinutes(worksite), end: workEndMinutes(worksite) };
    case 'hourly':
      return leave.startTime && leave.endTime
        ? { start: parseClock(leave.startTime), end: parseClock(leave.endTime) }
        : { start: 0, end: 0 };
    case 'annual':
      return { start: 0, end: 24 * 60 };
  }
}

/** 두 신청이 같은 날 같은 시간을 차지하는지. 오전 반차와 오후 시차처럼 시간대가 다르면 함께 쓸 수 있다. */
export function overlaps(a: Occupancy, b: Occupancy, worksite: Worksite) {
  if (a.startDate > b.endDate || b.startDate > a.endDate) return false;
  const x = leaveWindow(a, worksite);
  const y = leaveWindow(b, worksite);
  return x.start < y.end && y.start < x.end;
}

/** 본인이 거둘 수 있는 신청. 승인된 건은 시작일 전까지만 취소할 수 있다. */
export function isCancellable(leave: LeaveRequest, today = toDateKey(new Date())) {
  if (leave.status === 'pending') return true;
  return leave.status === 'approved' && leave.startDate > today;
}

// ─── 근태 판정과의 연결 ───────────────────────────────────────

/** 해당 날짜에 걸친 승인된 휴가 */
export function approvedLeavesOn(leaves: LeaveRequest[], employeeId: string, dateKey: string) {
  return leaves.filter(
    (leave) =>
      leave.employeeId === employeeId &&
      leave.status === 'approved' &&
      leave.startDate <= dateKey &&
      leave.endDate >= dateKey,
  );
}

/**
 * 휴가를 뺀 그날의 예정 근무시간(자정 기준 분). 하루를 다 쉬면 null.
 * 출근 시각에 붙은 휴가는 시작을, 퇴근 시각에 붙은 휴가는 끝을 민다.
 * 오전 반차 + 16–18시 시차면 14:00–16:00 근무가 된다. 한낮의 시차는 출퇴근 기준을 바꾸지 않는다.
 */
export function scheduleMinutes(
  worksite: Worksite,
  dayLeaves: readonly Pick<Occupancy, 'type' | 'startTime' | 'endTime'>[] = [],
) {
  const windows = dayLeaves.map((leave) => leaveWindow(leave, worksite));
  let start = workStartMinutes(worksite);
  let end = workEndMinutes(worksite);

  let moved = true;
  while (moved && start < end) {
    moved = false;
    for (const window of windows) {
      if (window.start <= start && window.end > start) {
        start = window.end;
        moved = true;
      }
      if (window.end >= end && window.start < end) {
        end = window.start;
        moved = true;
      }
    }
    // 휴가가 점심시간 앞뒤에서 멈추면 점심을 건너 다음 근무 구간에 붙는다.
    if (start >= LUNCH.start && start < LUNCH.end) {
      start = LUNCH.end;
      moved = true;
    }
    if (end > LUNCH.start && end <= LUNCH.end) {
      end = LUNCH.start;
      moved = true;
    }
  }

  return start < end ? { start, end } : null;
}

// ─── 표기 ─────────────────────────────────────────────────────

/** 연차 · 오전 반차 · 시차 14:00–16:00 */
export function describeLeave(leave: Pick<LeaveRequest, 'type' | 'startTime' | 'endTime'>) {
  if (leave.type === 'hourly' && leave.startTime && leave.endTime) {
    return `시차 ${leave.startTime}–${leave.endTime}`;
  }
  return LEAVE_TYPE_LABEL[leave.type];
}

/** 차감 일수를 시간으로. 0.25일 → 2시간 */
export function formatLeaveHours(days: number) {
  return `${Math.round(days * WORK_HOURS_PER_DAY)}시간`;
}

/** 소수는 필요한 만큼만. 1 · 0.5 · 0.25 · 11.75 */
export function formatDays(days: number) {
  return String(Math.round(days * 1000) / 1000);
}

/** 9월 30일 (수) – 10월 2일 (금). 하루짜리면 한쪽만 */
export function formatLeavePeriod(startDate: string, endDate: string) {
  const start = formatMonthDay(fromDateKey(startDate));
  return startDate === endDate ? start : `${start} – ${formatMonthDay(fromDateKey(endDate))}`;
}
