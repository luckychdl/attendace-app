import { ApiError, USE_MOCK_API, request } from '@/api/client';
import { MOCK_EMPLOYEES } from '@/api/mock/employees';
import type { Employee, LeaveBalance, LeaveInput, LeaveRequest } from '@/api/types';
import { formatClock, fromDateKey, minutesOfDay, parseClock, toDateKey } from '@/lib/date';
import {
  ANNUAL_LEAVE_DAYS,
  countLeaveDays,
  formatDays,
  HOURLY_LEAVE_HOURS,
  hourlySlots,
  isActive,
  isCancellable,
  isSingleDay,
  isWeekend,
  LEAVE_TYPE_LABEL,
  overlaps,
} from '@/lib/leave-rules';
import { localStore } from '@/storage/local-store';

export class LeaveError extends Error {}

function byStartDesc(a: LeaveRequest, b: LeaveRequest) {
  return b.startDate.localeCompare(a.startDate) || b.requestedAt.localeCompare(a.requestedAt);
}

async function mockLeaves() {
  return (await localStore.getLeaves()) ?? [];
}

async function mockFind(id: string) {
  const found = (await mockLeaves()).find((item) => item.id === id);
  if (!found) throw new LeaveError('신청 내역을 찾을 수 없습니다.');
  return found;
}

function mockBalance(leaves: LeaveRequest[], employeeId: string, year: number): LeaveBalance {
  const mine = leaves.filter(
    (item) => item.employeeId === employeeId && item.startDate.startsWith(`${year}-`),
  );
  const sum = (status: LeaveRequest['status']) =>
    mine.filter((item) => item.status === status).reduce((total, item) => total + item.days, 0);

  const used = sum('approved');
  const pending = sum('pending');
  return {
    year,
    granted: ANNUAL_LEAVE_DAYS,
    used,
    pending,
    remaining: ANNUAL_LEAVE_DAYS - used - pending,
  };
}

/** 결재자는 같은 부서의 팀장. 본인 신청은 결재하지 않는다. */
function assertCanDecide(leave: LeaveRequest, approver: Employee) {
  if (approver.role !== 'manager' || approver.department !== leave.department) {
    throw new LeaveError('이 신청을 결재할 권한이 없습니다.');
  }
  if (leave.employeeId === approver.id) {
    throw new LeaveError('본인 신청은 결재할 수 없습니다.');
  }
  if (leave.status !== 'pending') {
    throw new LeaveError('이미 처리된 신청입니다.');
  }
}

