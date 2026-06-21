import { describe, it, expect, vi, afterEach } from "vitest";
import { customFetch, setBaseUrl, ApiError } from "./custom-fetch";

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

afterEach(() => {
  setBaseUrl(null);
  vi.restoreAllMocks();
});

describe("customFetch", () => {
  it("parses a JSON success body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ hello: "world" })),
    );
    const data = await customFetch<{ hello: string }>("/api/thing");
    expect(data).toEqual({ hello: "world" });
  });

  it("returns null for a 204 No Content response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 204 })),
    );
    const data = await customFetch("/api/none");
    expect(data).toBeNull();
  });

  it("throws ApiError with status + problem detail on a non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ detail: "Not allowed" }), {
            status: 403,
            headers: { "content-type": "application/problem+json" },
          }),
      ),
    );
    await expect(customFetch("/api/secret")).rejects.toMatchObject({
      name: "ApiError",
      status: 403,
    });
    try {
      await customFetch("/api/secret");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).message).toContain("Not allowed");
    }
  });

  it("setBaseUrl prepends to relative paths but not absolute URLs", async () => {
    const spy = vi.fn<
      (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    >(async () => jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", spy);
    setBaseUrl("https://api.example.com/");

    await customFetch("/api/rel");
    await customFetch("https://other.test/abs");

    const firstArg = spy.mock.calls[0][0];
    const secondArg = spy.mock.calls[1][0];
    expect(String(firstArg)).toBe("https://api.example.com/api/rel");
    expect(String(secondArg)).toBe("https://other.test/abs");
  });
});
