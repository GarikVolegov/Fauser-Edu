import { useCallback } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch, type ApiFetchOptions } from "./api";

/**
 * Returns an apiFetch bound to the current Clerk session token. Pages use this
 * for manual API calls instead of hand-rolling fetch + getToken + r.ok checks.
 */
export function useApi() {
  const { getToken } = useAuth();
  return useCallback(
    async <T = unknown>(
      path: string,
      opts: Omit<ApiFetchOptions, "token"> = {},
    ): Promise<T> => {
      const token = await getToken();
      return apiFetch<T>(path, { ...opts, token });
    },
    [getToken],
  );
}
