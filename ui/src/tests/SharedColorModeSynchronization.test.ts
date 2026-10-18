import { stores } from "@/app/rootStore";
import { useSharedColorModeSynchronization } from "@/shared/hooks/useSharedColorModeSynchronization";
import { COLOR_MODE_KEY } from "@/shared/session/session";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/app/rootStore", () => ({
  stores: {
    userPreferencesStore: {
      theme: { palette: { mode: "light" } },
      setColorMode: vi.fn(),
    },
  },
}));

describe("shared color mode", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
    stores.userPreferencesStore.theme.palette.mode = "light";
    vi.mocked(stores.userPreferencesStore.setColorMode).mockImplementation((mode) => {
      stores.userPreferencesStore.theme.palette.mode = mode;
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("applies the saved preference when mounted", () => {
    localStorage.setItem(COLOR_MODE_KEY, "dark");
    renderHook(useSharedColorModeSynchronization);
    expect(stores.userPreferencesStore.theme.palette.mode).toBe("dark");
  });

  test("updates from another tab without reacting to unrelated or repeated events", () => {
    const { unmount } = renderHook(useSharedColorModeSynchronization);
    localStorage.setItem(COLOR_MODE_KEY, "dark");
    const dispatch = (key: string) =>
      act(() => window.dispatchEvent(new StorageEvent("storage", { key, storageArea: localStorage })));

    dispatch("tokens");
    expect(stores.userPreferencesStore.setColorMode).not.toHaveBeenCalled();
    dispatch(COLOR_MODE_KEY);
    expect(stores.userPreferencesStore.theme.palette.mode).toBe("dark");
    dispatch(COLOR_MODE_KEY);
    expect(stores.userPreferencesStore.setColorMode).toHaveBeenCalledTimes(1);

    unmount();
    localStorage.setItem(COLOR_MODE_KEY, "light");
    dispatch(COLOR_MODE_KEY);
    expect(stores.userPreferencesStore.setColorMode).toHaveBeenCalledTimes(1);
  });

  test("refreshes a restored page's theme", () => {
    renderHook(useSharedColorModeSynchronization);
    localStorage.setItem(COLOR_MODE_KEY, "dark");
    act(() => window.dispatchEvent(new Event("pageshow")));
    expect(stores.userPreferencesStore.theme.palette.mode).toBe("dark");
  });

  test("falls back to the system preference for an invalid saved value", () => {
    stores.userPreferencesStore.theme.palette.mode = "dark";
    localStorage.setItem(COLOR_MODE_KEY, "invalid");
    renderHook(useSharedColorModeSynchronization);
    expect(stores.userPreferencesStore.theme.palette.mode).toBe("light");
  });
});
