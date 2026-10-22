import { AppUpdates } from "@/shared/config/application";
import { useAppVersionCheck } from "@/shared/hooks/useAppVersionCheck";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchVersion = vi.fn<typeof fetch>();

const versionResponse = (buildId = AppUpdates.buildId) =>
  new Response(JSON.stringify({ buildId }), { headers: { "Content-Type": "application/json" } });

const settle = async (action = () => {}) => {
  await act(async () => action());
};

describe("production release detection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("PROD", true);
    vi.stubEnv("BASE_URL", "/app/");
    vi.stubGlobal("fetch", fetchVersion);
    fetchVersion.mockReset().mockImplementation(async () => versionResponse());
    vi.spyOn(window.location, "reload").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("checks the deployed version without browser caching and keeps the current build running", async () => {
    renderHook(useAppVersionCheck);
    await settle();

    expect(fetchVersion).toHaveBeenCalledWith("/app/version.json", {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: expect.any(AbortSignal),
    });
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it("reloads once when a periodic check detects a new release", async () => {
    renderHook(useAppVersionCheck);
    await settle();
    fetchVersion.mockResolvedValueOnce(versionResponse("new-release"));

    await act(() => vi.advanceTimersByTimeAsync(AppUpdates.checkIntervalMs));
    expect(window.location.reload).toHaveBeenCalledOnce();

    await act(() => vi.advanceTimersByTimeAsync(AppUpdates.checkIntervalMs));
    expect(fetchVersion).toHaveBeenCalledTimes(2);
    expect(window.location.reload).toHaveBeenCalledOnce();
  });

  it("checks at startup and at the configured interval", async () => {
    renderHook(useAppVersionCheck);
    await settle();
    expect(fetchVersion).toHaveBeenCalledOnce();

    await act(() => vi.advanceTimersByTimeAsync(AppUpdates.checkIntervalMs - 1));
    expect(fetchVersion).toHaveBeenCalledOnce();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(fetchVersion).toHaveBeenCalledTimes(2);
  });

  it("shares an outstanding check and ignores a late response after unmount", async () => {
    let resolveRequest!: (response: Response) => void;
    fetchVersion.mockImplementationOnce(() => new Promise((resolve) => (resolveRequest = resolve)));
    const { unmount } = renderHook(useAppVersionCheck);
    await act(() => vi.advanceTimersByTimeAsync(AppUpdates.checkIntervalMs));
    expect(fetchVersion).toHaveBeenCalledOnce();
    const signal = fetchVersion.mock.calls[0][1]?.signal;

    unmount();
    expect(signal?.aborted).toBe(true);
    await settle(() => resolveRequest(versionResponse("new-release")));
    expect(window.location.reload).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(AppUpdates.checkIntervalMs));
    expect(fetchVersion).toHaveBeenCalledOnce();
  });

  it.each([
    ["HTTP failure", () => Promise.resolve(new Response("unavailable", { status: 503 }))],
    ["network failure", () => Promise.reject(new TypeError("offline"))],
    ["invalid JSON", () => Promise.resolve(new Response("<html>error</html>"))],
    ["missing build ID", () => Promise.resolve(new Response("{}"))],
    ["empty build ID", () => Promise.resolve(versionResponse(" "))],
  ])("tolerates %s and retries at the next interval", async (_, response) => {
    fetchVersion.mockImplementationOnce(response);
    renderHook(useAppVersionCheck);
    await settle();
    expect(window.location.reload).not.toHaveBeenCalled();

    fetchVersion.mockResolvedValueOnce(versionResponse("new-release"));
    await act(() => vi.advanceTimersByTimeAsync(AppUpdates.checkIntervalMs));
    expect(window.location.reload).toHaveBeenCalledOnce();
  });

  it("aborts stalled requests so the next interval can retry", async () => {
    fetchVersion.mockImplementationOnce(
      (_, options) =>
        new Promise((_, reject) => {
          options?.signal?.addEventListener("abort", () => reject(new DOMException("Timed out", "AbortError")));
        }),
    );
    renderHook(useAppVersionCheck);
    await act(() => vi.advanceTimersByTimeAsync(AppUpdates.timeoutMs));
    expect(window.location.reload).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(AppUpdates.checkIntervalMs));
    expect(fetchVersion).toHaveBeenCalledTimes(2);
  });

  it("does not check during development", async () => {
    vi.stubEnv("PROD", false);
    renderHook(useAppVersionCheck);
    await act(() => vi.advanceTimersByTimeAsync(AppUpdates.checkIntervalMs));
    expect(fetchVersion).not.toHaveBeenCalled();
  });
});
