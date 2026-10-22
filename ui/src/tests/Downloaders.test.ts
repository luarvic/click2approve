import { UserFile } from "@/features/userFiles/models/userFile";
import {
  downloadApprovalRequestFile,
  downloadApprovalRequestTaskAttachment,
  downloadApprovalRequestTaskFile,
  downloadDiscussionMessageFile,
} from "@/features/userFiles/utils/downloaders";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/shared/api/axios", () => ({ default: { get: mocks.get } }));

const xml =
  '<html xmlns="http://www.w3.org/1999/xhtml"><script>localStorage.setItem("executed", "yes")</script></html>';
const dataUrl = (type: string) => `data:${type};base64,${btoa(xml)}`;
const file = (name: string, type = name.slice(name.lastIndexOf("."))): UserFile => ({
  globalId: "file-id",
  name,
  type,
  createdAt: "2026-09-24",
  createdAtDate: new Date("2026-09-24"),
  checked: false,
  size: xml.length,
});

describe("attachment previews", () => {
  const preview = { opener: {}, location: { href: "about:blank" }, close: vi.fn() };
  const downloads: HTMLAnchorElement[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    downloads.length = 0;
    preview.location.href = "about:blank";
    vi.spyOn(window, "open").mockReturnValue(preview as unknown as Window);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloads.push(this);
    });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:safe-preview");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test.each([
    downloadApprovalRequestFile,
    downloadApprovalRequestTaskFile,
    downloadApprovalRequestTaskAttachment,
    downloadDiscussionMessageFile,
  ])("downloads malicious XML through %s without opening a tab", async (download) => {
    mocks.get.mockResolvedValue({ data: dataUrl("application/xml") });
    await download("tenant", file("payload.XML"), "resource");
    expect(window.open).not.toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(downloads).toHaveLength(1);
    expect(downloads[0].download).toBe("payload.XML");
  });

  test.each(["application/xml", "text/xml", "application/xhtml+xml", "text/html", "image/svg+xml", "unknown/type"])(
    "downloads a misleading text filename with MIME type %s",
    async (type) => {
      mocks.get.mockResolvedValue({ data: dataUrl(type) });
      await downloadApprovalRequestFile("tenant", file("payload.txt"), "request");
      expect(preview.close).toHaveBeenCalled();
      expect(preview.location.href).toBe("about:blank");
      expect(URL.createObjectURL).not.toHaveBeenCalled();
      expect(downloads).toHaveLength(1);
    },
  );

  test("does not trust a safe type over an XML filename", async () => {
    mocks.get.mockResolvedValue({ data: dataUrl("application/xml") });
    await downloadApprovalRequestFile("tenant", file("payload.xml", ".txt"), "request");
    expect(window.open).not.toHaveBeenCalled();
    expect(downloads).toHaveLength(1);
  });

  test.each([
    ["file.txt", "text/plain", "text/plain"],
    ["file.json", "application/json", "text/plain"],
    ["file.csv", "text/csv", "text/plain"],
    ["file.md", "text/markdown", "text/plain"],
    ["file.pdf", "application/pdf", "application/pdf"],
    ["file.png", "image/png", "image/png"],
  ])("preserves inert previews for %s", async (name, type, expectedType) => {
    mocks.get.mockResolvedValue({ data: dataUrl(type) });
    await downloadApprovalRequestFile("tenant", file(name), "request");
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blob.type).toBe(expectedType);
    expect(preview.location.href).toBe("blob:safe-preview");
    expect(preview.opener).toBeNull();
    expect(downloads).toHaveLength(0);
    vi.advanceTimersByTime(60000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:safe-preview");
  });

  test("downloads when the browser blocks the preview tab", async () => {
    vi.mocked(window.open).mockReturnValue(null);
    mocks.get.mockResolvedValue({ data: dataUrl("text/plain") });
    await downloadApprovalRequestFile("tenant", file("file.txt"), "request");
    expect(downloads).toHaveLength(1);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  test("closes the empty preview when no content is returned", async () => {
    mocks.get.mockResolvedValue({ data: null });
    await downloadApprovalRequestFile("tenant", file("file.txt"), "request");
    expect(preview.close).toHaveBeenCalled();
    expect(downloads).toHaveLength(0);
  });
});
