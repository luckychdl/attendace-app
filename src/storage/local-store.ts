import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys } from '@/storage/keys';
import type { AttendanceRecord, Session, Worksite } from '@/api/types';
import { DEFAULT_WORKSITE } from '@/constants/worksite';

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    // 저장된 값이 손상된 경우 기본값으로 복구한다.
    return fallback;
  }
}

async function writeJson(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

/**
 * 기기 로컬 저장소. 목(mock) API의 백엔드 역할을 하며
 * 실서버로 전환한 뒤에도 오프라인 캐시로 재사용할 수 있다.
 */
export const localStore = {
  async getSession() {
    return readJson<Session | null>(StorageKeys.session, null);
  },
  async setSession(session: Session) {
    await writeJson(StorageKeys.session, session);
  },
  async clearSession() {
    await AsyncStorage.removeItem(StorageKeys.session);
  },

  async getRecords() {
    return readJson<AttendanceRecord[]>(StorageKeys.records, []);
  },
  async setRecords(records: AttendanceRecord[]) {
    await writeJson(StorageKeys.records, records);
  },
  async upsertRecord(record: AttendanceRecord) {
    const records = await localStore.getRecords();
    const index = records.findIndex((item) => item.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.push(record);
    }
    await localStore.setRecords(records);
    return record;
  },

  async getWorksite() {
    return readJson<Worksite>(StorageKeys.worksite, DEFAULT_WORKSITE);
  },
  async setWorksite(worksite: Worksite) {
    await writeJson(StorageKeys.worksite, worksite);
  },
};
