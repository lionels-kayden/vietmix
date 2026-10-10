"use client";

import React, { useState, useEffect, useRef } from "react";
import { Gender } from "@/lib/types";
import { getPlatformShareUrl, copyToClipboard } from "@/lib/share";
import { generateQrDataUrl } from "@/lib/qr";
import { getScene } from "@/lib/data";
import { CharacterCanvas } from "./CharacterCanvas";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  caption: string;
  url: string;
  gender?: Gender;
  itemIds?: string[];
  sceneId?: string;
  onNativeShare?: () => void;
  onDownloadImage?: () => void;
  isPreparingImage?: boolean;
  isSharing?: boolean;
}

export function ShareModal({
  isOpen,
  onClose,
  title,
  caption,
  url,
  gender,
  itemIds,
  sceneId,
  onNativeShare,
  onDownloadImage,
  isPreparingImage = false,
  isSharing = false,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const scene = sceneId ? getScene(sceneId) : null;
  const sceneName = scene?.name_vi;

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset copy state and generate QR code for the specific outfit URL
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      let isMounted = true;
      generateQrDataUrl(url, { size: 180 })
        .then((data) => {
          if (isMounted) setQrCodeUrl(data);
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopyCaption = async () => {
    const success = await copyToClipboard(caption);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const fbUrl = getPlatformShareUrl("facebook", { url });
  const threadsUrl = getPlatformShareUrl("threads", { url, text: caption });
  const zaloUrl = getPlatformShareUrl("zalo", { url });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      data-testid="share-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4 text-[var(--ink-text)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-paper)] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">✨</span>
            <h3 id="share-modal-title" className="font-serif font-bold text-lg md:text-xl text-[var(--red-lacquer)]">
              Chia sẻ trang phục
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="btn-close-share"
            aria-label="Đóng cửa sổ chia sẻ"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-black/5 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)]"
          >
            <span className="text-lg font-bold" aria-hidden="true">✕</span>
          </button>
        </div>

        {/* 1. Visual Outfit Card with QR Code in Corner (Full 9:16 portrait) */}
        {gender && itemIds ? (
          <div
            data-testid="share-outfit-card"
            className="relative w-full max-w-[230px] sm:max-w-[250px] mx-auto rounded-2xl overflow-hidden border-2 border-[var(--border-paper)] shadow-lg bg-[var(--bg-cream)] shrink-0"
            style={{ aspectRatio: "9/16" }}
          >
            <CharacterCanvas
              gender={gender}
              itemIds={itemIds}
              sceneId={sceneId}
              className="w-full h-full rounded-none border-0 shadow-none"
            />

            {/* Top-left: Outfit Title Badge */}
            <div className="absolute top-2.5 left-2.5 z-30 bg-black/65 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm max-w-[65%]">
              <span className="text-amber-300">✦</span>
              <span className="truncate">{title}</span>
            </div>

            {/* Top-right: Branding badge */}
            <div className="absolute top-2.5 right-2.5 z-30 bg-white/85 backdrop-blur-md text-[var(--ink-text)] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[var(--border-paper)] shadow-xs">
              Việt Phục Remix
            </div>

            {/* Bottom-left: Scene Name */}
            {sceneName && (
              <div className="absolute bottom-2.5 left-2.5 z-30 bg-black/55 backdrop-blur-md text-white/90 text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 max-w-[45%]">
                <span>📍</span>
                <span className="truncate">{sceneName}</span>
              </div>
            )}

            {/* Bottom-Right Corner: QR Code */}
            <div className="absolute bottom-2.5 right-2.5 z-30 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-[var(--border-paper)] shadow-xl flex flex-col items-center">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Mã QR mở bộ trang phục"
                  data-testid="share-qr-code"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-md object-contain"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-100 rounded-md flex items-center justify-center text-[9px] text-zinc-400">
                  Đang tạo QR...
                </div>
              )}
              <span className="text-[8px] font-bold text-[var(--red-lacquer)] mt-0.5 tracking-tight leading-tight">
                Quét thử đồ
              </span>
            </div>
          </div>
        ) : (
          /* Fallback when outfit layers not passed */
          <div className="flex flex-col items-center justify-center p-3.5 bg-white/90 border border-[var(--border-paper)] rounded-2xl gap-2 shadow-xs">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Mã QR mở bộ trang phục"
                data-testid="share-qr-code"
                className="w-32 h-32 rounded-lg object-contain shadow-xs border border-[var(--border-paper)]"
              />
            ) : (
              <div className="w-32 h-32 bg-zinc-100 rounded-lg flex items-center justify-center text-xs text-zinc-400">
                Đang tạo mã QR...
              </div>
            )}
          </div>
        )}

        {/* Instruction under the card */}
        <p className="text-xs text-[var(--ink-muted)] text-center font-medium -mt-1">
          📱 Quét mã QR ở góc ảnh bằng camera để mở & thử đúng bộ đồ này
        </p>

        {/* Primary Action Button: Native Share File (Audit S01 + S05) */}
        {onNativeShare && (
          <button
            type="button"
            onClick={onNativeShare}
            disabled={isPreparingImage || isSharing}
            data-testid="btn-native-share"
            className="min-h-[48px] w-full px-4 py-2.5 rounded-xl bg-[var(--red-lacquer)] text-white font-bold text-xs sm:text-sm hover:opacity-90 disabled:opacity-60 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)]"
          >
            <span className="text-base" aria-hidden="true">📲</span>
            <span>
              {isSharing
                ? "Đang mở bảng chia sẻ..."
                : isPreparingImage
                ? "Đang chuẩn bị ảnh thẻ..."
                : "Chia sẻ ảnh ngay (Bảng chia sẻ hệ thống)"}
            </span>
          </button>
        )}

        {/* Action Buttons Row 2: Download PNG with QR & Copy Hashtags (Audit S10 separation) */}
        <div className="grid grid-cols-2 gap-2.5">
          {onDownloadImage && (
            <button
              type="button"
              onClick={onDownloadImage}
              data-testid="btn-download-share-card"
              className="min-h-[44px] px-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-800 font-semibold text-xs sm:text-sm hover:bg-zinc-50 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span aria-hidden="true">📥</span>
              <span>Tải ảnh thẻ PNG</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyCaption}
            data-testid="btn-copy-caption"
            className="min-h-[44px] px-3 py-2 rounded-xl border border-[var(--indigo-deep)] bg-indigo-50 text-[var(--indigo-deep)] font-semibold text-xs sm:text-sm hover:bg-indigo-100 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--indigo-deep)]"
          >
            <span aria-hidden="true">{copied ? "✓" : "📋"}</span>
            <span>{copied ? "Đã chép hashtag!" : "Sao chép hashtag"}</span>
          </button>
        </div>

        {/* Direct Social Links Section (Audit S01: Genuine link sharing without hijacking) */}
        <div className="flex flex-col gap-2 pt-1 border-t border-[var(--border-paper)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Chia sẻ liên kết lên mạng xã hội
            </p>
            <span className="text-[10px] text-zinc-500">Mở bài đăng kèm link bộ đồ</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="share-link-facebook"
              aria-label="Chia sẻ liên kết lên Facebook"
              className="min-h-[44px] flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-800 hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <span className="text-base" aria-hidden="true">📘</span>
              <span>Facebook</span>
            </a>

            <a
              href={threadsUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="share-link-threads"
              aria-label="Chia sẻ liên kết lên Threads"
              className="min-h-[44px] flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-zinc-300 bg-zinc-50 text-zinc-900 hover:bg-zinc-100 font-semibold text-xs transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
            >
              <span className="text-base" aria-hidden="true">🧵</span>
              <span>Threads</span>
            </a>

            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="share-link-zalo"
              aria-label="Chia sẻ liên kết qua Zalo"
              className="min-h-[44px] flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 font-semibold text-xs transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600"
            >
              <span className="text-base" aria-hidden="true">💬</span>
              <span>Zalo</span>
            </a>
          </div>
        </div>

        {/* Instagram / TikTok Fallback Notice */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
          <span className="text-sm mt-0.5" aria-hidden="true">💡</span>
          <p className="text-amber-800 leading-relaxed">
            <span className="font-semibold">Đăng lên Facebook, Instagram hoặc TikTok:</span> Bấm <span className="font-bold text-[var(--red-lacquer)]">Tải ảnh thẻ</span> để lưu ảnh thẻ PNG kèm mã QR, sau đó dán hashtag đã sao chép vào bài đăng nhé!
          </p>
        </div>
      </div>
    </div>
  );
}
