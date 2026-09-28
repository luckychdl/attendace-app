import { MOCK_EMPLOYEES } from '@/api/mock/employees';
import type { AttendanceRecord, LeaveRequest, LeaveType, Worksite } from '@/api/types';
import { resolveStatus } from '@/lib/attendance-rules';
import { atTime, minutesBetween, toDateKey } from '@/lib/date';
import { countLeaveDays, isWeekend } from '@/lib/leave-rules';
import { localStore } from '@/storage/local-store';

/** 지난 영업일 몇 개를 그럴듯하게 채워 넣을지 */
const SEED_WORKDAYS = 12;

/** 날짜별로 항상 같은 값이 나오는 간단한 해시 (목 데이터 재현성 확보용) */
function pseudoRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100_000;
  }
  return hash / 100_000;
}

/**
 * 처음 로그인한 직원에게 과거 근태 기록을 만들어 준다.
 * 기록 화면과 월간 통계를 바로 확인할 수 있게 하기 위한 데모용 데이터.
 */
export async function seedRecordsIfEmpty(employeeId: string, worksite: Worksite) {
  const records = await localStore.getRecords();
  if (records.some((record) => record.employeeId === employeeId)) return;

  const seeded: AttendanceRecord[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 1); // 어제부터 과거로

  while (seeded.length < SEED_WORKDAYS) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      const workDate = toDateKey(cursor);
      const noise = pseudoRandom(`${employeeId}:${workDate}`);

      // 대부분 정상 출근, 일부는 지각/조기퇴근으로 섞는다.
      const checkInOffset = noise > 0.85 ? 18 : Math.round((noise - 0.5) * 20);
      const checkOutOffset = noise < 0.12 ? -35 : Math.round((noise - 0.4) * 60);

      const checkInAt = atTime(cursor, worksite.startHour, worksite.startMinute + checkInOffset);
      const checkOutAt = atTime(cursor, worksite.endHour, worksite.endMinute + checkOutOffset);

      const base = {
        workDate,
        checkInAt: checkInAt.toISOString(),
        checkOutAt: checkOutAt.toISOString(),
      };

      seeded.push({
        id: `seed-${employeeId}-${workDate}`,
        employeeId,
        ...base,
        checkInLocation: { latitude: worksite.latitude, longitude: worksite.longitude },
        checkOutLocation: { latitude: worksite.latitude, longitude: worksite.longitude },
        workedMinutes: minutesBetween(checkInAt, checkOutAt),
        status: resolveStatus(base, worksite),
        note: null,
      });
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  await localStore.setRecords([...records, ...seeded]);
}

/** 오늘부터 n번째 평일 */
function weekdayAhead(n: number) {
  const cursor = new Date();
  let count = 0;
  while (count < n) {
    cursor.setDate(cursor.getDate() + 1);
    if (!isWeekend(cursor)) count += 1;
  }
  return cursor;
}

/**
 * 휴가 목 데이터. 팀장(1001)으로 들어가면 결재할 거리가 있고,
 * 팀원(1002)으로 들어가면 대기·승인 상태를 모두 볼 수 있게 채운다.
 */
export async function seedLeavesIfEmpty() {
  if ((await localStore.getLeaves()) != null) return;

  const requestedAt = new Date().toISOString();
  const make = (
    employeeNo: string,
    type: LeaveType,
    startOffset: number,
    endOffset: number,
    reason: string,
    approved: boolean,
    time?: { start: string; end: string; hours: number },
  ): LeaveRequest => {
    const employee = MOCK_EMPLOYEES.find((item) => item.employeeNo === employeeNo)!;
    const manager = MOCK_EMPLOYEES.find(
      (item) => item.role === 'manager' && item.department === employee.department,
    );
    const startDate = toDateKey(weekdayAhead(startOffset));
    const endDate = toDateKey(weekdayAhead(endOffset));
    return {
      id: `seed-leave-${employee.id}-${startDate}`,
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      type,
      startDate,
      endDate,
      startTime: time?.start ?? null,
      endTime: time?.end ?? null,
      days: countLeaveDays(type, startDate, endDate, time?.hours ?? null),
      reason,
      status: approved ? 'approved' : 'pending',
      requestedAt,
      decidedAt: approved ? requestedAt : null,
      decidedBy: approved ? (manager?.name ?? null) : null,
    };
  };

  await localStore.setLeaves([
    make('1002', 'halfPm', 3, 3, '병원 진료', true),
    make('1002', 'annual', 8, 9, '가족 여행', false),
    make('1002', 'hourly', 5, 5, '은행 업무', false, { start: '16:00', end: '18:00', hours: 2 }),
    make('1001', 'annual', 12, 12, '개인 용무', true),
    make('2001', 'annual', 5, 6, '이사', false),
  ]);
}
