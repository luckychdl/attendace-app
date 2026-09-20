import { USE_MOCK_API, request } from '@/api/client';
import type { AttendanceRecord, CheckInput, MonthlySummary, Worksite } from '@/api/types';
import { resolveStatus } from '@/lib/attendance-rules';
import { minutesBetween, monthRange, toDateKey } from '@/lib/date';
import { localStore } from '@/storage/local-store';

export class AttendanceError extends Error {}

function byDateDesc(a: AttendanceRecord, b: AttendanceRecord) {
  return b.workDate.localeCompare(a.workDate);
}

async function mockFindTodayRecord(employeeId: string) {
  const today = toDateKey(new Date());
  const records = await localStore.getRecords();
  return records.find((item) => item.employeeId === employeeId && item.workDate === today) ?? null;
}

export const attendanceApi = {
  /** 오늘자 근태 기록. 아직 출근하지 않았으면 null */
  async getToday(employeeId: string): Promise<AttendanceRecord | null> {
    if (!USE_MOCK_API) {
      return request<AttendanceRecord | null>('/attendance/today', { query: { employeeId } });
    }
    return mockFindTodayRecord(employeeId);
  },

  /** 기간(YYYY-MM-DD) 내 근태 기록. 최신순 */
  async list(employeeId: string, from: string, to: string): Promise<AttendanceRecord[]> {
    if (!USE_MOCK_API) {
      return request<AttendanceRecord[]>('/attendance/records', {
        query: { employeeId, from, to },
      });
    }
    const records = await localStore.getRecords();
    return records
      .filter(
        (item) =>
          item.employeeId === employeeId && item.workDate >= from && item.workDate <= to,
      )
      .sort(byDateDesc);
  },

  /** 월간 집계 (YYYY-MM) */
  async summary(employeeId: string, month: string): Promise<MonthlySummary> {
    if (!USE_MOCK_API) {
      return request<MonthlySummary>('/attendance/summary', { query: { employeeId, month } });
    }
    const { from, to } = monthRange(month);
    const records = await attendanceApi.list(employeeId, from, to);

    return {
      month,
      workedDays: records.length,
      lateDays: records.filter((r) => r.status === 'late' || r.status === 'lateAndEarlyLeave')
        .length,
      earlyLeaveDays: records.filter(
        (r) => r.status === 'earlyLeave' || r.status === 'lateAndEarlyLeave',
      ).length,
      totalWorkedMinutes: records.reduce((sum, r) => sum + (r.workedMinutes ?? 0), 0),
    };
  },

  async checkIn(input: CheckInput, worksite: Worksite): Promise<AttendanceRecord> {
    if (!USE_MOCK_API) {
      return request<AttendanceRecord>('/attendance/check-in', { method: 'POST', body: input });
    }

    const existing = await mockFindTodayRecord(input.employeeId);
    if (existing) {
      throw new AttendanceError('오늘은 이미 출근 체크를 완료했습니다.');
    }

    const now = new Date();
    const workDate = toDateKey(now);
    const base = { workDate, checkInAt: now.toISOString(), checkOutAt: null };

    return localStore.upsertRecord({
      id: `${input.employeeId}-${workDate}`,
      employeeId: input.employeeId,
      ...base,
      checkInLocation: input.location,
      checkOutLocation: null,
      workedMinutes: null,
      status: resolveStatus(base, worksite),
      note: input.note ?? null,
    });
  },

  async checkOut(input: CheckInput, worksite: Worksite): Promise<AttendanceRecord> {
    if (!USE_MOCK_API) {
      return request<AttendanceRecord>('/attendance/check-out', { method: 'POST', body: input });
    }

    const existing = await mockFindTodayRecord(input.employeeId);
    if (!existing) {
      throw new AttendanceError('출근 체크 기록이 없습니다. 먼저 출근 체크를 해주세요.');
    }
    if (existing.checkOutAt) {
      throw new AttendanceError('오늘은 이미 퇴근 체크를 완료했습니다.');
    }

    const now = new Date();
    const updated = {
      ...existing,
      checkOutAt: now.toISOString(),
      checkOutLocation: input.location,
      workedMinutes: minutesBetween(existing.checkInAt, now),
      note: input.note ?? existing.note,
    };

    return localStore.upsertRecord({
      ...updated,
      status: resolveStatus(updated, worksite),
    });
  },
};
