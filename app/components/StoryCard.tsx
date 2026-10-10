"use client";

import React, { useState } from "react";
import { ItemStory, Item } from "@/lib/types";

export interface StoryCardProps {
  story: ItemStory;
  item?: Item;
  isFlipped?: boolean;
  onFlip?: () => void;
  className?: string;
}

export function StoryCard({
  story,
  item,
  isFlipped: controlledFlipped,
  onFlip,
  className = "",
}: StoryCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const handleToggleFlip = () => {
    if (onFlip) {
      onFlip();
    } else {
      setInternalFlipped((prev) => !prev);
    }
  };

  const imageSrc = item ? `/assets/${item.gender}/${item.image_file}` : null;

  return (
    <div
      data-testid={`story-card-${story.kind}`}
      className={`story-card-container relative w-full select-none ${className}`}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`Thẻ câu chuyện văn hóa: ${story.title_vi}. Nhấn để ${isFlipped ? "lật về mặt trước" : "lật xem mặt sau"}`}
        aria-pressed={isFlipped}
        onClick={handleToggleFlip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggleFlip();
          }
        }}
        className={`w-full min-h-[220px] rounded-2xl border transition-all duration-500 cursor-pointer p-4 flex flex-col justify-between shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)] ${
          isFlipped
            ? "bg-amber-50/90 border-amber-300 ring-1 ring-amber-400/30 text-[var(--ink-text)]"
            : "bg-[var(--bg-paper)] border-[var(--border-paper)] hover:border-amber-300 text-[var(--ink-text)]"
        }`}
      >
        {/* Front Side */}
        {!isFlipped ? (
          <div data-testid="story-card-front" className="flex flex-col h-full justify-between gap-3">
            <div>
              {/* Header: Title, Period, and Review Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-serif font-bold text-base md:text-lg text-[var(--red-lacquer)]">
                    {story.title_vi}
                  </h4>
                  <p className="text-xs text-[var(--ink-muted)] font-medium">
                    {story.period}
                  </p>
                </div>

                {/* Review Badge */}
                <div
                  data-testid="story-review-badge"
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                    story.needs_review
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border-emerald-300"
                  }`}
                >
                  {story.needs_review ? "🔍 Tư liệu đang đối chiếu" : "🌿 Tư liệu đã xác minh"}
                </div>
              </div>

              {/* Origin Story Content */}
              <div className="text-xs md:text-sm text-[var(--ink-text)] leading-relaxed">
                <span className="font-semibold text-[var(--indigo-deep)]">Nguồn gốc: </span>
                <span>{story.origin}</span>
              </div>
            </div>

            {/* Bottom: Flip Action Prompt */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-paper)]/60 text-xs text-[var(--ink-muted)]">
              <span className="italic flex items-center gap-1">
                <span>📖</span>
                <span>Xem hoàn cảnh & lưu ý phối đồ</span>
              </span>
              <span className="font-semibold text-[var(--red-lacquer)] flex items-center gap-1">
                <span>Lật thẻ</span>
                <span aria-hidden="true">↺</span>
              </span>
            </div>
          </div>
        ) : (
          /* Back Side */
          <div data-testid="story-card-back" className="flex flex-col h-full justify-between gap-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
                <h4 className="font-serif font-bold text-sm md:text-base text-amber-950">
                  {story.title_vi} — Chi tiết văn hóa
                </h4>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-200/60 text-amber-900">
                  Mặt sau
                </span>
              </div>

              {/* Occasion */}
              <div className="text-xs leading-relaxed">
                <span className="font-semibold text-amber-950">Hoàn cảnh mặc: </span>
                <span className="text-amber-900">{story.occasion}</span>
              </div>

              {/* Remix Note */}
              <div className="text-xs leading-relaxed bg-white/70 p-2.5 rounded-xl border border-amber-200/60">
                <span className="font-semibold text-[var(--red-lacquer)]">Gợi ý phối Remix: </span>
                <span className="text-zinc-800">{story.remix_note}</span>
              </div>

              {/* Sources List */}
              {story.sources.length > 0 && (
                <div className="text-[11px] text-zinc-600 space-y-0.5">
                  <span className="font-semibold text-zinc-700">Tư liệu tham khảo: </span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {story.sources.map((src, idx) => (
                      <li key={idx} className="line-clamp-1">
                        {src.startsWith("http") ? (
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="underline text-[var(--indigo-deep)] hover:text-[var(--red-lacquer)]"
                          >
                            {src}
                          </a>
                        ) : (
                          <span>{src}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom: Flip Back Prompt */}
            <div className="flex items-center justify-between pt-2 border-t border-amber-200/80 text-xs text-amber-900">
              <span className="italic">Chạm để quay lại mặt trước</span>
              <span className="font-semibold text-[var(--red-lacquer)] flex items-center gap-1">
                <span>Quay lại</span>
                <span aria-hidden="true">↺</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
