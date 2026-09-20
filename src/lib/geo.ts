import type { GeoPoint } from '@/api/types';

const EARTH_RADIUS_M = 6_371_000;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/** 두 좌표 사이의 대원거리(미터). haversine 공식 */
export function distanceInMeters(a: GeoPoint, b: GeoPoint) {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** 사람이 읽기 쉬운 거리 표기 */
export function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
