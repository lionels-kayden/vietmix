import QRCode from "qrcode";
import { Gender } from "./types";

export interface GenerateShareUrlOptions {
  gender: Gender;
  itemIds: string[];
  sceneId?: string;
  baseUrl?: string;
}

/**
 * Builds a direct dress-up share URL containing full outfit configuration in query parameters.
 */
export function generateShareUrl({
  gender,
  itemIds,
  sceneId = "tet",
  baseUrl,
}: GenerateShareUrlOptions): string {
  const base =
    baseUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "https://vietmix.vercel.app");

  const cleanBase = base.replace(/\/+$/, "");
  const params = new URLSearchParams();
  params.set("gender", gender);
  params.set("items", itemIds.join(","));
  params.set("scene", sceneId);

  return `${cleanBase}/dress-up?${params.toString()}`;
}

/**
 * Generates an SVG or PNG Data URL representing a QR code.
 */
export async function generateQrDataUrl(
  text: string,
  options?: { size?: number; margin?: number }
): Promise<string> {
  const width = options?.size || 200;
  const margin = options?.margin ?? 1;

  try {
    return await QRCode.toDataURL(text, {
      width,
      margin,
      color: {
        dark: "#8B1E0F", // Red lacquer color
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });
  } catch (err) {
    console.error("Failed to generate QR Code:", err);
    // Fallback: standard black & white
    return QRCode.toDataURL(text, { width, margin });
  }
}
