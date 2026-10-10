import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateShareCaption,
  getPlatformShareUrl,
  canShareFiles,
  copyToClipboard,
  shareOutfit,
} from "./share";

describe("Phase 8 - lib/share.ts Sharing Module", () => {
  describe("generateShareCaption", () => {
    it("generates caption with traditional badge for remix level 0", () => {
      const caption = generateShareCaption({
        outfitTitle: "Áo ngũ thân truyền thống",
        remixLevel: 0,
        sceneName: "Tết cổ truyền",
        itemCount: 4,
        url: "https://vietmix.vercel.app",
      });

      expect(caption).toContain("Áo ngũ thân truyền thống");
      expect(caption).toContain("🌟 Phong cách: Cổ điển thuần khiết");
      expect(caption).toContain("Tết cổ truyền • 4 món trang phục");
      expect(caption).toContain("👉 Cùng phối đồ tại: https://vietmix.vercel.app");
      expect(caption).toContain("#VietPhucRemix");
    });

    it("generates caption for remix level 1 and truncates overly long summaries", () => {
      const longSummary = "A".repeat(150);
      const caption = generateShareCaption({
        presetName: "RX-01 Phối nhẹ",
        remixLevel: 1,
        sceneName: "Dạo phố cuối tuần",
        itemCount: 3,
        summary: longSummary,
      });

      expect(caption).toContain("RX-01 Phối nhẹ");
      expect(caption).toContain("✨ Phong cách: Cách tân nhẹ nhàng");
      expect(caption).toContain("Dạo phố cuối tuần • 3 món trang phục");
      expect(caption).toContain("...");
      expect(caption).toContain("#VietPhucRemix");
    });

    it("generates caption for remix level 2 (Đột phá)", () => {
      const caption = generateShareCaption({
        remixLevel: 2,
        sceneName: "Lễ hội giới trẻ",
        itemCount: 5,
      });

      expect(caption).toContain("Việt phục Remix");
      expect(caption).toContain("⚡ Phong cách: Đột phá hiện đại");
      expect(caption).toContain("Lễ hội giới trẻ • 5 món trang phục");
    });

    it("omits url and keeps hashtags when includeUrl is false", () => {
      const caption = generateShareCaption({
        outfitTitle: "RX-01 Ngũ thân hiện đại",
        remixLevel: 2,
        sceneName: "Kỷ yếu",
        itemCount: 3,
        url: "http://192.168.0.137:3000",
        includeUrl: false,
      });

      expect(caption).not.toContain("192.168.0.137");
      expect(caption).not.toContain("👉 Cùng phối đồ tại:");
      expect(caption).toContain("#VietPhucRemix");
      expect(caption).toContain("#ThoiTrangViet");
    });
  });

  describe("getPlatformShareUrl", () => {
    const siteUrl = "https://vietmix.vercel.app/outfit?id=123";

    it("encodes Facebook sharer URL correctly", () => {
      const url = getPlatformShareUrl("facebook", { url: siteUrl });
      expect(url).toBe(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`
      );
    });

    it("encodes Threads web intent with text and URL", () => {
      const text = "Cùng ngắm bộ đồ mình vừa phối!";
      const url = getPlatformShareUrl("threads", { url: siteUrl, text });
      const expectedText = `${text}\n${siteUrl}`;
      expect(url).toBe(
        `https://threads.net/intent/post?text=${encodeURIComponent(expectedText)}`
      );
    });

    it("encodes Zalo share link correctly", () => {
      const url = getPlatformShareUrl("zalo", { url: siteUrl });
      expect(url).toBe(
        `https://sp.zalo.me/share_inline?link=${encodeURIComponent(siteUrl)}`
      );
    });
  });

  describe("canShareFiles", () => {
    const originalNavigator = globalThis.navigator;

    afterEach(() => {
      Object.defineProperty(globalThis, "navigator", {
        value: originalNavigator,
        configurable: true,
        writable: true,
      });
    });

    it("returns false if navigator.canShare is undefined", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: {},
        configurable: true,
        writable: true,
      });
      expect(canShareFiles()).toBe(false);
    });

    it("returns true if navigator.canShare accepts files", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: {
          canShare: vi.fn().mockReturnValue(true),
        },
        configurable: true,
        writable: true,
      });
      expect(canShareFiles()).toBe(true);
    });
  });

  describe("copyToClipboard", () => {
    it("uses navigator.clipboard.writeText if available", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: writeTextMock },
        configurable: true,
        writable: true,
      });

      const ok = await copyToClipboard("Hello Vietmix");
      expect(ok).toBe(true);
      expect(writeTextMock).toHaveBeenCalledWith("Hello Vietmix");
    });

    it("falls back to document.execCommand if clipboard.writeText throws", async () => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error("Permission denied")),
        },
        configurable: true,
        writable: true,
      });

      const originalExecCommand = (document as unknown as { execCommand?: unknown }).execCommand;
      const execCommandMock = vi.fn().mockReturnValue(true);
      (document as unknown as { execCommand: unknown }).execCommand = execCommandMock;

      const ok = await copyToClipboard("Fallback text");
      expect(ok).toBe(true);
      expect(execCommandMock).toHaveBeenCalledWith("copy");

      if (originalExecCommand !== undefined) {
        (document as unknown as { execCommand: unknown }).execCommand = originalExecCommand;
      } else {
        delete (document as unknown as { execCommand?: unknown }).execCommand;
      }
    });
  });

  describe("shareOutfit dispatcher", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("dispatches Tier 1 (native-file) when imageBlob and file sharing are supported", async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined);
      const canShareMock = vi.fn().mockReturnValue(true);

      Object.defineProperty(navigator, "canShare", {
        value: canShareMock,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(navigator, "share", {
        value: shareMock,
        configurable: true,
        writable: true,
      });

      const blob = new Blob(["test"], { type: "image/png" });
      const result = await shareOutfit({
        title: "Việt phục",
        text: "Lời bình",
        url: "https://vietmix.vercel.app",
        imageBlob: blob,
      });

      expect(result.method).toBe("native-file");
      expect(result.success).toBe(true);
      expect(shareMock).toHaveBeenCalled();
    });

    it("handles user cancellation (AbortError) without falling back to clipboard", async () => {
      const abortError = new Error("AbortError");
      abortError.name = "AbortError";
      const shareMock = vi.fn().mockRejectedValue(abortError);

      Object.defineProperty(navigator, "canShare", {
        value: vi.fn().mockReturnValue(true),
        configurable: true,
        writable: true,
      });
      Object.defineProperty(navigator, "share", {
        value: shareMock,
        configurable: true,
        writable: true,
      });

      const blob = new Blob(["test"], { type: "image/png" });
      const result = await shareOutfit({
        title: "Việt phục",
        text: "Lời bình",
        url: "https://vietmix.vercel.app",
        imageBlob: blob,
      });

      expect(result.method).toBe("native-file");
      expect(result.success).toBe(false);
      expect(result.error).toContain("đã hủy");
    });

    it("dispatches Tier 2 (native-link) when no imageBlob is passed", async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "share", {
        value: shareMock,
        configurable: true,
        writable: true,
      });

      const result = await shareOutfit({
        title: "Việt phục",
        text: "Lời bình",
        url: "https://vietmix.vercel.app",
      });

      expect(result.method).toBe("native-link");
      expect(result.success).toBe(true);
      expect(shareMock).toHaveBeenCalledWith({
        title: "Việt phục",
        text: "Lời bình",
        url: "https://vietmix.vercel.app",
      });
    });

    it("dispatches Tier 3 (clipboard) when navigator.share is unavailable", async () => {
      Object.defineProperty(navigator, "share", {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: writeTextMock },
        configurable: true,
        writable: true,
      });

      const result = await shareOutfit({
        title: "Việt phục",
        text: "Lời bình",
        url: "https://vietmix.vercel.app",
      });

      expect(result.method).toBe("clipboard");
      expect(result.success).toBe(true);
      expect(writeTextMock).toHaveBeenCalled();
    });
  });

  describe("Audit S02 + S03 + S09: shareOutfitFile and canShareFile", () => {
    it("canShareFile validates actual File object", async () => {
      const { canShareFile } = await import("./share");
      const canShareMock = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, "canShare", {
        value: canShareMock,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(navigator, "share", {
        value: vi.fn(),
        configurable: true,
        writable: true,
      });

      const file = new File(["test-content"], "outfit.png", { type: "image/png" });
      const result = canShareFile(file);
      expect(result).toBe(true);
      expect(canShareMock).toHaveBeenCalledWith({ files: [file] });
    });

    it("shareOutfitFile constructs payload with files and text but STRICTLY NO url key", async () => {
      const { shareOutfitFile } = await import("./share");
      const shareMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "canShare", {
        value: vi.fn().mockReturnValue(true),
        configurable: true,
        writable: true,
      });
      Object.defineProperty(navigator, "share", {
        value: shareMock,
        configurable: true,
        writable: true,
      });

      const file = new File(["png-bytes"], "viet-phuc.png", { type: "image/png" });
      const result = await shareOutfitFile({
        file,
        title: "Việt Phục Remix",
        text: "Lời bình văn hóa #VietPhuc",
      });

      expect(result.status).toBe("handed-off");
      expect(result.success).toBe(true);
      expect(shareMock).toHaveBeenCalled();

      // Verify the payload passed to navigator.share:
      const payload = shareMock.mock.calls[0][0];
      expect(payload).toHaveProperty("files");
      expect(payload.files).toEqual([file]);
      expect(payload).toHaveProperty("text", "Lời bình văn hóa #VietPhuc");
      expect(payload).toHaveProperty("title", "Việt Phục Remix");
      // CRITICAL AUDIT CRITERION: Payload must NOT have 'url' key!
      expect(payload).not.toHaveProperty("url");
    });

    it("shareOutfitFile returns cancelled without falling back when user aborts", async () => {
      const { shareOutfitFile } = await import("./share");
      const abortError = new Error("Abort");
      abortError.name = "AbortError";
      const shareMock = vi.fn().mockRejectedValue(abortError);

      Object.defineProperty(navigator, "canShare", {
        value: vi.fn().mockReturnValue(true),
        configurable: true,
        writable: true,
      });
      Object.defineProperty(navigator, "share", {
        value: shareMock,
        configurable: true,
        writable: true,
      });

      const file = new File(["png-bytes"], "viet-phuc.png", { type: "image/png" });
      const result = await shareOutfitFile({ file });

      expect(result.status).toBe("cancelled");
      expect(result.success).toBe(false);
      expect(result.error).toContain("đã đóng");
    });
  });
});
