import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Worksite } from '@/api/types';
import { worksiteApi } from '@/api/worksite';
import { DEFAULT_WORKSITE } from '@/constants/worksite';

type WorksiteContextValue = {
  worksite: Worksite;
  loading: boolean;
  update: (patch: Partial<Worksite>) => Promise<void>;
};

const WorksiteContext = createContext<WorksiteContextValue | null>(null);

export function WorksiteProvider({ children }: { children: React.ReactNode }) {
  const [worksite, setWorksite] = useState<Worksite>(DEFAULT_WORKSITE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    worksiteApi
      .get()
      .then((loaded) => {
        if (!cancelled) setWorksite(loaded);
      })
      .catch(() => {
        // 실패 시 기본 근무지를 그대로 사용한다.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(
    async (patch: Partial<Worksite>) => {
      const next = await worksiteApi.update({ ...worksite, ...patch });
      setWorksite(next);
    },
    [worksite],
  );

  const value = useMemo(() => ({ worksite, loading, update }), [worksite, loading, update]);

  return <WorksiteContext.Provider value={value}>{children}</WorksiteContext.Provider>;
}

export function useWorksite() {
  const context = useContext(WorksiteContext);
  if (!context) {
    throw new Error('useWorksite 는 WorksiteProvider 안에서만 사용할 수 있습니다.');
  }
  return context;
}
