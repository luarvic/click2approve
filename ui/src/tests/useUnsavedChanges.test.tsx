import { useUnsavedChanges } from "@/shared/hooks/useUnsavedChanges";
import { confirmUnsavedChanges } from "@/shared/routing/unsavedChanges";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const renderGuard = (hasChanges = true) => {
  let router: ReturnType<typeof createMemoryRouter>;
  const wrapper = ({ children }: { children: ReactNode }) => {
    router = createMemoryRouter([{ path: "*", element: children }], {
      initialEntries: ["/before", "/edit"],
      initialIndex: 1,
    });
    return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
  };
  const hook = renderHook(() => useUnsavedChanges(hasChanges), { wrapper });
  return { ...hook, router: router! };
};

describe("unsaved changes navigation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  beforeEach(() =>
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    ),
  );

  test("blocks route navigation and browser Back, then proceeds when confirmed", async () => {
    const confirm = vi.mocked(window.confirm);
    const { router } = renderGuard();
    await act(async () => {
      await router.navigate("/elsewhere");
    });
    expect(router.state.location.pathname).toBe("/edit");
    await act(async () => {
      await router.navigate(-1);
    });
    expect(router.state.location.pathname).toBe("/edit");
    confirm.mockReturnValue(true);
    await act(async () => {
      await router.navigate(-1);
    });
    expect(router.state.location.pathname).toBe("/before");
  });

  test("protects session changes and unload, then permits leaving after successful submission", async () => {
    vi.mocked(window.confirm);
    const { result, router } = renderGuard();
    expect(confirmUnsavedChanges()).toBe(false);
    const before = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(before);
    expect(before.defaultPrevented).toBe(true);
    act(() => result.current.markSaved());
    expect(confirmUnsavedChanges()).toBe(true);
    const after = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(after);
    expect(after.defaultPrevented).toBe(false);
    await act(async () => {
      await router.navigate("/done");
    });
    expect(router.state.location.pathname).toBe("/done");
  });

  test("does not prompt or block when no changes exist", async () => {
    const confirm = vi.mocked(window.confirm);
    const { router } = renderGuard(false);
    await act(async () => {
      await router.navigate("/elsewhere");
    });
    expect(router.state.location.pathname).toBe("/elsewhere");
    expect(confirm).not.toHaveBeenCalled();
  });
});
