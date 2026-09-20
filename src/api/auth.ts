import { ApiError, USE_MOCK_API, request, setAuthToken } from '@/api/client';
import { MOCK_EMPLOYEES } from '@/api/mock/employees';
import { seedRecordsIfEmpty } from '@/api/mock/seed';
import type { Session } from '@/api/types';
import { localStore } from '@/storage/local-store';

export type LoginInput = {
  employeeNo: string;
  password: string;
};

export const authApi = {
  /** 사번 + 비밀번호 로그인 */
  async login({ employeeNo, password }: LoginInput): Promise<Session> {
    if (!USE_MOCK_API) {
      const session = await request<Session>('/auth/login', {
        method: 'POST',
        body: { employeeNo, password },
      });
      setAuthToken(session.token);
      await localStore.setSession(session);
      return session;
    }

    const found = MOCK_EMPLOYEES.find((item) => item.employeeNo === employeeNo.trim());
    if (!found || found.password !== password) {
      throw new ApiError('사번 또는 비밀번호가 올바르지 않습니다.', 401);
    }

    const { password: _password, ...employee } = found;
    const session: Session = { employee, token: `mock-token-${employee.id}` };

    setAuthToken(session.token);
    await localStore.setSession(session);
    await seedRecordsIfEmpty(employee.id, await localStore.getWorksite());

    return session;
  },

  /** 앱 시작 시 저장된 세션 복구 */
  async restore(): Promise<Session | null> {
    const session = await localStore.getSession();
    setAuthToken(session?.token ?? null);
    return session;
  },

  async logout() {
    setAuthToken(null);
    await localStore.clearSession();
  },
};
