/** 날짜/시간 포맷 및 근무시간 계산 유틸. 모두 기기 로컬 타임존 기준 */

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** YYYY-MM-DD */
export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** YYYY-MM */
export function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function fromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** 월 */
export function weekdayName(date: Date) {
  return WEEKDAYS[date.getDay()];
}

/** 2026년 9월 21일 (월) */
export function formatFullDate(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
}

/** 09:04 — 기록이 없으면 대시 하나 */
export function formatTime(value: Date | string | null | undefined) {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** 8시간 32분 */
export function formatDuration(minutes: number | null | undefined) {
  if (minutes == null) return '-';
  const abs = Math.max(0, Math.round(minutes));
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
}

/** 자정부터 몇 분이 지났는지. 하루를 가로축에 얹을 때 쓴다. */
export function minutesOfDay(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.getHours() * 60 + date.getMinutes();
}

export function minutesBetween(from: Date | string, to: Date | string) {
  const start = typeof from === 'string' ? new Date(from) : from;
  const end = typeof to === 'string' ? new Date(to) : to;
  return Math.round((end.getTime() - start.getTime()) / 60_000);
}

/** 해당 날짜의 특정 시:분 Date */
export function atTime(date: Date, hour: number, minute: number) {
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

/** 이번 달 1일 ~ 말일 */
export function monthRange(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return {
    from: toDateKey(new Date(year, month - 1, 1)),
    to: toDateKey(new Date(year, month, 0)),
  };
}

/** monthKey 에서 offset 개월 이동한 monthKey */
export function shiftMonth(monthKey: string, offset: number) {
  const [year, month] = monthKey.split('-').map(Number);
  return toMonthKey(new Date(year, month - 1 + offset, 1));
}
