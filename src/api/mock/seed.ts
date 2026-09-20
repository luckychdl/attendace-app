import type { AttendanceRecord, Worksite } from '@/api/types';
import { resolveStatus } from '@/lib/attendance-rules';
import { atTime, minutesBetween, toDateKey } from '@/lib/date';
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
