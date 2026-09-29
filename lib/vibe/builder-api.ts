/**
 * VIBE Builder — client API helper.
 * Sends the demo bearer token as Authorization header; all endpoints are
 * server-side RBAC guarded (protectApi), so the browser never bypasses checks.
 */

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

const TOKEN_KEY = 'vibe.builder.token';

export function getBuilderToken(): string {
  if (typeof window === 'undefined') return 'superadmin@test.travelplanet.local';
  return window.localStorage.getItem(TOKEN_KEY) || 'superadmin@test.travelplanet.local';
}

export function setBuilderToken(token: string) {
  if (typeof window !== 'undefined') window.localStorage.setItem(TOKEN_KEY, token);
}

async function request<T>(method: string, path: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getBuilderToken()}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
      return {
        ok: false,
        status: res.status,
        error: json.error
          ? { code: json.error.code ?? 'ERROR', message: json.error.message ?? res.statusText, details: json.error.details }
          : { code: typeof json.code === 'string' ? json.code : 'ERROR', message: typeof json.error === 'string' ? json.error : res.statusText },
      };
    }
    return { ok: true, status: res.status, data: json.data as T };
  } catch (err) {
    return { ok: false, status: 0, error: { code: 'NETWORK', message: err instanceof Error ? err.message : 'Network error' } };
  }
}

export const builderApi = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};
