"use client";

import { useReducer, useState, useEffect } from "react";
import Link from "next/link";
import { Item, RuleHit, Gender } from "@/lib/types";
import { itemsByGender, getItem, presetsByGender, getScene, getAllScenes } from "@/lib/data";
import {
  createInitialOutfit,
  outfitReducer,
  getMatchingPreset,
} from "@/lib/outfit";
import { evaluate } from "@/lib/rules";
import { CharacterCanvas } from "@/app/components/CharacterCanvas";
import { Wardrobe } from "@/app/components/Wardrobe";
import { PresetsSelector } from "@/app/components/PresetsSelector";
import { SceneSelector } from "@/app/components/SceneSelector";
import { RemixSlider } from "@/app/components/RemixSlider";
import { SceneCapBadge } from "@/app/components/SceneCapBadge";
import { StoryCard } from "@/app/components/StoryCard";
import { ResultView } from "@/app/components/ResultView";
import { LookbookModal } from "@/app/components/LookbookModal";
import { LookbookEntry } from "@/lib/lookbook";
import { BlockFeedbackModal } from "@/app/components/BlockFeedbackModal";
import { getItemStory } from "@/lib/stories";

export default function DressUpPage() {
  const [outfitState, dispatch] = useReducer(
    outfitReducer,
    createInitialOutfit()
  );

  const [showAlbum, setShowAlbum] = useState(false);
  const [albumToast, setAlbumToast] = useState<string | null>(null);

  // Check for shared outfit query parameters or album trigger on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const g = params.get("gender");
      const itemsParam = params.get("items");
      const s = params.get("scene");
      const albumParam = params.get("album") || params.get("view");

      if (albumParam === "true" || albumParam === "album") {
        setShowAlbum(true);
      }

      if (g === "male" || g === "female") {
        dispatch({ type: "SELECT_GENDER", gender: g as Gender });
        if (s) {
          dispatch({ type: "SELECT_SCENE", sceneId: s });
        }
        if (itemsParam) {
          const ids = itemsParam.split(",").filter(Boolean);
          dispatch({ type: "APPLY_PRESET", itemIds: ids });
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  const gender = outfitState.gender;
  const currentCatalog: Item[] = gender ? itemsByGender(gender) : [];
  const availablePresets = gender ? presetsByGender(gender) : [];
  const activePreset = gender ? getMatchingPreset(outfitState, availablePresets) : undefined;
  const activeSceneId = outfitState.sceneId || "tet";
  const currentScene = getScene(activeSceneId) || getAllScenes()[0];

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [blockViolations, setBlockViolations] = useState<RuleHit[]>([]);

  const handleReWearOutfit = (entry: LookbookEntry) => {
    dispatch({
      type: "SET_OUTFIT",
      gender: entry.gender,
      itemIds: entry.itemIds,
      sceneId: entry.sceneId,
    });
    setIsConfirmed(false);
    setShowAlbum(false);
    setAlbumToast(`✓ Đã mặc lại bộ trang phục! Bạn có thể chỉnh sửa tự do.`);
    setTimeout(() => setAlbumToast(null), 3500);
  };

  const handleConfirmOutfit = () => {
    if (!gender) return;
    const evalResult = evaluate({ gender, itemIds: outfitState.itemIds });
    if (!evalResult.canConfirm) {
      setBlockViolations(evalResult.block);
    } else {
      setIsConfirmed(true);
    }
  };

  const wornStoryItems = outfitState.itemIds
    .map((id) => {
      const item = getItem(id);
      const story = item ? getItemStory(id) : undefined;
      return item && story ? { item, story } : null;
    })
    .filter((entry): entry is { item: Item; story: import("@/lib/types").ItemStory } => entry !== null);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-cream)] text-[var(--ink-text)]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-cream)]/90 backdrop-blur-md border-b border-[var(--border-paper)] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink-text)] min-h-[44px] min-w-[44px] px-2 py-2 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)]"
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
            <h1 className="font-serif text-lg md:text-xl font-bold text-[var(--red-lacquer)] tracking-tight">
              Việt phục Remix
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setShowAlbum(true)}
            data-testid="btn-open-album-header"
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-[var(--indigo-deep)] hover:text-[var(--red-lacquer)] px-3 py-1.5 rounded-xl border border-[var(--border-paper)] bg-white shadow-xs transition-all cursor-pointer min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--indigo-deep)]"
            aria-label="Mở Album Lookbook"
          >
            <span aria-hidden="true">📖</span>
            <span>Album</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col items-center justify-start">
        {gender === null ? (
          /* Step 1: Character Selection */
          <div className="w-full flex-1 flex items-center justify-center py-8">
            <section
              aria-labelledby="character-heading"
              className="w-full max-w-md bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center gap-6"
            >
              <div className="text-center space-y-2">
                <h2
                  id="character-heading"
                  className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink-text)]"
                >
                  Chọn nhân vật
                </h2>
                <p className="text-sm md:text-base text-[var(--ink-muted)]">
                  Chọn nhân vật nam hoặc nữ để bắt đầu phối trang phục.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full pt-2">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SELECT_GENDER", gender: "male" })}
                  className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-[var(--border-paper)] bg-white hover:border-[var(--indigo-deep)] hover:shadow-md transition-all min-h-[96px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--indigo-deep)] cursor-pointer"
                  aria-label="Chọn nhân vật Nam"
                >
                  <div
                    className="w-12 h-12 rounded-full bg-[var(--indigo-deep)]/10 text-[var(--indigo-deep)] flex items-center justify-center font-serif font-bold text-xl"
                    aria-hidden="true"
                  >
                    ♂
                  </div>
                  <span className="font-serif font-semibold text-base md:text-lg text-[var(--ink-text)]">
                    Nam
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => dispatch({ type: "SELECT_GENDER", gender: "female" })}
                  className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-[var(--border-paper)] bg-white hover:border-[var(--red-lacquer)] hover:shadow-md transition-all min-h-[96px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--red-lacquer)] cursor-pointer"
                  aria-label="Chọn nhân vật Nữ"
                >
                  <div
                    className="w-12 h-12 rounded-full bg-[var(--red-lacquer)]/10 text-[var(--red-lacquer)] flex items-center justify-center font-serif font-bold text-xl"
                    aria-hidden="true"
                  >
                    ♀
                  </div>
                  <span className="font-serif font-semibold text-base md:text-lg text-[var(--ink-text)]">
                    Nữ
                  </span>
                </button>
              </div>
            </section>
          </div>
        ) : isConfirmed ? (
          /* Step 3: Result View */
          <ResultView
            gender={gender}
            itemIds={outfitState.itemIds}
            sceneId={activeSceneId}
            onEdit={() => setIsConfirmed(false)}
            onReWear={handleReWearOutfit}
          />
        ) : (
          /* Step 2: Dressing Screen */
          <section
            aria-label="Khu vực phối đồ"
            className="w-full flex flex-col gap-5"
          >
            {/* Character Header Bar */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-paper)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--ink-muted)]">
                  Nhân vật:
                </span>
                <span
                  data-testid="selected-character"
                  className="font-serif font-semibold text-base text-[var(--ink-text)] capitalize"
                >
                  {gender === "male" ? "Nam" : "Nữ"}
                </span>
                <span className="text-xs bg-[var(--bg-paper)] text-[var(--ink-muted)] px-2 py-0.5 rounded-full border border-[var(--border-paper)] ml-1">
                  Đang mặc: {outfitState.itemIds.length} món
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SELECT_GENDER", gender: gender === "male" ? "female" : "male" })}
                  className="min-h-[44px] px-3 py-2 text-sm font-medium text-[var(--indigo-deep)] hover:text-[var(--red-lacquer)] underline underline-offset-4 transition-colors"
                  aria-label={`Đổi sang nhân vật ${gender === "male" ? "Nữ" : "Nam"}`}
                >
                  Đổi sang {gender === "male" ? "Nữ" : "Nam"}
                </button>

                <button
                  type="button"
                  data-testid="btn-confirm-outfit"
                  onClick={handleConfirmOutfit}
                  disabled={outfitState.itemIds.length === 0}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[var(--red-lacquer)] text-white font-semibold text-sm shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)]"
                  aria-label="Chốt bộ trang phục"
                >
                  <span>✓</span>
                  <span>Chốt bộ</span>
                </button>
              </div>
            </div>

            {/* Scene Selector */}
            <SceneSelector
              selectedSceneId={activeSceneId}
              onSelectScene={(sceneId) =>
                dispatch({ type: "SELECT_SCENE", sceneId })
              }
            />

            {/* Presets Bar */}
            <PresetsSelector
              gender={gender}
              activePresetId={activePreset?.id}
              onSelectPreset={(preset) =>
                dispatch({ type: "APPLY_PRESET", itemIds: preset.item_ids })
              }
            />

            {/* Dressing Area Container */}
            <div
              data-testid="dressing-area"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
            >
              {/* Left Column: Canvas Preview area + RemixSlider + SceneCapBadge */}
              <div className="flex flex-col gap-4">
                <div
                  data-testid="character-canvas-container"
                  className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-paper)] p-4 flex flex-col items-center justify-center"
                >
                  <CharacterCanvas
                    gender={gender}
                    itemIds={outfitState.itemIds}
                    sceneId={activeSceneId}
                  />
                  <div
                    data-testid="worn-items-summary"
                    className="text-xs text-[var(--ink-muted)] text-center mt-3"
                  >
                    {outfitState.itemIds.length === 0
                      ? "Chưa chọn món đồ nào"
                      : `Đang mặc: ${outfitState.itemIds
                          .map((id) => getItem(id)?.name_vi)
                          .filter(Boolean)
                          .join(", ")}`}
                  </div>
                </div>

                {/* Remix Slider */}
                <RemixSlider
                  outfit={{ gender, itemIds: outfitState.itemIds }}
                  scene={currentScene}
                />

                {/* Cultural Scene Cap Badge & Non-binding Guidance */}
                {currentScene && (
                  <SceneCapBadge
                    scene={currentScene}
                    outfit={{ gender, itemIds: outfitState.itemIds }}
                  />
                )}
              </div>

              {/* Right Column: Wardrobe Tabs & Items */}
              <div data-testid="wardrobe-catalog" className="w-full">
                <Wardrobe
                  gender={gender}
                  itemIds={outfitState.itemIds}
                  onEquip={(itemId) => dispatch({ type: "EQUIP_ITEM", itemId })}
                  onRemove={(itemId) => dispatch({ type: "REMOVE_ITEM", itemId })}
                  onClear={() => dispatch({ type: "CLEAR_OUTFIT" })}
                />
              </div>
            </div>

            {/* Cultural Story Cards Section */}
            <section
              data-testid="story-cards-section"
              aria-label="Câu chuyện văn hóa trang phục"
              className="w-full bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-paper)] p-4 md:p-6 shadow-sm flex flex-col gap-4 mt-2"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-paper)] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden="true">📜</span>
                  <h3 className="font-serif font-bold text-base md:text-lg text-[var(--ink-text)]">
                    Câu chuyện văn hóa trang phục
                  </h3>
                </div>
                <span className="text-xs text-[var(--ink-muted)]">
                  {wornStoryItems.length > 0 ? `${wornStoryItems.length} thẻ tư liệu` : "Chưa chọn trang phục"}
                </span>
              </div>

              {wornStoryItems.length === 0 ? (
                <div
                  data-testid="story-cards-empty"
                  className="text-center py-6 text-xs md:text-sm text-[var(--ink-muted)] italic"
                >
                  Hãy chọn một món trang phục bên tủ đồ để mở khóa câu chuyện nguồn gốc và lịch sử văn hóa.
                </div>
              ) : (
                <div
                  data-testid="story-cards-grid"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {wornStoryItems.map(({ item, story }) => (
                    <StoryCard key={item.id} story={story} item={item} />
                  ))}
                </div>
              )}
            </section>
          </section>
        )}

        {/* Rule Block Violations Modal */}
        <BlockFeedbackModal
          blockHits={blockViolations}
          onClose={() => setBlockViolations([])}
        />

        {/* Global Lookbook Album Modal */}
        <LookbookModal
          isOpen={showAlbum}
          onClose={() => setShowAlbum(false)}
          onReWear={handleReWearOutfit}
        />
      </main>

      {/* Album Re-wear Toast */}
      {albumToast && (
        <div
          data-testid="dressup-toast"
          role="status"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white px-4 py-2.5 rounded-full text-xs md:text-sm font-semibold shadow-lg animate-in fade-in"
        >
          {albumToast}
        </div>
      )}
    </div>
  );
}
