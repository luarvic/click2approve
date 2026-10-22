import AnalyticsBanner from "@/shared/analytics/AnalyticsBanner";
import { appAnalyticsPage } from "@/shared/analytics/analyticsPages";
import { analyticsPreferenceKey, readAnalyticsPreference } from "@/shared/analytics/analyticsPreferences";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const id = "G-UNITTEST";
const googleTags = () => document.querySelectorAll(`script[data-analytics-tag="${id}"]`);
const commands = () => ((window as any).dataLayer || []).map((item: IArguments) => Array.from(item));

beforeEach(() => {
  vi.stubEnv("BASE_URL", "/app/");
  const append = document.head.append.bind(document.head);
  vi.spyOn(document.head, "append").mockImplementation((...nodes) => {
    for (const node of nodes) {
      if (node instanceof HTMLScriptElement && node.src.startsWith("https://www.googletagmanager.com/")) {
        node.type = "application/x-analytics-test";
      }
    }
    append(...nodes);
  });
  localStorage.clear();
  history.replaceState(null, "", "/app/signUp?email=secret@example.com&token=secret");
  googleTags().forEach((tag) => tag.remove());
  delete (window as any).dataLayer;
  delete (window as any).gtag;
  delete (window as any).click2approveAnalytics;
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("optional shared analytics", () => {
  test("no ID shows no banner and loads no Google script", () => {
    render(<AnalyticsBanner />);
    expect(screen.queryByRole("switch", { name: "Allow analytics" })).toBeNull();
    expect(googleTags().length).toBe(0);
  });

  test("closing an untouched toggle remembers rejection without tracking", async () => {
    render(<AnalyticsBanner measurementId={id} />);
    expect((screen.getByRole("switch", { name: "Allow analytics" }) as HTMLInputElement).checked).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: "Close analytics settings" }));
    expect(screen.queryByRole("region", { name: "Optional analytics" })).toBeNull();
    expect(readAnalyticsPreference(id)?.choice).toBe("rejected");
    expect(googleTags().length).toBe(0);
  });

  test("toggle applies immediately; withdrawal preserves the page and stops route events", async () => {
    render(<AnalyticsBanner measurementId={id} />);
    const toggle = screen.getByRole("switch", { name: "Allow analytics" });
    await userEvent.click(toggle);
    expect(googleTags().length).toBe(1);
    expect(readAnalyticsPreference(id)?.choice).toBe("accepted");
    expect(commands().find(([type, name]: string[]) => type === "event" && name === "page_view")[2]).toEqual({
      page_location: `${location.origin}/app/signUp`,
      page_title: "Sign up",
      page_referrer: "",
    });
    await act(async () =>
      history.pushState(null, "", "/app/tenants/private-id/requests/private-document/chat?secret=123"),
    );
    const events = commands().filter(([type]: string[]) => type === "event");
    expect(events.at(-1)[2].page_location).toBe(`${location.origin}/app/tenants/:tenant/requests/:request/chat`);
    await userEvent.click(toggle);
    expect((window as any)[`ga-disable-${id}`]).toBe(true);
    expect(location.pathname).toContain("private-document");
    await act(async () => history.pushState(null, "", "/app/userProfile/security"));
    expect(commands().filter(([type]: string[]) => type === "event")).toHaveLength(events.length);
    await userEvent.click(toggle);
    expect(googleTags().length).toBe(1);
  });

  test("consent changes in another tab update the toggle and tracking", async () => {
    render(<AnalyticsBanner measurementId={id} />);
    localStorage.setItem(
      analyticsPreferenceKey(id),
      JSON.stringify({ choice: "accepted", expiresAt: Date.now() + 10000 }),
    );
    fireEvent(window, new StorageEvent("storage", { key: analyticsPreferenceKey(id) }));
    await waitFor(() => expect(googleTags().length).toBe(1));
    localStorage.setItem(
      analyticsPreferenceKey(id),
      JSON.stringify({ choice: "rejected", expiresAt: Date.now() + 10000 }),
    );
    fireEvent(window, new StorageEvent("storage", { key: analyticsPreferenceKey(id) }));
    await waitFor(() => expect((window as any)[`ga-disable-${id}`]).toBe(true));
  });

  test("React StrictMode does not double load Google or record the same screen twice", () => {
    localStorage.setItem(
      analyticsPreferenceKey(id),
      JSON.stringify({ choice: "accepted", expiresAt: Date.now() + 10000 }),
    );
    render(
      <StrictMode>
        <AnalyticsBanner measurementId={id} />
      </StrictMode>,
    );
    expect(googleTags().length).toBe(1);
    expect(commands().filter(([type]: string[]) => type === "event")).toHaveLength(1);
  });

  test.each([
    ["/app/receipt-verification/private-link?token=secret", "/app/receipt-verification/:link"],
    ["/app/tenants/private-id/employees/private-person", "/app/tenants/:tenant/employees/:resource"],
    ["/app/tenants/new/plans", "/app/tenants/new/plans"],
    ["/app/arbitrary-private-path", "/app/other"],
  ])("only route templates leave the app: %s", (path, expected) => {
    expect(appAnalyticsPage(path).path).toBe(expected);
  });
});
