import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { authApi, type LoginInput, type SignupInput } from '@/api/auth';
import { setUnauthorizedHandler } from '@/api/client';
import type { Session } from '@/api/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  login: (input: LoginInput) => Promise<void>;
  /** 가입에 성공하면 바로 로그인된 상태가 된다. */
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    authApi
      .restore()
      .then((restored) => {
        if (cancelled) return;
        setSession(restored);
        setStatus(restored ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => {
        if (!cancelled) setStatus('unauthenticated');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 쓰는 도중 토큰이 만료되면 (서버가 401) 세션을 비워 로그인 화면으로 돌려보낸다.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      authApi.logout().catch(() => {});
      setSession(null);
      setStatus('unauthenticated');
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const next = await authApi.login(input);
    setSession(next);
    setStatus('authenticated');
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const next = await authApi.signup(input);
    setSession(next);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setSession(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({ status, session, login, signup, logout }),
    [status, session, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 는 AuthProvider 안에서만 사용할 수 있습니다.');
  }
  return context;
}

/** 로그인이 보장된 화면에서 직원 정보를 꺼내 쓰기 위한 헬퍼 */
export function useEmployee() {
  const { session } = useAuth();
  if (!session) {
    throw new Error('로그인 세션이 없습니다.');
  }
  return session.employee;
}
