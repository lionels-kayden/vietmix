"use client";

import React from "react";
import { Gender, Preset } from "@/lib/types";
import { presetsByGender } from "@/lib/data";

export interface PresetsSelectorProps {
  gender: Gender;
  activePresetId?: string;
  onSelectPreset: (preset: Preset) => void;
}

export function PresetsSelector({
  gender,
  activePresetId,
  onSelectPreset,
}: PresetsSelectorProps) {
  const presets = presetsByGender(gender);
  const activePreset = presets.find((p) => p.id === activePresetId);

  return (
    <section
      aria-label="Gợi ý phối sẵn"
      data-testid="presets-selector"
      className="bg-white rounded-2xl border border-[var(--border-paper)] shadow-sm p-4 w-full flex flex-col gap-3"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-serif font-bold text-base md:text-lg text-[var(--ink-text)]">
            Gợi ý phối sẵn
          </h2>
          <span className="text-xs text-[var(--ink-muted)]">
            ({presets.length} mẫu {gender === "male" ? "Nam" : "Nữ"})
          </span>
        </div>
        {activePreset && (
          <span
            data-testid="active-preset-badge"
            className="text-xs font-semibold text-[var(--red-lacquer)] bg-[var(--red-lacquer)]/10 px-2.5 py-1 rounded-full border border-[var(--red-lacquer)]/20"
          >
            Đang áp dụng: {activePreset.name_vi}
          </span>
        )}
      </div>

      <div
        role="group"
        aria-label="Danh sách các bộ phối mẫu"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5"
      >
        {presets.map((preset) => {
          const isActive = preset.id === activePresetId;
          const isTraditional = preset.type === "set";

          return (
            <button
              key={preset.id}
              type="button"
              data-testid={`preset-button-${preset.id}`}
              aria-pressed={isActive}
              onClick={() => onSelectPreset(preset)}
              className={`min-h-[56px] p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--red-lacquer)] ${
                isActive
                  ? "bg-[var(--gold-light)]/50 border-[var(--red-lacquer)] shadow-sm ring-1 ring-[var(--red-lacquer)]"
                  : "bg-[var(--bg-paper)]/50 border-[var(--border-paper)] hover:border-[var(--indigo-deep)] hover:bg-[var(--bg-paper)] text-[var(--ink-text)]"
              }`}
            >
              <div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                    isTraditional
                      ? "text-[var(--indigo-deep)]"
                      : "text-[var(--gold-accent)]"
                  }`}
                >
                  {isTraditional ? "Truyền thống" : "Remix hiện đại"}
                </span>
                <span className="font-serif font-semibold text-xs md:text-sm text-[var(--ink-text)] block leading-snug">
                  {preset.name_vi}
                </span>
              </div>
              <span className="text-[11px] text-[var(--ink-muted)] mt-1.5 block">
                {preset.item_ids.length} món
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