export const leaveApi = {
  /** 연간 연차 현황 */
  async balance(employeeId: string, year: number): Promise<LeaveBalance> {
    if (!USE_MOCK_API) {
      return request<LeaveBalance>('/leave/balance', { query: { employeeId, year } });
    }
    return mockBalance(await mockLeaves(), employeeId, year);
  },

  /** 기간(YYYY-MM-DD)과 겹치는 본인 신청. 시작일 최신순 */
  async list(employeeId: string, from: string, to: string): Promise<LeaveRequest[]> {
    if (!USE_MOCK_API) {
      return request<LeaveRequest[]>('/leave/requests', { query: { employeeId, from, to } });
    }
    return (await mockLeaves())
      .filter(
        (item) => item.employeeId === employeeId && item.endDate >= from && item.startDate <= to,
      )
      .sort(byStartDesc);
  },

  /** 결재자에게 올라온 대기 신청. 시작일이 가까운 순 */
  async inbox(approverId: string): Promise<LeaveRequest[]> {
    if (!USE_MOCK_API) {
      return request<LeaveRequest[]>('/leave/inbox', { query: { approverId } });
    }
    const approver = MOCK_EMPLOYEES.find((item) => item.id === approverId);
    if (approver?.role !== 'manager') return [];

    return (await mockLeaves())
      .filter(
        (item) =>
          item.status === 'pending' &&
          item.department === approver.department &&
          item.employeeId !== approverId,
      )
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  },

  async request(input: LeaveInput, employee: Employee): Promise<LeaveRequest> {
    if (!USE_MOCK_API) {
      return request<LeaveRequest>('/leave/requests', { method: 'POST', body: input });
    }

    const { type, startDate } = input;
    const endDate = isSingleDay(type) ? startDate : input.endDate;
    const now = new Date();
    const today = toDateKey(now);

    if (endDate < startDate) throw new LeaveError('종료일이 시작일보다 빠릅니다.');
    if (startDate < today) throw new LeaveError('지난 날짜로는 신청할 수 없습니다.');
    if (startDate.slice(0, 4) !== endDate.slice(0, 4)) {
      throw new LeaveError('해를 넘기는 휴가는 연도별로 나눠서 신청해 주세요.');
    }
    if (isSingleDay(type) && isWeekend(fromDateKey(startDate))) {
      throw new LeaveError(`${LEAVE_TYPE_LABEL[type]}는 평일에만 신청할 수 있습니다.`);
    }

    // 시차는 정해진 시간대 중 하나여야 한다. 종료 시각은 점심을 건너 서버가 정한다.
    const worksite = await localStore.getWorksite();
    let startTime: string | null = null;
    let endTime: string | null = null;
    let hours: number | null = null;
    if (type === 'hourly') {
      hours = input.hours ?? null;
      if (!HOURLY_LEAVE_HOURS.some((option) => option === hours)) {
        throw new LeaveError('시차는 2시간 단위(2·4·6시간)로 신청해 주세요.');
      }
      const start = input.startTime ? parseClock(input.startTime) : NaN;
      const slot = hourlySlots(worksite, hours!).find((item) => item.start === start);
      if (!slot) throw new LeaveError('근무시간 안에서 시작 시각을 골라 주세요.');
      if (startDate === today && slot.start <= (minutesOfDay(now) ?? 0)) {
        throw new LeaveError('이미 지난 시간으로는 시차를 신청할 수 없습니다.');
      }
      startTime = formatClock(slot.start);
      endTime = formatClock(slot.end);
    }

    const days = countLeaveDays(type, startDate, endDate, hours);
    if (days === 0) throw new LeaveError('고른 기간에 평일이 없습니다.');

    const leaves = await mockLeaves();
    const clash = leaves.find(
      (item) =>
        item.employeeId === employee.id &&
        isActive(item) &&
        overlaps(item, { type, startDate, endDate, startTime, endTime }, worksite),
    );
    if (clash) throw new LeaveError('이미 신청한 휴가와 시간이 겹칩니다.');

    const { remaining } = mockBalance(leaves, employee.id, Number(startDate.slice(0, 4)));
    if (days > remaining) {
      throw new LeaveError(`남은 연차가 ${formatDays(remaining)}일이라 신청할 수 없습니다.`);
    }

    // 팀장 위로는 결재자가 없으므로 목 모드에서는 바로 승인한다.
    const autoApprove = employee.role === 'manager';
    const requestedAt = now.toISOString();

    return localStore.upsertLeave({
      id: `leave-${employee.id}-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      type,
      startDate,
      endDate,
      startTime,
      endTime,
      days,
      reason: input.reason?.trim() || null,
      status: autoApprove ? 'approved' : 'pending',
      requestedAt,
      decidedAt: autoApprove ? requestedAt : null,
      decidedBy: autoApprove ? employee.name : null,
    });
  },

  /** 본인 신청 취소. 승인된 건은 시작일 전까지만 */
  async cancel(id: string, employeeId: string): Promise<LeaveRequest> {
    if (!USE_MOCK_API) {
      return request<LeaveRequest>(`/leave/requests/${id}/cancel`, { method: 'POST' });
    }
    const leave = await mockFind(id);
    if (leave.employeeId !== employeeId) throw new ApiError('본인 신청만 취소할 수 있습니다.', 403);
    if (!isCancellable(leave)) throw new LeaveError('이미 시작했거나 처리가 끝난 휴가입니다.');

    return localStore.upsertLeave({ ...leave, status: 'cancelled' });
  },

  async approve(id: string, approver: Employee): Promise<LeaveRequest> {
    if (!USE_MOCK_API) {
      return request<LeaveRequest>(`/leave/requests/${id}/approve`, { method: 'POST' });
    }
    const leave = await mockFind(id);
    assertCanDecide(leave, approver);
    return localStore.upsertLeave({
      ...leave,
      status: 'approved',
      decidedAt: new Date().toISOString(),
      decidedBy: approver.name,
    });
  },

  async reject(id: string, approver: Employee): Promise<LeaveRequest> {
    if (!USE_MOCK_API) {
      return request<LeaveRequest>(`/leave/requests/${id}/reject`, { method: 'POST' });
    }
    const leave = await mockFind(id);
    assertCanDecide(leave, approver);
    return localStore.upsertLeave({
      ...leave,
      status: 'rejected',
      decidedAt: new Date().toISOString(),
      decidedBy: approver.name,
    });
  },
};
