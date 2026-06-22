import { describe, it, expect, vi, afterEach } from "vitest";
import { ApiError } from "@workspace/api-client-react";
import { apiFetch } from "./api";

afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

describe("apiFetch", () => {
  it("attaches a Bearer token and returns parsed JSON", async () => {
    const spy = vi.fn(async () => jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", spy);

    const data = await apiFetch<{ ok: boolean }>("/api/thing", { token: "tok123" });

    expect(data).toEqual({ ok: true });
    const init = spy.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer tok123");
  });

  it("serializes a JSON body for POST", async () => {
    const spy = vi.fn(async () => jsonResponse({ id: 1 }, { status: 201 }));
    vi.stubGlobal("fetch", spy);

    await apiFetch("/api/things", { token: "t", method: "POST", body: { a: 1 } });

    const init = spy.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it("throws ApiError on a non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: "Nope" }), {
            status: 403,
            headers: { "content-type": "application/json" },
          }),
      ),
    );
    await expect(apiFetch("/api/secret", { token: "t" })).rejects.toBeInstanceOf(ApiError);
  });
});
