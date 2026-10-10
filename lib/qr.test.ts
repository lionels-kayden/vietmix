import { describe, it, expect } from "vitest";
import { generateShareUrl, generateQrDataUrl } from "./qr";

describe("QR Code and Share URL Utilities (lib/qr.ts)", () => {
  it("generates correct share URL with outfit query parameters", () => {
    const url = generateShareUrl({
      gender: "female",
      itemIds: ["F_B_TOP_ao_giao_linh", "F_B_BOTTOM_vay_dai"],
      sceneId: "tet",
      baseUrl: "https://vietmix.example.com",
    });

    expect(url).toContain("https://vietmix.example.com/dress-up?");
    expect(url).toContain("gender=female");
    expect(url).toContain("items=F_B_TOP_ao_giao_linh%2CF_B_BOTTOM_vay_dai");
    expect(url).toContain("scene=tet");
  });

  it("generates a valid base64 PNG data URL for QR code", async () => {
    const dataUrl = await generateQrDataUrl("https://vietmix.example.com/dress-up");
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(dataUrl.length).toBeGreaterThan(100);
  });
});
