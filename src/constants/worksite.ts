import type { Worksite } from '@/api/types';

/**
 * 기본 근무지. 실제 운영 시에는 서버에서 내려받거나
 * 설정 화면의 "현재 위치를 근무지로 지정"으로 덮어쓴다.
 * (기본값: 서울시청)
 */
export const DEFAULT_WORKSITE: Worksite = {
  id: 'hq',
  name: '본사',
  latitude: 37.5666805,
  longitude: 126.9784147,
  radiusMeters: 200,
  startHour: 9,
  startMinute: 0,
  endHour: 18,
  endMinute: 0,
};

/** 설정 화면에서 선택할 수 있는 허용 반경(미터) */
export const RADIUS_OPTIONS = [50, 100, 200, 500, 1000] as const;
