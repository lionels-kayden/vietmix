import { describe, it, expect, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Lora: () => ({ variable: "--font-serif" }),
  Be_Vietnam_Pro: () => ({ variable: "--font-sans" }),
}));

import { metadata } from "./layout";

describe("Phase 9 - Metadata and Open Graph Configuration", () => {
  it("exports valid metadataBase URL", () => {
    expect(metadata.metadataBase).toBeInstanceOf(URL);
    const baseHref = metadata.metadataBase ? String(metadata.metadataBase) : "";
    expect(baseHref).toMatch(/^https?:\/\//);
  });

  it("configures Vietnamese title template and default", () => {
    expect(metadata.title).toBeDefined();
    if (typeof metadata.title === "object" && metadata.title !== null && "default" in metadata.title) {
      expect(metadata.title.default).toContain("Việt phục Remix");
      expect(metadata.title.template).toContain("%s | Việt phục Remix");
    } else {
      expect(metadata.title).toContain("Việt phục Remix");
    }
  });

  it("includes description and cultural keywords", () => {
    expect(metadata.description).toContain("trang phục truyền thống Việt Nam");
    expect(metadata.keywords).toContain("Việt phục");
    expect(metadata.keywords).toContain("Áo ngũ thân");
    expect(metadata.keywords).toContain("Cổ phục");
  });

  it("provides comprehensive Open Graph metadata with vi_VN locale and og-image", () => {
    const og = metadata.openGraph;
    expect(og).toBeDefined();
    expect(og?.siteName).toBe("Việt phục Remix");
    expect(og?.locale).toBe("vi_VN");
    const ogAny = og as Record<string, unknown> | undefined;
    expect(ogAny?.type).toBe("website");

    const images = og?.images;
    expect(images).toBeDefined();
    expect(Array.isArray(images)).toBe(true);
    if (Array.isArray(images)) {
      expect(images.length).toBeGreaterThan(0);
      const img = images[0] as { url: string; width?: number; height?: number };
      expect(img.url).toBe("/og-image.png");
      expect(img.width).toBe(1200);
      expect(img.height).toBe(630);
    }
  });

  it("configures Twitter card summary_large_image", () => {
    const twitter = metadata.twitter;
    expect(twitter).toBeDefined();
    const twitterAny = twitter as Record<string, unknown> | undefined;
    expect(twitterAny?.card).toBe("summary_large_image");
    expect(twitterAny?.images).toEqual(["/og-image.png"]);
  });
});
