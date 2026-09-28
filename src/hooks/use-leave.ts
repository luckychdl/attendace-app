import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { leaveApi } from '@/api/leave';
import type { Employee, LeaveBalance, LeaveRequest } from '@/api/types';

/**
 * 한 해의 연차 현황, 내 신청 목록, (팀장이면) 결재 대기함.
 * 신청은 모달에서 일어나므로 화면에 돌아올 때마다 다시 읽는다.
 */
export function useLeave(employee: Employee, year: number) {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [inbox, setInbox] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** 처리 중인 신청 id. 같은 줄의 버튼을 잠근다. */
  const [busyId, setBusyId] = useState<string | null>(null);

  const isManager = employee.role === 'manager';

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [nextBalance, nextRequests, nextInbox] = await Promise.all([
        leaveApi.balance(employee.id, year),
        leaveApi.list(employee.id, `${year}-01-01`, `${year}-12-31`),
        isManager ? leaveApi.inbox(employee.id) : Promise.resolve([]),
      ]);
      setBalance(nextBalance);
      setRequests(nextRequests);
      setInbox(nextInbox);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '휴가 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [employee.id, isManager, year]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  /** 처리 후 잔여 일수까지 다시 맞춰야 하므로 목록 전체를 새로 읽는다. */
  const run = useCallback(
    async (id: string, action: () => Promise<unknown>) => {
      setBusyId(id);
      try {
        await action();
        await reload();
      } finally {
        setBusyId(null);
      }
    },
    [reload],
  );

  const cancel = useCallback(
    (id: string) => run(id, () => leaveApi.cancel(id, employee.id)),
    [employee.id, run],
  );
  const approve = useCallback(
    (id: string) => run(id, () => leaveApi.approve(id, employee)),
    [employee, run],
  );
  const reject = useCallback(
    (id: string) => run(id, () => leaveApi.reject(id, employee)),
    [employee, run],
  );

  return {
    balance,
    requests,
    inbox,
    isManager,
    loading,
    error,
    busyId,
    reload,
    cancel,
    approve,
    reject,
  };
}

/** 기간과 겹치는 승인된 휴가. 오늘·기록 화면에서 근태 옆에 휴가를 함께 보여줄 때 쓴다. */
export function useApprovedLeaves(employeeId: string, from: string, to: string) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const reload = useCallback(async () => {
    try {
      const list = await leaveApi.list(employeeId, from, to);
      setLeaves(list.filter((item) => item.status === 'approved'));
    } catch {
      // 휴가 표시는 보조 정보라 실패해도 근태 화면은 그대로 둔다.
    }
  }, [employeeId, from, to]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { leaves, reload };
}
