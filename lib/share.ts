/**
 * Sharing module for Viet phuc Remix (Phase 8: Full Sharing).
 * Supports 3-tier sharing:
 * 1. Native Web Share API with PNG image file (mobile/modern browsers).
 * 2. Native Web Share API with text & URL link.
 * 3. Platform intent links (Facebook, Threads, Zalo) and Clipboard fallback.
 */

export interface ShareCaptionOptions {
  outfitTitle?: string;
  presetName?: string;
  remixLevel: number;
  sceneName: string;
  itemCount: number;
  url?: string;
  summary?: string;
  includeUrl?: boolean;
}

export interface ShareOutfitOptions {
  title: string;
  text: string;
  url: string;
  imageBlob?: Blob;
  fileName?: string;
}

export type ShareResultMethod = "native-file" | "native-link" | "clipboard" | "none";

export interface ShareResult {
  method: ShareResultMethod;
  success: boolean;
  error?: string;
}

export type SocialPlatform = "facebook" | "threads" | "zalo";

/**
 * Generates an engaging Vietnamese cultural caption with hashtags for social sharing.
 */
export function generateShareCaption({
  outfitTitle,
  presetName,
  remixLevel,
  sceneName,
  itemCount,
  url,
  summary,
  includeUrl,
}: ShareCaptionOptions): string {
  const title = outfitTitle || presetName || "Việt phục Remix";

  const levelTag =
    remixLevel === 0
      ? "🌟 Phong cách: Cổ điển thuần khiết"
      : remixLevel === 1
      ? "✨ Phong cách: Cách tân nhẹ nhàng"
      : "⚡ Phong cách: Đột phá hiện đại";

  const lines: string[] = [
    `🪷 ${title}`,
    levelTag,
    `📍 Bối cảnh: ${sceneName} • ${itemCount} món trang phục`,
  ];

  if (summary) {
    const trimmedSummary = summary.length > 120 ? summary.slice(0, 117) + "..." : summary;
    lines.push(`💬 "${trimmedSummary}"`);
  }

  if (url && includeUrl !== false) {
    lines.push(`👉 Cùng phối đồ tại: ${url}`);
  }

  lines.push("#VietPhucRemix #VietPhuc #CoPhuc #GenZ #ThoiTrangViet");

  return lines.join("\n");
}

/**
 * Builds direct sharing URLs for Facebook, Threads, and Zalo.
 */
export function getPlatformShareUrl(
  platform: SocialPlatform,
  options: { url: string; text?: string }
): string {
  const { url, text } = options;
  const encodedUrl = encodeURIComponent(url);

  switch (platform) {
    case "facebook":
      // Facebook Sharer URL specification
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    case "threads":
      // Threads Web Intent specification
      const threadsText = text ? (url ? `${text}\n${url}` : text) : url;
      return `https://threads.net/intent/post?text=${encodeURIComponent(threadsText)}`;

    case "zalo":
      // Zalo Web Share link specification
      return `https://sp.zalo.me/share_inline?link=${encodedUrl}`;

    default:
      return url;
  }
}

/**
 * Checks if the browser supports sharing files via Web Share API.
 */
export function canShareFiles(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") {
    return false;
  }
  if (typeof File === "undefined") {
    return false;
  }
  try {
    const testFile = new File(["test"], "test.png", { type: "image/png" });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

/**
 * Copies text safely to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  if (typeof document !== "undefined" && typeof document.execCommand === "function") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Multi-tier sharing dispatcher:
 * 1. Web Share API with image file
 * 2. Web Share API with text & URL
 * 3. Clipboard copy
 */
export async function shareOutfit({
  title,
  text,
  url,
  imageBlob,
  fileName = "viet-phuc-remix.png",
}: ShareOutfitOptions): Promise<ShareResult> {
  // Tier 1: Try Web Share with image file
  if (
    imageBlob &&
    canShareFiles() &&
    typeof navigator !== "undefined" &&
    navigator.share
  ) {
    try {
      const file = new File([imageBlob], fileName, {
        type: imageBlob.type || "image/png",
      });
      await navigator.share({
        title,
        text,
        url,
        files: [file],
      });
      return { method: "native-file", success: true };
    } catch (err: unknown) {
      // If user cancelled, don't fall back to clipboard
      if (err instanceof Error && err.name === "AbortError") {
        return { method: "native-file", success: false, error: "Người dùng đã hủy chia sẻ." };
      }
      // If file sharing failed due to NotSupportedError, proceed to Tier 2
    }
  }

  // Tier 2: Try Web Share with text & link
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return { method: "native-link", success: true };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return { method: "native-link", success: false, error: "Người dùng đã hủy chia sẻ." };
      }
      // Proceed to Tier 3 fallback
    }
  }

  // Tier 3: Clipboard Fallback
  const contentToCopy = text ? `${text}\n${url}` : url;
  const copied = await copyToClipboard(contentToCopy);
  if (copied) {
    return { method: "clipboard", success: true };
  }

  return {
    method: "none",
    success: false,
    error: "Không thể chia sẻ trên trình duyệt hiện tại.",
  };
}
