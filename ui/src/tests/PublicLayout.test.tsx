import { stores } from "@/app/rootStore";
import PublicLayout from "@/layouts/PublicLayout";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test } from "vitest";

describe("<PublicLayout />", () => {
  beforeEach(() => {
    stores.userPreferencesStore.setColorMode("light");
  });

  test("updates the color mode switch on public pages", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PublicLayout>
          <div />
        </PublicLayout>
      </MemoryRouter>,
    );

    const colorModeSwitch = screen.getByRole("switch", { name: "Dark mode" }) as HTMLInputElement;
    expect(colorModeSwitch.checked).toBe(false);

    await act(async () => {
      await user.click(colorModeSwitch);
    });

    await waitFor(() => expect(colorModeSwitch.checked).toBe(true));
  });

  test("shows progress while a public form is submitting", () => {
    const loader = ActionLoaders.identity.signUp();
    render(
      <MemoryRouter>
        <PublicLayout>
          <div />
        </PublicLayout>
      </MemoryRouter>,
    );

    expect(screen.queryByRole("progressbar")).toBeNull();
    act(() => stores.commonStore.updateActionLoadingCounter(loader, 1));
    expect(screen.getByRole("progressbar")).toBeTruthy();
    act(() => stores.commonStore.updateActionLoadingCounter(loader, -1));
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});
