import { parseUtcDateTime } from "@/shared/utils/helpers";
import { describe, expect, test } from "vitest";

describe("parseUtcDateTime", () => {
  test("interprets an offset-free API timestamp as UTC", () => {
    expect(parseUtcDateTime("2026-07-13T14:30:00").toISOString()).toBe(
      "2026-07-13T14:30:00.000Z",
    );
  });

  test("preserves an explicit UTC or offset timestamp", () => {
    expect(parseUtcDateTime("2026-07-13T14:30:00Z").toISOString()).toBe(
      "2026-07-13T14:30:00.000Z",
    );
    expect(parseUtcDateTime("2026-07-13T16:30:00+02:00").toISOString()).toBe(
      "2026-07-13T14:30:00.000Z",
    );
  });
});
