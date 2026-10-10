"use client";

import React, { useState, useEffect } from "react";
import {
  LookbookEntry,
  getLookbook,
  getLegacyLookbook,
  deleteFromLookbook,
  downloadDataUrl,
  dataUrlToFile,
} from "@/lib/lookbook";
import { getScene } from "@/lib/data";
import { shareOutfitFile, generateShareCaption } from "@/lib/share";

export interface LookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReWear?: (entry: LookbookEntry) => void;
}

export function LookbookModal({ isOpen, onClose, onReWear }: LookbookModalProps) {
  const [entries, setEntries] = useState<LookbookEntry[]>(() => {
    return getLegacyLookbook();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewEntry, setPreviewEntry] = useState<LookbookEntry | null>(null);
  const [isSharingId, setIsSharingId] = useState<string | null>(null);

  const loadEntries = async () => {
    try {
      const data = await getLookbook();
      if (data) {
        setEntries(data);
      }
    } catch {
      // keep initial fallback
    }
  };

  useEffect(() => {
    if (isOpen) {
      setEntries(getLegacyLookbook());
      loadEntries();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredEntries = entries.filter((e) => {
    if (genderFilter === "all") return true;
    return e.gender === genderFilter;
  });

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
    showToast("✓ Đã xóa bộ trang phục khỏi Album!");
    deleteFromLookbook(id).catch(() => {});
  };

  const handleDownload = (entry: LookbookEntry) => {
    if (!entry.imageData) {
      showToast("Bộ này chưa có ảnh PNG. Hãy bấm 'Mặc lại' để xuất ảnh mới!");
      return;
    }
    const filename = `viet-phuc-remix-${entry.gender}-${entry.id}.png`;
    const ok = downloadDataUrl(entry.imageData, filename);
    if (ok) {
      showToast("✓ Đang tải ảnh thẻ PNG về máy!");
    } else {
      showToast("⚠️ Không thể tải ảnh trực tiếp.");
    }
  };

  const handleShare = async (entry: LookbookEntry) => {
    if (isSharingId) return;
    setIsSharingId(entry.id);

    try {
      if (!entry.imageData) {
        showToast("Bộ này chưa có ảnh thẻ PNG. Hãy bấm 'Mặc lại' để tạo ảnh chia sẻ!");
        return;
      }

      const file = dataUrlToFile(entry.imageData, `viet-phuc-remix-${entry.id}.png`);
      if (!file) {
        showToast("⚠️ Không thể chuẩn bị tệp ảnh chia sẻ.");
        return;
      }

      const scene = getScene(entry.sceneId);
      const sceneName = scene?.name_vi || "Không gian cổ phong";
      const outfitTitle = entry.title || (entry.gender === "male" ? "Nam Cổ Phục" : "Nữ Cổ Phục");

      const shareCaption = generateShareCaption({
        outfitTitle,
        remixLevel: entry.remixLevel,
        sceneName,
        itemCount: entry.itemIds.length,
        summary: entry.summary,
        includeUrl: false,
      });

      const res = await shareOutfitFile({
        file,
        title: outfitTitle,
        text: shareCaption,
      });

      if (res.status === "handed-off") {
        showToast("✓ Đã mở bảng chia sẻ thành công!");
      } else if (res.status === "cancelled") {
        // Dismissed by user - no error
      } else if (res.status === "unsupported") {
        // Fallback to downloading
        handleDownload(entry);
        showToast("Thiết bị chưa hỗ trợ chia sẻ tệp. Đã tự động tải ảnh về máy!");
      } else if (res.error) {
        showToast(`⚠️ ${res.error}`);
      }
    } catch {
      showToast("⚠️ Không thể mở bảng chia sẻ.");
    } finally {
      setIsSharingId(null);
    }
  };

  const handleReWear = (entry: LookbookEntry) => {
    if (onReWear) {
      onReWear(entry);
      onClose();
    }
  };

  return (
    <div
      data-testid="lookbook-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-in fade-in"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          data-testid="album-toast"
          role="status"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] bg-zinc-900 text-white px-4 py-2.5 rounded-full text-xs md:text-sm font-semibold shadow-xl border border-zinc-700 animate-in fade-in"
        >
          {toastMessage}
        </div>
      )}

      {/* Main Album Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="album-modal-title"
        data-testid="lookbook-modal"
        className="w-full max-w-4xl max-h-[92vh] bg-[var(--bg-cream)] rounded-2xl border border-[var(--border-paper)] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-white border-b border-[var(--border-paper)] px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" aria-hidden="true">📖</span>
            <div>
              <h3
                id="album-modal-title"
                className="font-serif font-bold text-lg md:text-xl text-[var(--red-lacquer)]"
              >
                Tủ Đồ Cá Nhân (Album Lookbook)
              </h3>
              <p className="text-xs text-[var(--ink-muted)]">
                Lưu trữ trên thiết bị cá nhân • {entries.length} bộ trang phục
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            data-testid="btn-close-lookbook"
            className="min-h-[40px] px-3.5 py-1.5 text-xs md:text-sm font-semibold text-[var(--ink-muted)] hover:text-[var(--ink-text)] rounded-xl border border-[var(--border-paper)] bg-[var(--bg-paper)] hover:bg-white transition-all cursor-pointer"
            aria-label="Đóng Album Lookbook"
          >
            Đóng ✕
          </button>
        </div>

        {/* Filter Bar & Device Storage Badge */}
        <div className="bg-[var(--bg-paper)]/70 px-5 py-2.5 border-b border-[var(--border-paper)] flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Gender Filter Tabs */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Bộ lọc giới tính Album">
            <button
              type="button"
              role="tab"
              aria-selected={genderFilter === "all"}
              onClick={() => setGenderFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                genderFilter === "all"
                  ? "bg-[var(--red-lacquer)] text-white shadow-xs font-semibold"
                  : "bg-white text-[var(--ink-text)] border border-[var(--border-paper)] hover:bg-zinc-50"
              }`}
            >
              Tất cả ({entries.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={genderFilter === "female"}
              onClick={() => setGenderFilter("female")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                genderFilter === "female"
                  ? "bg-[var(--red-lacquer)] text-white shadow-xs font-semibold"
                  : "bg-white text-[var(--ink-text)] border border-[var(--border-paper)] hover:bg-zinc-50"
              }`}
            >
              Nữ ({entries.filter((e) => e.gender === "female").length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={genderFilter === "male"}
              onClick={() => setGenderFilter("male")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                genderFilter === "male"
                  ? "bg-[var(--red-lacquer)] text-white shadow-xs font-semibold"
                  : "bg-white text-[var(--ink-text)] border border-[var(--border-paper)] hover:bg-zinc-50"
              }`}
            >
              Nam ({entries.filter((e) => e.gender === "male").length})
            </button>
          </div>

          {/* Offline/Local badge */}
          <div className="text-[11px] text-[var(--ink-muted)] flex items-center gap-1">
            <span>💾</span>
            <span>Dữ liệu lưu an toàn trên trình duyệt thiết bị (IndexedDB)</span>
          </div>
        </div>

        {/* Modal Body: Album Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-[var(--ink-muted)]">
              <span className="text-2xl animate-spin mb-2">⌛</span>
              <span>Đang tải album trang phục...</span>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div
              data-testid="lookbook-empty"
              className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--bg-paper)] border border-[var(--border-paper)] flex items-center justify-center text-3xl">
                👘
              </div>
              <h4 className="font-serif font-bold text-base md:text-lg text-[var(--ink-text)]">
                Chưa có bộ trang phục nào trong Album
              </h4>
              <p className="text-xs md:text-sm text-[var(--ink-muted)] leading-relaxed">
                Sau khi phối đồ trong phòng thử đồ, hãy bấm nút <strong>"Lưu Lookbook"</strong> để lưu trữ cả ảnh thẻ PNG và thông tin trang phục vào album cá nhân của bạn!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {filteredEntries.map((entry) => {
                const scene = getScene(entry.sceneId);
                const sceneName = scene?.name_vi || entry.sceneId;
                const formattedDate = new Date(entry.timestamp).toLocaleDateString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });

                return (
                  <div
                    key={entry.id}
                    data-testid={`lookbook-item-${entry.id}`}
                    className="bg-white rounded-2xl border border-[var(--border-paper)] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
                  >
                    {/* Thumbnail Image Section */}
                    <div className="relative aspect-[4/5] bg-zinc-100 border-b border-[var(--border-paper)] overflow-hidden flex items-center justify-center">
                      {entry.imageData ? (
                        <>
                          <img
                            src={entry.imageData}
                            alt={entry.title || "Thẻ trang phục Việt phục Remix"}
                            data-testid={`thumbnail-${entry.id}`}
                            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02] cursor-pointer"
                            onClick={() => setPreviewEntry(entry)}
                          />
                          <button
                            type="button"
                            onClick={() => setPreviewEntry(entry)}
                            className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[11px] px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 cursor-pointer"
                            aria-label="Phóng to ảnh thẻ"
                          >
                            <span>🔍</span>
                            <span>Xem lớn</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                          <span className="text-3xl">👗</span>
                          <span className="text-xs font-semibold text-[var(--ink-text)]">
                            {entry.gender === "male" ? "Nam" : "Nữ"} • {entry.itemIds.length} món
                          </span>
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Chưa tạo ảnh thẻ
                          </span>
                        </div>
                      )}

                      {/* Gender Badge Over Image */}
                      <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs border border-[var(--border-paper)] text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-[var(--red-lacquer)] shadow-xs">
                        {entry.gender === "male" ? "Nam" : "Nữ"}
                      </span>

                      {/* Remix Level Badge */}
                      <span className="absolute top-2.5 right-2.5 bg-[var(--indigo-deep)]/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
                        Mốc {entry.remixLevel}
                      </span>
                    </div>

                    {/* Metadata & Details Section */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-serif font-bold text-sm text-[var(--ink-text)] truncate">
                            {entry.title || (entry.gender === "male" ? "Nam Cổ Phục" : "Nữ Cổ Phục")}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[var(--ink-muted)]">
                          <span>🏛️ {sceneName}</span>
                          <span>•</span>
                          <span>{entry.itemIds.length} món đồ</span>
                        </div>

                        <p className="text-xs text-[var(--ink-text)] line-clamp-2 leading-relaxed bg-[var(--bg-cream)]/40 p-2 rounded-lg border border-[var(--border-paper)]/60">
                          {entry.summary}
                        </p>

                        <div className="text-[10px] text-[var(--ink-muted)] pt-0.5">
                          Đã lưu: {formattedDate}
                        </div>
                      </div>

                      {/* Action Buttons Toolbar */}
                      <div className="pt-2 border-t border-[var(--border-paper)] flex flex-col gap-2">
                        {/* Primary Row: Re-wear & Download */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleReWear(entry)}
                            data-testid={`btn-rewear-${entry.id}`}
                            className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--indigo-deep)] hover:opacity-90 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--indigo-deep)]"
                            aria-label={`Mặc lại bộ ${entry.id} để chỉnh sửa`}
                          >
                            <span>👗</span>
                            <span>Mặc lại</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownload(entry)}
                            data-testid={`btn-download-${entry.id}`}
                            className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--red-lacquer)] hover:opacity-90 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)]"
                            aria-label={`Tải ảnh thẻ bộ ${entry.id}`}
                          >
                            <span>📥</span>
                            <span>Tải ảnh</span>
                          </button>
                        </div>

                        {/* Secondary Row: Share & Delete */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleShare(entry)}
                            disabled={isSharingId === entry.id}
                            data-testid={`btn-share-${entry.id}`}
                            className="min-h-[34px] px-2.5 py-1 rounded-xl border border-[var(--border-paper)] bg-[var(--bg-cream)] hover:bg-white text-[var(--ink-text)] font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                            aria-label={`Chia sẻ bộ ${entry.id}`}
                          >
                            <span>📲</span>
                            <span>{isSharingId === entry.id ? "Đang chia sẻ..." : "Chia sẻ"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(entry.id)}
                            data-testid={`btn-delete-${entry.id}`}
                            className="min-h-[34px] px-2.5 py-1 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                            aria-label={`Xóa bộ ${entry.id} khỏi album`}
                          >
                            <span>🗑️</span>
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Fullscreen Image Preview Modal */}
      {previewEntry && (
        <div
          data-testid="album-lightbox"
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewEntry(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-paper)]">
              <h4 className="font-serif font-bold text-base text-[var(--red-lacquer)]">
                {previewEntry.title || "Ảnh Thẻ Việt Phục"}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewEntry(null)}
                className="text-sm font-semibold px-2.5 py-1 rounded-lg border border-[var(--border-paper)] hover:bg-zinc-100"
              >
                Đóng ✕
              </button>
            </div>

            {previewEntry.imageData && (
              <img
                src={previewEntry.imageData}
                alt={previewEntry.title || "Xem chi tiết ảnh thẻ"}
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl border border-[var(--border-paper)]"
              />
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleDownload(previewEntry)}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-[var(--red-lacquer)] text-white font-semibold text-xs md:text-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>📥</span>
                <span>Tải ảnh PNG</span>
              </button>
              <button
                type="button"
                onClick={() => handleShare(previewEntry)}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-[var(--indigo-deep)] text-white font-semibold text-xs md:text-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>📲</span>
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
