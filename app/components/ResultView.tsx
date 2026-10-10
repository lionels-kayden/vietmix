"use client";

import React, { useState, useEffect, useRef } from "react";
import { Gender, Item } from "@/lib/types";
import { getItem, getScene, getAllScenes, getPreset, presetsByGender } from "@/lib/data";
import { CharacterCanvas } from "./CharacterCanvas";
import { StoryCard } from "./StoryCard";
import { getItemStory } from "@/lib/stories";
import { assembleOutfitSummary } from "@/lib/summary";
import { evaluate } from "@/lib/rules";
import { getMatchingPreset } from "@/lib/outfit";
import { remixLevel } from "@/lib/remix";
import { exportOutfitImage, getOutfitCardBlob } from "@/lib/exportCanvas";
import { saveToLookbook, saveLegacyLookbookSync, blobToDataUrl, LookbookEntry } from "@/lib/lookbook";
import { ShareModal } from "./ShareModal";
import { LookbookModal } from "./LookbookModal";
import { generateShareCaption, shareOutfitFile } from "@/lib/share";
import { generateShareUrl } from "@/lib/qr";

export interface ResultViewProps {
  gender: Gender;
  itemIds: string[];
  sceneId: string;
  onEdit: () => void;
  onSaveLookbook?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onReWear?: (entry: LookbookEntry) => void;
  className?: string;
}

