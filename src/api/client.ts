/**
 * HTTP 클라이언트.
 *
 * `EXPO_PUBLIC_API_BASE_URL` 이 설정되어 있으면 실서버로 요청하고,
 * 비어 있으면 목(mock) 구현이 로컬 저장소를 사용한다.
 * 서버 연동 시 .env 에 주소만 넣으면 화면 코드는 그대로 동작한다.
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export const USE_MOCK_API = API_BASE_URL.length === 0;

const TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query } = options;

  const url = new URL(path.replace(/^\//, ''), `${API_BASE_URL.replace(/\/$/, '')}/`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new ApiError(text || `요청이 실패했습니다 (${response.status})`, response.status);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('서버 응답이 지연되고 있습니다. 다시 시도해 주세요.', 408);
    }
    throw new ApiError('네트워크에 연결할 수 없습니다.', 0);
  } finally {
    clearTimeout(timer);
  }
}
