import { USE_MOCK_API, isOffline, request } from '@/api/client';
import type { Worksite } from '@/api/types';
import { localStore } from '@/storage/local-store';

export const worksiteApi = {
  async get(): Promise<Worksite> {
    if (!USE_MOCK_API) {
      try {
        const worksite = await request<Worksite>('/worksite');
        await localStore.setWorksite(worksite); // 오프라인 대비 캐시
        return worksite;
      } catch (error) {
        if (isOffline(error)) return localStore.getWorksite();
        throw error;
      }
    }
    return localStore.getWorksite();
  },

  /** 실서버에서는 팀장만 바꿀 수 있고 전 직원에게 반영된다. 목 모드에서는 기기 로컬에만 반영된다. */
  async update(worksite: Worksite): Promise<Worksite> {
    if (!USE_MOCK_API) {
      const saved = await request<Worksite>('/worksite', { method: 'PATCH', body: worksite });
      await localStore.setWorksite(saved);
      return saved;
    }
    await localStore.setWorksite(worksite);
    return worksite;
  },
};
