"use client";

import { useReducer, useState } from "react";
import Link from "next/link";
import { Gender, Item } from "@/lib/types";
import { itemsByGender, getItem } from "@/lib/data";
import {
  createInitialOutfit,
  outfitReducer,
  getEquippedItem,
} from "@/lib/outfit";
import { CharacterCanvas } from "@/app/components/CharacterCanvas";

export default function DressUpPage() {
  const [outfitState, dispatch] = useReducer(
    outfitReducer,
    createInitialOutfit()
  );

  const gender = outfitState.gender;
  const currentCatalog: Item[] = gender ? itemsByGender(gender) : [];

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
          <h1 className="font-serif text-lg md:text-xl font-bold text-[var(--red-lacquer)] tracking-tight">
            Việt phục Remix
          </h1>
          <div className="w-[80px]" aria-hidden="true" />
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
        ) : (
          /* Step 2: Dressing Screen */
          <section
            aria-label="Khu vực phối đồ"
            className="w-full flex flex-col gap-6"
          >
            {/* Character Header Bar */}
            <div className="w-full flex items-center justify-between border-b border-[var(--border-paper)] pb-3">
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
              <button
                type="button"
                onClick={() => dispatch({ type: "SELECT_GENDER", gender: gender === "male" ? "female" : "male" })}
                className="min-h-[44px] px-3 py-2 text-sm font-medium text-[var(--indigo-deep)] hover:text-[var(--red-lacquer)] underline underline-offset-4 transition-colors"
                aria-label={`Đổi sang nhân vật ${gender === "male" ? "Nữ" : "Nam"}`}
              >
                Đổi sang {gender === "male" ? "Nữ" : "Nam"}
              </button>
            </div>

            {/* Dressing Area Container */}
            <div
              data-testid="dressing-area"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
            >
              {/* Left Column: Canvas Preview area */}
              <div
                data-testid="character-canvas-container"
                className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-paper)] p-4 flex flex-col items-center justify-center"
              >
                <CharacterCanvas
                  gender={gender}
                  itemIds={outfitState.itemIds}
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

              {/* Right Column: Wardrobe Catalog list */}
              <div
                data-testid="wardrobe-catalog"
                className="bg-white rounded-2xl border border-[var(--border-paper)] p-4 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-paper)]">
                  <h3 className="font-serif font-semibold text-base text-[var(--ink-text)]">
                    Tủ đồ ({currentCatalog.length} món)
                  </h3>
                  {outfitState.itemIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "CLEAR_OUTFIT" })}
                      className="text-xs text-[var(--red-lacquer)] hover:underline min-h-[44px] px-2 flex items-center"
                    >
                      Bỏ hết trang phục
                    </button>
                  )}
                </div>

                <div
                  role="list"
                  aria-label="Danh sách trang phục"
                  className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1"
                >
                  {currentCatalog.map((item) => {
                    const isWorn = outfitState.itemIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        role="listitem"
                        data-testid={`catalog-item-${item.id}`}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isWorn
                            ? "bg-[var(--gold-light)]/40 border-[var(--gold-accent)]"
                            : "bg-[var(--bg-paper)]/50 border-[var(--border-paper)] hover:border-[var(--indigo-deep)]/40"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-[var(--ink-text)]">
                            {item.name_vi}
                          </span>
                          <span className="text-xs text-[var(--ink-muted)]">
                            {item.slot} • {item.set}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (isWorn) {
                              dispatch({ type: "REMOVE_ITEM", itemId: item.id });
                            } else {
                              dispatch({ type: "EQUIP_ITEM", itemId: item.id });
                            }
                          }}
                          className={`min-h-[44px] min-w-[72px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            isWorn
                              ? "bg-[var(--red-lacquer)] text-white hover:bg-[var(--red-lacquer-hover)]"
                              : "bg-[var(--indigo-deep)] text-white hover:bg-[var(--indigo-deep-hover)]"
                          }`}
                          aria-label={
                            isWorn
                              ? `Cởi ${item.name_vi}`
                              : `Mặc ${item.name_vi}`
                          }
                        >
                          {isWorn ? "Cởi ra" : "Mặc vào"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
