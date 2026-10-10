"use client";

import React, { useState } from "react";
import { Gender, Item, Slot } from "@/lib/types";
import { itemsByGender } from "@/lib/data";

export type WardrobeTab = "top" | "bottom" | "shoes" | "accessories";

export const WARDROBE_TABS: { id: WardrobeTab; label: string; slots: Slot[] }[] = [
  { id: "top", label: "Áo", slots: ["top"] },
  { id: "bottom", label: "Quần/Váy", slots: ["bottom"] },
  { id: "shoes", label: "Giày", slots: ["shoes"] },
  { id: "accessories", label: "Phụ kiện", slots: ["neck", "head"] },
];

export interface WardrobeProps {
  gender: Gender;
  itemIds: string[];
  onEquip: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onClear: () => void;
}

export function Wardrobe({
  gender,
  itemIds,
  onEquip,
  onRemove,
  onClear,
}: WardrobeProps) {
  const [activeTab, setActiveTab] = useState<WardrobeTab>("top");

  const allItems = itemsByGender(gender);
  const currentTabConfig =
    WARDROBE_TABS.find((t) => t.id === activeTab) ?? WARDROBE_TABS[0];
  const tabItems = allItems.filter((item) =>
    currentTabConfig.slots.includes(item.slot)
  );

  return (
    <div
      data-testid="wardrobe-container"
      className="bg-white rounded-2xl border border-[var(--border-paper)] shadow-sm p-4 flex flex-col gap-4 w-full"
    >
      {/* Header and Clear action */}
      <div className="flex items-center justify-between border-b border-[var(--border-paper)] pb-3">
        <h2 className="font-serif font-bold text-lg text-[var(--ink-text)]">
          Tủ đồ Việt phục
        </h2>
        {itemIds.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="min-h-[44px] px-3 py-1 text-xs font-medium text-[var(--red-lacquer)] hover:underline rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)]"
            aria-label="Cởi tất cả trang phục đang mặc"
          >
            Cởi hết ({itemIds.length})
          </button>
        )}
      </div>

      {/* Tabs navigation: Áo, Quần/Váy, Giày, Phụ kiện */}
      <div
        role="tablist"
        aria-label="Phân loại tủ đồ"
        className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-paper)] rounded-xl border border-[var(--border-paper)]"
      >
        {WARDROBE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[44px] px-2 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all text-center flex items-center justify-center cursor-pointer ${
                isActive
                  ? "bg-white text-[var(--red-lacquer)] shadow-xs border border-[var(--border-paper)]"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink-text)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panel: Items in selected category */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="flex flex-col gap-2.5 max-h-[480px] overflow-y-auto pr-1"
      >
        {tabItems.length === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--ink-muted)]">
            Không có món đồ nào trong danh mục này.
          </div>
        ) : (
          tabItems.map((item) => {
            const isWorn = itemIds.includes(item.id);
            const isGiaoLinh = item.id === "F_B_TOP_ao_giao_linh";
            const isWornWithSkirt = isGiaoLinh && itemIds.includes("F_B_BOTTOM_vay_dai");
            const thumbSrc = isWornWithSkirt
              ? "/assets/female/F_B_TOP_ao_giao_linh_in_skirt.png"
              : `/assets/${gender}/${item.image_file}`;

            return (
              <div
                key={item.id}
                data-testid={`wardrobe-item-${item.id}`}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isWorn
                    ? "bg-[var(--gold-light)]/40 border-[var(--gold-accent)] shadow-xs"
                    : "bg-[var(--bg-paper)]/40 border-[var(--border-paper)] hover:border-[var(--indigo-deep)]/40 hover:bg-[var(--bg-paper)]/80"
                }`}
              >
                {/* Thumbnail and Info */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-white border border-[var(--border-paper)] flex items-center justify-center overflow-hidden shrink-0 p-1">
                    <img
                      src={thumbSrc}
                      alt={item.name_vi}
                      className="w-full h-full object-contain pointer-events-none"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm text-[var(--ink-text)]">
                        {item.name_vi}
                      </span>
                      {isWorn && (
                        <span
                          data-testid={`badge-worn-${item.id}`}
                          className="text-[10px] font-bold uppercase tracking-wider bg-[var(--gold-accent)] text-white px-1.5 py-0.5 rounded"
                        >
                          Đang mặc
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--ink-muted)] mt-0.5">
                      {item.slot === "head" || item.slot === "neck"
                        ? item.slot === "head"
                          ? "Đầu"
                          : "Cổ"
                        : item.slot === "top"
                        ? "Áo"
                        : item.slot === "bottom"
                        ? "Dưới"
                        : "Giày"}{" "}
                      • Set {item.set}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isWorn ? (
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="min-h-[44px] min-w-[76px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--red-lacquer)] text-white hover:bg-[var(--red-lacquer-hover)] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)]"
                      aria-label={`Cởi ${item.name_vi}`}
                    >
                      Cởi ra
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onEquip(item.id)}
                      className="min-h-[44px] min-w-[76px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--indigo-deep)] text-white hover:bg-[var(--indigo-deep-hover)] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--indigo-deep)]"
                      aria-label={`Mặc ${item.name_vi}`}
                    >
                      Mặc
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
