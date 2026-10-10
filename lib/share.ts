/**
 * Sharing module for Viet Phuc Remix (Phase 8 & Audit S01-S03, S09).
 * Provides clear separation between:
 * 1. File-only native sharing (PNG card image with hashtags, NO URL in payload).
 * 2. Link native sharing (URL + text intent).
 * 3. Platform intent links (Facebook, Threads, Zalo) and Clipboard utilities.
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

export type SocialPlatform = "facebook" | "threads" | "zalo";

export type ShareFileStatus = "handed-off" | "cancelled" | "unsupported" | "failed";

export interface ShareFileResult {
  status: ShareFileStatus;
  success: boolean;
  error?: string;
}

export type ShareLinkStatus = "handed-off" | "cancelled" | "unsupported" | "failed";

export interface ShareLinkResult {
  status: ShareLinkStatus;
  success: boolean;
  error?: string;
}

/**
 * Legacy interface for backward compatibility with existing tests
 */
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
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    case "threads": {
      const threadsText = text ? (url ? `${text}\n${url}` : text) : url;
      return `https://threads.net/intent/post?text=${encodeURIComponent(threadsText)}`;
    }

    case "zalo":
      return `https://sp.zalo.me/share_inline?link=${encodedUrl}`;

    default:
      return url;
  }
}

/**
 * Tests if the browser can share a specific File via navigator.canShare (Audit S09).
 */
export function canShareFile(file: File): boolean {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.canShare !== "function"
  ) {
    return false;
  }
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/**
 * General probe if browser supports any file sharing.
 */
export function canShareFiles(): boolean {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.canShare !== "function"
  ) {
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
 * Primary Native File Share (Audit S02 + S03).
 * Shares ONLY the file (+ optional title/text).
 * CRITICAL: NEVER includes the 'url' key so the browser doesn't inject the website URL into the share sheet!
 * Does NOT fallback to link/clipboard on failure; returns typed status so caller decides UI behavior.
 */
export async function shareOutfitFile(options: {
  file: File;
  title?: string;
  text?: string;
}): Promise<ShareFileResult> {
  const { file, title, text } = options;

  if (!canShareFile(file)) {
    return {
      status: "unsupported",
      success: false,
      error: "Trình duyệt không hỗ trợ chia sẻ tệp trực tiếp.",
    };
  }

  // Construct payload with NO 'url' key
  const shareData: ShareData = {
    files: [file],
  };
  if (title) shareData.title = title;
  if (text) shareData.text = text;

  try {
    await navigator.share(shareData);
    return {
      status: "handed-off",
      success: true,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return {
        status: "cancelled",
        success: false,
        error: "Người dùng đã đóng bảng chia sẻ.",
      };
    }
    return {
      status: "failed",
      success: false,
      error: err instanceof Error ? err.message : "Chia sẻ tệp không thành công.",
    };
  }
}

/**
 * Dedicated Native Link Share (Audit S01 + S02 separation).
 * Specifically for sharing URL links.
 */
export async function shareOutfitLink(options: {
  title: string;
  text?: string;
  url: string;
}): Promise<ShareLinkResult> {
  const { title, text, url } = options;

  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return {
      status: "unsupported",
      success: false,
      error: "Trình duyệt không hỗ trợ chia sẻ liên kết.",
    };
  }

  try {
    await navigator.share({ title, text, url });
    return {
      status: "handed-off",
      success: true,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return {
        status: "cancelled",
        success: false,
        error: "Người dùng đã đóng bảng chia sẻ.",
      };
    }
    return {
      status: "failed",
      success: false,
      error: err instanceof Error ? err.message : "Chia sẻ liên kết không thành công.",
    };
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
 * Legacy multi-tier dispatcher for backward compatibility with existing tests.
 */
export async function shareOutfit({
  title,
  text,
  url,
  imageBlob,
  fileName = "viet-phuc-remix.png",
}: ShareOutfitOptions): Promise<ShareResult> {
  // Tier 1: Try Web Share with image file if blob is provided
  if (imageBlob) {
    const file = new File([imageBlob], fileName, {
      type: imageBlob.type || "image/png",
    });
    const fileResult = await shareOutfitFile({ file, title, text });
    if (fileResult.success) {
      return { method: "native-file", success: true };
    }
    if (fileResult.status === "cancelled") {
      return { method: "native-file", success: false, error: "Người dùng đã hủy chia sẻ." };
    }
    // Only proceed to Tier 2 if specifically requested with a non-empty URL
  }

  // Tier 2: Try Web Share with link if URL is non-empty
  if (url && typeof navigator !== "undefined" && typeof navigator.share === "function") {
    const linkResult = await shareOutfitLink({ title, text, url });
    if (linkResult.success) {
      return { method: "native-link", success: true };
    }
    if (linkResult.status === "cancelled") {
      return { method: "native-link", success: false, error: "Người dùng đã hủy chia sẻ." };
    }
  }

  // Tier 3: Clipboard Fallback
  const contentToCopy = text ? (url ? `${text}\n${url}` : text) : url;
  if (contentToCopy) {
    const copied = await copyToClipboard(contentToCopy);
    if (copied) {
      return { method: "clipboard", success: true };
    }
  }

  return {
    method: "none",
    success: false,
    error: "Không thể chia sẻ trên trình duyệt hiện tại.",
  };
}
