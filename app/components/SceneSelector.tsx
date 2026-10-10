"use client";

import React from "react";
import { Scene } from "@/lib/types";
import { getAllScenes } from "@/lib/data";

export interface SceneSelectorProps {
  selectedSceneId: string;
  onSelectScene: (sceneId: string) => void;
  className?: string;
}

const SCENE_ICONS: Record<string, string> = {
  tet: "🌸",
  "le-hoi": "🏮",
  "ky-yeu": "🎓",
  "doi-thuong": "☕",
};

const SCENE_DESCRIPTIONS: Record<string, string> = {
  tet: "Tết Hoàng Cung",
  "le-hoi": "Lễ hội dân gian",
  "ky-yeu": "Kỷ yếu học đường",
  "doi-thuong": "Dạo phố Hội An",
};

export function SceneSelector({
  selectedSceneId,
  onSelectScene,
  className = "",
}: SceneSelectorProps) {
  const scenes: Scene[] = getAllScenes();

  return (
    <section
      data-testid="scene-selector"
      aria-label="Chọn bối cảnh không gian"
      className={`w-full bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-paper)] p-3.5 md:p-4 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--ink-text)] flex items-center gap-1.5 font-serif">
          <span>🏞️</span>
          <span>Bối cảnh văn hóa</span>
        </h3>
        <span className="text-xs text-[var(--ink-muted)]">
          4 không gian cổ phong
        </span>
      </div>

      <div
        role="group"
        aria-label="Danh sách bối cảnh"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
      >
        {scenes.map((scene) => {
          const isSelected = scene.id === selectedSceneId;
          const icon = SCENE_ICONS[scene.id] || "✨";
          const desc = SCENE_DESCRIPTIONS[scene.id] || scene.name_vi;

          return (
            <button
              key={scene.id}
              type="button"
              data-testid={`scene-btn-${scene.id}`}
              onClick={() => onSelectScene(scene.id)}
              aria-pressed={isSelected}
              className={`min-h-[52px] p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)] ${
                isSelected
                  ? "bg-amber-50/80 border-[var(--red-lacquer)] shadow-sm ring-1 ring-[var(--red-lacquer)]/30 text-[var(--ink-text)]"
                  : "bg-white border-[var(--border-paper)] hover:border-amber-300 text-[var(--ink-muted)] hover:text-[var(--ink-text)]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-lg" aria-hidden="true">
                  {icon}
                </span>
                <span
                  data-testid={`scene-cap-${scene.id}`}
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? "bg-[var(--red-lacquer)]/10 text-[var(--red-lacquer)]"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  Cap: {scene.remix_cap}
                </span>
              </div>
              <div className="mt-1">
                <div className="font-serif font-semibold text-xs md:text-sm text-[var(--ink-text)] line-clamp-1">
                  {scene.name_vi}
                </div>
                <div className="text-[11px] text-[var(--ink-muted)] line-clamp-1">
                  {desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