export function ResultView({
  gender,
  itemIds,
  sceneId,
  onEdit,
  onSaveLookbook,
  onDownload,
  onShare,
  onReWear,
  className = "",
}: ResultViewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLookbookModal, setShowLookbookModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const currentScene = getScene(sceneId) || getAllScenes()[0];
  const outfit = { gender, itemIds };
  const evalResult = evaluate(outfit);

  // Check matching preset dynamically from catalog
  const allPresets = presetsByGender(gender);
  const matchingPreset = getMatchingPreset({ gender, itemIds }, allPresets);
  const summaryText = assembleOutfitSummary(outfit, currentScene, matchingPreset);
  const outfitTitle = matchingPreset?.name_vi || "Việt Phục Remix";
  const currentRemixLevel = remixLevel(outfit);

  // Audit S07: Ensure shareUrl always contains full outfit parameters (gender, items, scene)
  const shareUrl = generateShareUrl({ gender, itemIds, sceneId });

  // Cultural caption without link (user request & S02)
  const shareCaption = generateShareCaption({
    outfitTitle,
    remixLevel: currentRemixLevel,
    sceneName: currentScene.name_vi,
    itemCount: itemIds.length,
    summary: summaryText,
    includeUrl: false,
  });

  // Audit S05 + S06: Pre-generate ready File in background with lifecycle management
  const [preparedFile, setPreparedFile] = useState<File | null>(null);
  const [isPreparingFile, setIsPreparingFile] = useState(false);
  const currentBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setPreparedFile(null);
    setIsPreparingFile(true);

    getOutfitCardBlob({
      gender,
      itemIds,
      sceneId,
      summaryText,
      title: outfitTitle,
    })
      .then((blob) => {
        if (isMounted) {
          if (blob) {
            const file = new File(
              [blob],
              `viet-phuc-remix-${gender}-${Date.now()}.png`,
              { type: "image/png" }
            );
            setPreparedFile(file);
          }
          setIsPreparingFile(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to prepare outfit card:", err);
          setIsPreparingFile(false);
        }
      });

    return () => {
      isMounted = false;
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
    };
  }, [gender, itemIds, sceneId, summaryText, outfitTitle]);

  const handleOpenShare = () => {
    if (onShare) {
      onShare();
      return;
    }
    setShowShareModal(true);
  };

  // Audit S02 + S03 + S05: Native File Share directly using prepared File
  const handleNativeShare = async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      let file = preparedFile;
      if (!file) {
        // Fallback: If clicked before background prep completed
        const blob = await getOutfitCardBlob({
          gender,
          itemIds,
          sceneId,
          summaryText,
          title: outfitTitle,
        });
        if (blob) {
          file = new File([blob], `viet-phuc-remix-${gender}-${Date.now()}.png`, {
            type: "image/png",
          });
          setPreparedFile(file);
        }
      }

      if (!file) {
        showToast("⚠️ Không thể tạo ảnh thẻ. Vui lòng thử lại!");
        return;
      }

      const res = await shareOutfitFile({
        file,
        title: outfitTitle,
        text: shareCaption,
      });

      if (res.status === "handed-off") {
        showToast("✓ Đã mở bảng chia sẻ thành công!");
      } else if (res.status === "cancelled") {
        // User dismissed share sheet - keep modal open, do not treat as error
      } else if (res.status === "unsupported") {
        showToast("Thiết bị chưa hỗ trợ chia sẻ tệp trực tiếp. Bạn có thể bấm 'Tải ảnh thẻ'!");
      } else if (res.error) {
        showToast(`⚠️ ${res.error}`);
      }
    } catch {
      showToast("⚠️ Không thể mở bảng chia sẻ.");
    } finally {
      setIsSharing(false);
    }
  };

  const wornStoryItems = itemIds
    .map((id) => {
      const item = getItem(id);
      const story = item ? getItemStory(id) : undefined;
      return item && story ? { item, story } : null;
    })
    .filter((entry): entry is { item: Item; story: import("@/lib/types").ItemStory } => entry !== null);

  // Audit S06 + S10: Single download handler using prepared File without duplicate re-render or duplicate copy
  const handleDownloadImage = async () => {
    if (onDownload) {
      onDownload();
      return;
    }
    setIsExporting(true);
    try {
      if (preparedFile) {
        // Instantly download existing prepared File
        const blobUrl = URL.createObjectURL(preparedFile);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = preparedFile.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
        showToast("✓ Đang tải ảnh thẻ PNG về máy!");
      } else {
        const ok = await exportOutfitImage({
          gender,
          itemIds,
          sceneId,
          summaryText,
          title: matchingPreset?.name_vi || "VIỆT PHỤC REMIX",
        });
        if (ok) {
          showToast("✓ Đang tải ảnh thẻ PNG về máy!");
        } else {
          showToast("⚠️ Không thể tải ảnh trực tiếp.");
        }
      }
    } catch {
      showToast("⚠️ Đã xảy ra lỗi khi tạo ảnh.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToLookbook = () => {
    if (onSaveLookbook) {
      onSaveLookbook();
      return;
    }
    showToast("✓ Đã lưu trang phục vào Tủ đồ Lookbook!");
    const level = remixLevel(outfit);

    // Save lightweight entry immediately so modal has data without delay
    const syncId = `lookbook_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const syncTimestamp = Date.now();
    const syncEntry: LookbookEntry = {
      id: syncId,
      timestamp: syncTimestamp,
      gender,
      itemIds,
      sceneId,
      summary: summaryText,
      remixLevel: level,
      title: outfitTitle,
    };
    saveLegacyLookbookSync(syncEntry);

    (async () => {
      let dataUrl: string | undefined = undefined;
      try {
        if (preparedFile) {
          dataUrl = await blobToDataUrl(preparedFile);
        } else {
          const blob = await getOutfitCardBlob({
            gender,
            itemIds,
            sceneId,
            summaryText,
            title: outfitTitle,
          });
          if (blob) {
            dataUrl = await blobToDataUrl(blob);
          }
        }
      } catch {
        // continue
      }

      await saveToLookbook({
        ...syncEntry,
        imageData: dataUrl,
      });
    })();
  };

  const handleOpenLookbook = () => {
    setShowLookbookModal(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div
      data-testid="result-view"
      aria-label="Màn hình kết quả phối đồ"
      className={`w-full max-w-4xl mx-auto flex flex-col gap-6 py-2 ${className}`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          data-testid="toast-notification"
          role="status"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white px-4 py-2.5 rounded-full text-xs md:text-sm font-semibold shadow-lg animate-in fade-in"
        >
          {toastMessage}
        </div>
      )}

      {/* Top Bar with Return to Edit Button */}
      <div className="flex items-center justify-between border-b border-[var(--border-paper)] pb-3">
        <button
          type="button"
          onClick={onEdit}
          data-testid="btn-return-edit"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--indigo-deep)] hover:text-[var(--red-lacquer)] min-h-[44px] px-3 py-2 rounded-xl border border-[var(--border-paper)] bg-white shadow-sm transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)]"
          aria-label="Quay lại chỉnh sửa phối đồ"
        >
          <span aria-hidden="true">←</span>
          <span>Chỉnh sửa lại</span>
        </button>

        <h2 className="font-serif font-bold text-lg md:text-xl text-[var(--red-lacquer)]">
          Bộ Cánh Đã Chốt
        </h2>

        <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-2.5 py-1 rounded-full">
          ✓ Hoàn thành
        </span>
      </div>

      {/* Main Result Showcase: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
        {/* Left Column: Canvas Preview */}
        <div className="flex flex-col items-center bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-paper)] p-4 shadow-sm">
          <CharacterCanvas
            gender={gender}
            itemIds={itemIds}
            sceneId={sceneId}
          />
          <div className="text-xs text-[var(--ink-muted)] text-center mt-3 font-medium">
            Bối cảnh: {currentScene.name_vi} • {itemIds.length} món trang phục
          </div>
        </div>

        {/* Right Column: Cultural Summary Card & Action Controls */}
        <div className="flex flex-col gap-4">
          {/* Summary Card */}
          <div
            data-testid="outfit-summary-card"
            className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-paper)] p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2 border-b border-[var(--border-paper)] pb-2">
              <span className="text-lg" aria-hidden="true">📜</span>
              <h3 className="font-serif font-bold text-base text-[var(--ink-text)]">
                Lời bình văn hóa trang phục
              </h3>
            </div>
            <p
              data-testid="outfit-summary-text"
              className="text-xs md:text-sm text-[var(--ink-text)] leading-relaxed"
            >
              {summaryText}
            </p>

            {/* Warnings or Suggestions badge if any */}
            {evalResult.warn.length > 0 && (
              <div
                data-testid="result-warnings"
                className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1"
              >
                <div className="font-semibold flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Lưu ý văn hóa:</span>
                </div>
                {evalResult.warn.map((w) => (
                  <p key={w.ruleId} className="text-amber-800">{w.message_vi}</p>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons Panel */}
          <div
            data-testid="result-actions"
            className="bg-white rounded-2xl border border-[var(--border-paper)] p-4 shadow-sm flex flex-col gap-3"
          >
            <h4 className="font-serif font-semibold text-sm text-[var(--ink-text)]">
              Tùy chọn lưu & chia sẻ
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={isExporting}
                data-testid="btn-download"
                className="min-h-[46px] px-3 py-2.5 rounded-xl bg-[var(--red-lacquer)] text-white font-semibold text-xs md:text-sm hover:opacity-90 disabled:opacity-50 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--red-lacquer)]"
                aria-label="Tải ảnh trang phục PNG"
              >
                <span>📥</span>
                <span>{isExporting ? "Đang xuất..." : "Tải ảnh PNG"}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToLookbook}
                data-testid="btn-lookbook"
                className="min-h-[46px] px-3 py-2.5 rounded-xl bg-[var(--indigo-deep)] text-white font-semibold text-xs md:text-sm hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--indigo-deep)]"
                aria-label="Lưu vào tủ đồ Lookbook cá nhân"
              >
                <span>📖</span>
                <span>Lưu Lookbook</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleOpenLookbook}
                data-testid="btn-view-lookbook"
                className="min-h-[44px] px-3 py-2 rounded-xl border border-[var(--border-paper)] bg-white text-[var(--ink-text)] font-semibold text-xs md:text-sm hover:border-[var(--indigo-deep)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                aria-label="Xem tủ đồ Lookbook đã lưu"
              >
                <span>👗</span>
                <span>Xem Lookbook</span>
              </button>

              <button
                type="button"
                onClick={handleOpenShare}
                data-testid="btn-share"
                className="min-h-[44px] px-3 py-2 rounded-xl border border-[var(--border-paper)] bg-[var(--bg-cream)] text-[var(--ink-text)] font-semibold text-xs md:text-sm hover:border-[var(--indigo-deep)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                aria-label="Chia sẻ bộ trang phục"
              >
                <span>🔗</span>
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cultural Flip Cards of Confirmed Outfit */}
      <section
        data-testid="result-story-cards"
        aria-label="Chi tiết văn hóa các món đồ đã chọn"
        className="w-full bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-paper)] p-4 md:p-6 shadow-sm flex flex-col gap-4"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-paper)] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🎴</span>
            <h3 className="font-serif font-bold text-base md:text-lg text-[var(--ink-text)]">
              Tư liệu văn hóa từng món trang phục ({wornStoryItems.length} món)
            </h3>
          </div>
          <span className="text-xs text-[var(--ink-muted)]">Chạm để lật thẻ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wornStoryItems.map(({ item, story }) => (
            <StoryCard key={item.id} story={story} item={item} />
          ))}
        </div>
      </section>

      {/* Lookbook Saved Outfits Modal */}
      <LookbookModal
        isOpen={showLookbookModal}
        onClose={() => setShowLookbookModal(false)}
        onReWear={(entry) => {
          if (onReWear) {
            onReWear(entry);
          } else {
            onEdit();
          }
        }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={outfitTitle}
        caption={shareCaption}
        url={shareUrl}
        gender={gender}
        itemIds={itemIds}
        sceneId={sceneId}
        onNativeShare={handleNativeShare}
        onDownloadImage={handleDownloadImage}
        isPreparingImage={isPreparingFile}
        isSharing={isSharing}
      />
    </div>
  );
}
