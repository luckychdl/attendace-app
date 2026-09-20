import { USE_MOCK_API, request } from '@/api/client';
import type { Worksite } from '@/api/types';
import { localStore } from '@/storage/local-store';

export const worksiteApi = {
  async get(): Promise<Worksite> {
    if (!USE_MOCK_API) {
      const worksite = await request<Worksite>('/worksite');
      await localStore.setWorksite(worksite); // 오프라인 대비 캐시
      return worksite;
    }
    return localStore.getWorksite();
  },

  /** 관리자 기능. 목 모드에서는 기기 로컬에만 반영된다. */
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
