import { ApiError, USE_MOCK_API, isOffline, request, setAuthToken } from '@/api/client';
import { MOCK_EMPLOYEES } from '@/api/mock/employees';
import { seedLeavesIfEmpty, seedRecordsIfEmpty } from '@/api/mock/seed';
import type { Employee, Session } from '@/api/types';
import { localStore } from '@/storage/local-store';

export type LoginInput = {
  /** 사번은 회사 안에서만 유일해서 회사명이 함께 필요하다. 목 모드에서는 쓰지 않는다. */
  companyName: string;
  employeeNo: string;
  password: string;
};

export type SignupInput = LoginInput & {
  name: string;
  department: string;
  position: string;
};

async function startSession(session: Session) {
  setAuthToken(session.token);
  await localStore.setSession(session);
  if (session.employee.companyName) await localStore.setLastCompany(session.employee.companyName);
  return session;
}

export const authApi = {
  /**
   * 회원가입. 처음 보는 회사명이면 회사가 만들어지고 가입자가 관리자가 되며,
   * 이미 있는 회사면 그 회사의 팀원으로 들어간다. 가입하면 바로 로그인된다.
   */
  async signup(input: SignupInput): Promise<Session> {
    if (USE_MOCK_API) {
      throw new ApiError('목 모드에서는 회원가입을 할 수 없습니다. 서버 주소를 설정해 주세요.', 400);
    }
    return startSession(await request<Session>('/auth/signup', { method: 'POST', body: input }));
  },

  /** 회사명 + 사번 + 비밀번호 로그인 */
  async login({ companyName, employeeNo, password }: LoginInput): Promise<Session> {
    if (!USE_MOCK_API) {
      return startSession(
        await request<Session>('/auth/login', {
          method: 'POST',
          body: { companyName, employeeNo, password },
        }),
      );
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
    await seedLeavesIfEmpty();

    return session;
  },

  /** 앱 시작 시 저장된 세션 복구 */
  async restore(): Promise<Session | null> {
    const session = await localStore.getSession();
    setAuthToken(session?.token ?? null);

    if (session && !USE_MOCK_API) {
      // 토큰이 아직 유효한지 확인하고, 부서·역할이 바뀌었을 수 있으니 인사 정보를 새로 받는다.
      try {
        const employee = await request<Employee>('/auth/me');
        const refreshed = { ...session, employee };
        await localStore.setSession(refreshed);
        return refreshed;
      } catch (error) {
        // 서버에 닿지 못했을 뿐이면 저장된 세션으로 들어간다. 만료된 토큰은 이후 요청의 401 이 정리한다.
        if (isOffline(error)) return session;
        await authApi.logout();
        return null;
      }
    }

    if (session && USE_MOCK_API) {
      // 목 인사 정보가 바뀌었을 수 있으니 (예: role 추가) 저장된 세션을 최신으로 맞춘다.
      const found = MOCK_EMPLOYEES.find((item) => item.id === session.employee.id);
      if (found) {
        const { password: _password, ...employee } = found;
        const refreshed = { ...session, employee };
        await localStore.setSession(refreshed);
        await seedLeavesIfEmpty();
        return refreshed;
      }
      // 실서버에서 받은 세션이 남아 있는 경우. 목 데이터에는 없는 직원이라 다시 로그인하게 한다.
      await authApi.logout();
      return null;
    }
    return session;
  },

  async logout() {
    setAuthToken(null);
    await localStore.clearSession();
  },
};
