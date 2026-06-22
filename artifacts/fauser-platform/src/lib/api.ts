import { customFetch, type CustomFetchOptions } from "@workspace/api-client-react";

export interface ApiFetchOptions {
  token?: string | null;
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Thin wrapper over the shared, already-tested `customFetch`: attaches a Bearer
 * token, JSON-serializes the body, and delegates response handling (r.ok check,
 * ApiError throwing, 204 → null) to customFetch. Use this for manual API calls
 * that don't have a generated Orval hook yet.
 */
export function apiFetch<T = unknown>(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<T> {
  const { token, method, body, signal } = opts;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const init: CustomFetchOptions = { method, headers, signal };
  if (body !== undefined) init.body = JSON.stringify(body);

  return customFetch<T>(path, init);
}
