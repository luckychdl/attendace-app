import type { AttendanceRecord, AttendanceStatus, Worksite } from '@/api/types';
import type { ToneColor } from '@/constants/theme';
import { atTime, fromDateKey, minutesBetween } from '@/lib/date';

/** 지각/조기퇴근 판정 시 허용하는 여유 시간(분) */
export const GRACE_MINUTES = 5;

/** 출퇴근 시각과 근무지 규정을 비교해 근태 상태를 계산한다. */
export function resolveStatus(
  record: Pick<AttendanceRecord, 'workDate' | 'checkInAt' | 'checkOutAt'>,
  worksite: Worksite,
): AttendanceStatus {
  const workDay = fromDateKey(record.workDate);
  const scheduledStart = atTime(workDay, worksite.startHour, worksite.startMinute);
  const scheduledEnd = atTime(workDay, worksite.endHour, worksite.endMinute);

  const isLate = minutesBetween(scheduledStart, record.checkInAt) > GRACE_MINUTES;

  if (!record.checkOutAt) {
    // 오늘 근무일이면 아직 근무 중, 지난 날짜면 퇴근 미체크
    const isToday = workDay.toDateString() === new Date().toDateString();
    return isToday ? 'working' : 'missingCheckOut';
  }

  const isEarlyLeave = minutesBetween(record.checkOutAt, scheduledEnd) > GRACE_MINUTES;

  if (isLate && isEarlyLeave) return 'lateAndEarlyLeave';
  if (isLate) return 'late';
  if (isEarlyLeave) return 'earlyLeave';
  return 'normal';
}

/** 문장 안에서 상태를 부를 때 쓰는 이름 */
export const STATUS_LABEL: Record<AttendanceStatus, string> = {
  working: '근무중',
  normal: '정상',
  late: '지각',
  earlyLeave: '조기퇴근',
  lateAndEarlyLeave: '지각·조기퇴근',
  missingCheckOut: '퇴근 미체크',
};

/** 진행 중은 강조색, 제대로 채운 날은 good, 어긋난 날은 warn, 기록이 빈 날은 muted. */
export const STATUS_TONE: Record<AttendanceStatus, ToneColor> = {
  working: 'accent',
  normal: 'good',
  late: 'warn',
  earlyLeave: 'warn',
  lateAndEarlyLeave: 'warn',
  missingCheckOut: 'muted',
};

/** 정상인 날은 굳이 이름을 붙이지 않는다. 어긋난 날만 글자로 짚어 준다. */
export function exceptionLabel(status: AttendanceStatus) {
  return status === 'normal' || status === 'working' ? null : STATUS_LABEL[status];
}
