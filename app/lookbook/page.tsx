"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LookbookEntry, getLookbook, deleteFromLookbook, downloadDataUrl, dataUrlToFile } from "@/lib/lookbook";
import { getScene } from "@/lib/data";
import { shareOutfitFile, generateShareCaption } from "@/lib/share";

export default function LookbookPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LookbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewEntry, setPreviewEntry] = useState<LookbookEntry | null>(null);
  const [isSharingId, setIsSharingId] = useState<string | null>(null);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const data = await getLookbook();
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredEntries = entries.filter((e) => {
    if (genderFilter === "all") return true;
    return e.gender === genderFilter;
  });

  const handleDelete = async (id: string) => {
    try {
      setEntries((prev) => prev.filter((item) => item.id !== id));
      showToast("✓ Đã xóa bộ trang phục khỏi Album!");
      await deleteFromLookbook(id);
    } catch {
      showToast("⚠️ Đã xảy ra lỗi khi xóa.");
    }
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
      } else if (res.status === "unsupported") {
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
    const params = new URLSearchParams();
    params.set("gender", entry.gender);
    params.set("items", entry.itemIds.join(","));
    params.set("scene", entry.sceneId);
    router.push(`/dress-up?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-cream)] text-[var(--ink-text)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] bg-zinc-900 text-white px-4 py-2.5 rounded-full text-xs md:text-sm font-semibold shadow-xl border border-zinc-700 animate-in fade-in"
        >
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg-cream)]/90 backdrop-blur-md border-b border-[var(--border-paper)] px-4 md:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink-text)] min-h-[44px] px-2 py-2 rounded-lg transition-colors"
              aria-label="Quay lại trang chủ"
            >
              <span aria-hidden="true">←</span>
              <span>Trang chủ</span>
            </Link>
            <div className="flex items-center gap-2">
              <img
                src="/avatar.png"
                alt="Logo Việt phục Remix"
                className="w-6 h-6 rounded-full border border-amber-500/40 object-cover"
              />
              <span className="font-serif text-lg md:text-xl font-bold text-[var(--red-lacquer)] tracking-tight">
                Album Lookbook
              </span>
            </div>
          </div>

          <Link
            href="/dress-up"
            className="inline-flex items-center justify-center min-h-[42px] px-4 py-2 text-xs md:text-sm font-semibold text-white bg-[var(--red-lacquer)] hover:bg-[var(--red-lacquer-hover)] rounded-xl shadow-xs transition-all"
          >
            <span>Phòng thử đồ</span>
            <span className="ml-1" aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        {/* Page Hero Banner */}
        <div className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-paper)] p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-semibold text-[var(--red-lacquer)]">
              <span>📖</span>
              <span>Bộ sưu tập cá nhân</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[var(--ink-text)]">
              Album Tủ Đồ Cổ Phục
            </h1>
            <p className="text-xs md:text-sm text-[var(--ink-muted)]">
              Lưu trữ an toàn trên thiết bị của bạn bằng IndexedDB • {entries.length} bộ trang phục đã lưu
            </p>
          </div>

          {/* Gender Filter Controls */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[var(--border-paper)] shrink-0">
            <button
              type="button"
              onClick={() => setGenderFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                genderFilter === "all"
                  ? "bg-[var(--red-lacquer)] text-white shadow-xs"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink-text)]"
              }`}
            >
              Tất cả ({entries.length})
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter("female")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                genderFilter === "female"
                  ? "bg-[var(--red-lacquer)] text-white shadow-xs"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink-text)]"
              }`}
            >
              Nữ ({entries.filter((e) => e.gender === "female").length})
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter("male")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                genderFilter === "male"
                  ? "bg-[var(--red-lacquer)] text-white shadow-xs"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink-text)]"
              }`}
            >
              Nam ({entries.filter((e) => e.gender === "male").length})
            </button>
          </div>
        </div>

        {/* Album Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-sm text-[var(--ink-muted)]">
            <span className="text-3xl animate-spin mb-3">⌛</span>
            <span>Đang tải bộ sưu tập từ bộ nhớ thiết bị...</span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto space-y-4 bg-[var(--bg-paper)]/50 rounded-2xl border border-[var(--border-paper)]">
            <div className="w-16 h-16 rounded-full bg-white border border-[var(--border-paper)] flex items-center justify-center text-3xl shadow-xs">
              👘
            </div>
            <h3 className="font-serif font-bold text-lg text-[var(--ink-text)]">
              Chưa có bộ trang phục nào trong Album
            </h3>
            <p className="text-xs md:text-sm text-[var(--ink-muted)] leading-relaxed">
              Bạn có thể vào phòng thử đồ, phối các trang phục cổ phong yêu thích và bấm <strong>"Lưu Lookbook"</strong> để lưu vào album cá nhân nhé!
            </p>
            <Link
              href="/dress-up"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--red-lacquer)] text-white text-xs md:text-sm font-semibold shadow-xs hover:opacity-90 transition-all"
            >
              <span>Vào phối đồ ngay</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
                  data-testid={`lookbook-page-item-${entry.id}`}
                  className="bg-white rounded-2xl border border-[var(--border-paper)] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
                >
                  {/* Thumbnail Image */}
                  <div className="relative aspect-[4/5] bg-zinc-100 border-b border-[var(--border-paper)] overflow-hidden flex items-center justify-center">
                    {entry.imageData ? (
                      <>
                        <img
                          src={entry.imageData}
                          alt={entry.title || "Thẻ trang phục Việt phục Remix"}
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

                    {/* Badges Over Image */}
                    <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs border border-[var(--border-paper)] text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-[var(--red-lacquer)] shadow-xs">
                      {entry.gender === "male" ? "Nam" : "Nữ"}
                    </span>
                    <span className="absolute top-2.5 right-2.5 bg-[var(--indigo-deep)]/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
                      Mốc {entry.remixLevel}
                    </span>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <h4 className="font-serif font-bold text-sm text-[var(--ink-text)] truncate">
                        {entry.title || (entry.gender === "male" ? "Nam Cổ Phục" : "Nữ Cổ Phục")}
                      </h4>

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

                    {/* Actions Toolbar */}
                    <div className="pt-2 border-t border-[var(--border-paper)] flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleReWear(entry)}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--indigo-deep)] hover:opacity-90 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                          aria-label={`Mặc lại bộ ${entry.id} để chỉnh sửa`}
                        >
                          <span>👗</span>
                          <span>Mặc lại</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownload(entry)}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--red-lacquer)] hover:opacity-90 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                          aria-label={`Tải ảnh thẻ bộ ${entry.id}`}
                        >
                          <span>📥</span>
                          <span>Tải ảnh</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleShare(entry)}
                          disabled={isSharingId === entry.id}
                          className="min-h-[34px] px-2.5 py-1 rounded-xl border border-[var(--border-paper)] bg-[var(--bg-cream)] hover:bg-white text-[var(--ink-text)] font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                          aria-label={`Chia sẻ bộ ${entry.id}`}
                        >
                          <span>📲</span>
                          <span>{isSharingId === entry.id ? "Đang chia sẻ..." : "Chia sẻ"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
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
      </main>

      {/* Lightbox Modal */}
      {previewEntry && (
        <div
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
