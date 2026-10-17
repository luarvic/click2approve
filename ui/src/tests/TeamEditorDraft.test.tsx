import { stores } from "@/app/rootStore";
import TeamDialog from "@/features/teams/components/TeamDialog";
import { Team } from "@/features/teams/models/team";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { runInAction } from "mobx";
import { MemoryRouter } from "react-router-dom";
import { expect, test, vi } from "vitest";

test("keeps an edited team name across refreshes and initializes a different team", async () => {
  runInAction(() => {
    stores.tenantStore.currentTenantGlobalId = "tenant-a";
  });
  const team: Team = { globalId: "team-a", name: "Original" };
  const props = {
    canEdit: true,
    employees: [],
    onClose: vi.fn(),
    onDelete: vi.fn().mockResolvedValue(true),
    onSubmit: vi.fn().mockResolvedValue(null),
  };
  const view = render(
    <MemoryRouter>
      <TeamDialog {...props} team={team} />
    </MemoryRouter>,
  );
  const name = screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement;
  await userEvent.setup().clear(name);
  await userEvent.setup().type(name, "My draft");

  view.rerender(
    <MemoryRouter>
      <TeamDialog {...props} team={{ ...team, name: "Server refresh" }} />
    </MemoryRouter>,
  );
  expect(name.value).toBe("My draft");

  view.rerender(
    <MemoryRouter>
      <TeamDialog {...props} team={{ globalId: "team-b", name: "Other team" }} />
    </MemoryRouter>,
  );
  expect(name.value).toBe("Other team");
});
