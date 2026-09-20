import { useCallback, useEffect, useState } from 'react';

import { AttendanceError, attendanceApi } from '@/api/attendance';
import type { AttendanceRecord, GeoPoint, MonthlySummary, Worksite } from '@/api/types';
import { monthRange } from '@/lib/date';

export type CheckContext = {
  location: GeoPoint | null;
  /** 반경 밖에서 체크한 경우 남길 사유 */
  note?: string | null;
};

/** 오늘의 출퇴근 상태와 체크 액션 */
export function useTodayAttendance(employeeId: string, worksite: Worksite) {
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setRecord(await attendanceApi.getToday(employeeId));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '기록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const submit = useCallback(
    async (kind: 'in' | 'out', context: CheckContext) => {
      setSubmitting(true);
      setError(null);
      try {
        const input = { employeeId, location: context.location, note: context.note ?? null };
        const next =
          kind === 'in'
            ? await attendanceApi.checkIn(input, worksite)
            : await attendanceApi.checkOut(input, worksite);
        setRecord(next);
        return next;
      } catch (caught) {
        const message =
          caught instanceof AttendanceError || caught instanceof Error
            ? caught.message
            : '체크에 실패했습니다.';
        setError(message);
        throw caught;
      } finally {
        setSubmitting(false);
      }
    },
    [employeeId, worksite],
  );

  const checkedIn = record != null;
  const checkedOut = record?.checkOutAt != null;

  return { record, loading, submitting, error, reload, submit, checkedIn, checkedOut };
}

/** 월간 근태 기록 + 집계 */
export function useMonthlyAttendance(employeeId: string, monthKey: string) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = monthRange(monthKey);
      const [list, stats] = await Promise.all([
        attendanceApi.list(employeeId, from, to),
        attendanceApi.summary(employeeId, monthKey),
      ]);
      setRecords(list);
      setSummary(stats);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '기록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [employeeId, monthKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { records, summary, loading, error, reload };
}

/** 1초마다 갱신되는 현재 시각 */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
