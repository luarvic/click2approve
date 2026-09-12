import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { describe, expect, test } from "vitest";

describe("getApiErrorNotification", () => {
  test("separates API Problem Details into a message and diagnostic details", () => {
    const error = {
      isAxiosError: true,
      message: "Request failed",
      response: {
        data: {
          detail: "The supplied record is not valid.",
          errors: { name: ["Name is required."] },
          status: 400,
          title: "One or more validation errors occurred.",
          traceId: "00-abc123",
          type: "https://httpstatuses.com/400",
        },
        status: 400,
      },
    };

    expect(getApiErrorNotification(error)).toEqual({
      details: [
        { label: "Message", value: "One or more validation errors occurred." },
        { label: "Detail", value: "The supplied record is not valid." },
        { label: "Validation error: name", value: "Name is required." },
        { label: "Status", value: "400" },
        { label: "Trace ID", value: "00-abc123" },
        { label: "Type", value: "https://httpstatuses.com/400" },
      ],
      message: "One or more validation errors occurred.",
      severity: "warning",
    });
  });

  test("shows notifications for restricted billing access", () => {
    expect(
      getApiErrorNotification({
        isAxiosError: true,
        message: "Request failed with status code 402",
        response: {
          status: 402,
          data: {
            code: "tenant_suspended",
            tenantGlobalId: "tenant-test",
            title: "This organization requires payment.",
          },
        },
      }),
    ).toEqual({
      details: [
        { label: "Status", value: "402" },
        { label: "Message", value: "This organization requires payment." },
        { label: "Code", value: "tenant_suspended" },
        { label: "Tenant Global Id", value: "tenant-test" },
      ],
      message: "This organization requires payment.",
      severity: "warning",
    });
  });

  test("preserves messages for unrelated 402 errors", () => {
    const result = getApiErrorNotification({
      isAxiosError: true,
      response: { status: 402, data: { title: "Payment authorization was declined." } },
    });
    expect(result?.message).toBe("Payment authorization was declined.");
    expect(result?.severity).toBe("warning");
  });

  test("keeps 5xx server failures as error notifications", () => {
    const result = getApiErrorNotification({
      isAxiosError: true,
      response: { status: 503, data: { title: "The service is temporarily unavailable." } },
    });

    expect(result?.severity).toBe("error");
  });

  test("shows 4xx responses as warning notifications", () => {
    const result = getApiErrorNotification({
      isAxiosError: true,
      response: { status: 429, data: { title: "Too many requests." } },
    });

    expect(result?.severity).toBe("warning");
  });

  test("keeps transport failures without an HTTP status as error notifications", () => {
    const result = getApiErrorNotification({ isAxiosError: true, message: "Network Error" });

    expect(result?.severity).toBe("error");
  });

  test("trims the error message displayed in the Snackbar", () => {
    const error = new Error("A".repeat(200));

    expect(getApiErrorNotification(error)?.message).toHaveLength(160);
    expect(getApiErrorNotification(error)?.message).toMatch(/…$/);
  });
});
