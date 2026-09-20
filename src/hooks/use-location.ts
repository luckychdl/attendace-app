import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { GeoPoint, Worksite } from '@/api/types';
import { distanceInMeters } from '@/lib/geo';

export type LocationState = {
  point: GeoPoint | null;
  /** 근무지까지의 거리(미터). 위치를 못 받으면 null */
  distance: number | null;
  /** 허용 반경 안에 있는지 */
  isInside: boolean;
  permissionDenied: boolean;
  loading: boolean;
  error: string | null;
};

const INITIAL_STATE: LocationState = {
  point: null,
  distance: null,
  isInside: false,
  permissionDenied: false,
  loading: true,
  error: null,
};

/**
 * 현재 위치를 읽어 근무지 반경 안에 있는지 판단한다.
 * 화면에 들어올 때 한 번 측정하고, 이후에는 refresh() 로 다시 측정한다.
 */
export function useCurrentLocation(worksite: Worksite) {
  const [state, setState] = useState<LocationState>(INITIAL_STATE);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        if (mounted.current) {
          setState({
            ...INITIAL_STATE,
            loading: false,
            permissionDenied: true,
            error: '위치 권한이 필요합니다. 설정에서 권한을 허용해 주세요.',
          });
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const point: GeoPoint = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      const distance = distanceInMeters(point, worksite);

      if (mounted.current) {
        setState({
          point,
          distance,
          isInside: distance <= worksite.radiusMeters,
          permissionDenied: false,
          loading: false,
          error: null,
        });
      }
    } catch {
      if (mounted.current) {
        setState({
          ...INITIAL_STATE,
          loading: false,
          error: '현재 위치를 확인할 수 없습니다. GPS 상태를 확인해 주세요.',
        });
      }
    }
  }, [worksite]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
