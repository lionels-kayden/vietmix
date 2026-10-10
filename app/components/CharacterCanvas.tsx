"use client";

import React, { useState } from "react";
import { Gender, Item, Slot } from "@/lib/types";
import { getItem } from "@/lib/data";
import { getFitEntry, getFitLayerStyle, FitEntry } from "@/lib/fit";

export interface CharacterCanvasProps {
  gender: Gender;
  itemIds: string[];
  sceneId?: string;
  fitData?: unknown;
  className?: string;
  aspectRatioClass?: string;
}

// Ordered slots from bottom to top (excluding body base)
const LAYER_ORDER: { slot: Slot; zIndex: number }[] = [
  { slot: "shoes", zIndex: 10 },
  { slot: "bottom", zIndex: 20 },
  { slot: "top", zIndex: 30 },
  { slot: "neck", zIndex: 40 },
  { slot: "head", zIndex: 50 },
];

// Bounded fallback positioning per slot so a failed layer never covers the canvas
const SLOT_FALLBACK_POSITIONS: Record<Slot, { top: string; left: string }> = {
  head: { top: "6%", left: "50%" },
  neck: { top: "22%", left: "50%" },
  top: { top: "38%", left: "50%" },
  bottom: { top: "64%", left: "50%" },
  shoes: { top: "88%", left: "50%" },
};

export function CharacterCanvas({
  gender,
  itemIds,
  sceneId,
  fitData,
  className = "",
  aspectRatioClass,
}: CharacterCanvasProps) {
  // Track broken images by layer key
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const handleImageError = (layerKey: string) => {
    setBrokenImages((prev) => ({ ...prev, [layerKey]: true }));
  };

  // Resolve equipped items by slot
  const equippedBySlot: Partial<Record<Slot, Item>> = {};
  for (const id of itemIds) {
    const item = getItem(id);
    if (item && item.gender === gender) {
      equippedBySlot[item.slot] = item;
    }
  }

  const baseSrc = `/assets/${gender}/${gender}_base.png`;
  const baseKey = `base_${gender}`;
  const sceneKey = sceneId ? `scene_${sceneId}` : "";

  return (
    <div
      data-testid="canvas-wrapper"
      className={`relative w-full max-w-[420px] ${aspectRatioClass ?? "aspect-[9/16]"} bg-[var(--bg-cream)] rounded-2xl border border-[var(--border-paper)] shadow-inner overflow-hidden select-none ${className}`}
    >
      {/* 0. Scene Background Layer (z-0, full bleed) */}
      {sceneId && (
        <div
          data-testid="layer-scene"
          data-scene-id={sceneId}
          className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none"
        >
          {brokenImages[sceneKey] ? (
            <div
              data-testid="fallback-scene"
              className="absolute inset-0 flex items-center justify-center bg-amber-100/90 text-amber-900 text-xs font-semibold p-4 text-center"
              role="alert"
              aria-label={`Không tải được ảnh bối cảnh ${sceneId}`}
            >
              [Lỗi ảnh bối cảnh: {sceneId}]
            </div>
          ) : (
            <img
              src={`/assets/scenes/${sceneId}.jpg`}
              alt={`Bối cảnh ${sceneId}`}
              className="w-full h-full object-cover transition-opacity duration-300 ease-in-out pointer-events-none"
              onError={() => handleImageError(sceneKey)}
              draggable={false}
            />
          )}
        </div>
      )}

      {/* Character Container: Anchored bottom-center, 85% scale for harmonious scene proportion */}
      <div
        data-testid="character-container"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-[85%] z-10 pointer-events-none"
      >
        {/* 1. Body Base Layer (bottom-most of character, z-0) */}
        <div
          data-testid="layer-body"
          data-layer="body"
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        >
          {brokenImages[baseKey] ? (
            <div
              data-testid="fallback-body"
              className="absolute inset-0 flex items-center justify-center bg-zinc-200/90 text-zinc-700 text-xs font-semibold p-4 text-center"
              role="alert"
              aria-label="Không tải được ảnh nhân vật"
            >
              [Lỗi ảnh nhân vật]
            </div>
          ) : (
            <img
              src={baseSrc}
              alt={`Hình mẫu nhân vật ${gender === "male" ? "Nam" : "Nữ"}`}
              className="w-full h-full object-contain pointer-events-none"
              onError={() => handleImageError(baseKey)}
              draggable={false}
            />
          )}
        </div>

        {/* 2-6. Garment Layers in strict order: shoes, bottom, top, neck, head */}
        {LAYER_ORDER.map(({ slot, zIndex }) => {
          const item = equippedBySlot[slot];
          if (!item) return null;

          const layerKey = `layer_${slot}_${item.id}`;
          const isBroken = brokenImages[layerKey];
          const fit: FitEntry = getFitEntry(item.id, fitData);
          const transformStyle = getFitLayerStyle(fit);
          let itemSrc = `/assets/${gender}/${item.image_file}`;
          if (item.id === "F_B_TOP_ao_giao_linh") {
            const bottom = equippedBySlot["bottom"];
            if (bottom?.kind === "vay_dai" || bottom?.id === "F_B_BOTTOM_vay_dai") {
              itemSrc = `/assets/female/F_B_TOP_ao_giao_linh_in_skirt.png`;
            } else {
              itemSrc = `/assets/female/F_B_TOP_ao_giao_linh.png`;
            }
          }
          const fallbackPos = SLOT_FALLBACK_POSITIONS[slot];

          return (
            <div
              key={item.id}
              data-testid={`layer-${slot}`}
              data-layer={slot}
              data-item-id={item.id}
              style={{ ...transformStyle, zIndex }}
              className="pointer-events-none"
            >
              {isBroken ? (
                <div
                  data-testid={`fallback-${slot}`}
                  style={{
                    top: fallbackPos.top,
                    left: fallbackPos.left,
                    transform: "translateX(-50%)",
                  }}
                  className="absolute max-w-[85%] w-auto px-3 py-1.5 flex items-center justify-center gap-1.5 bg-zinc-200/90 text-zinc-800 text-[11px] md:text-xs font-semibold text-center border border-zinc-400/80 rounded-lg shadow-sm pointer-events-auto"
                  role="alert"
                  aria-label={`Không tải được ảnh ${item.name_vi}`}
                >
                  <span aria-hidden="true" className="text-zinc-500">⚠</span>
                  <span>[Lỗi ảnh: {item.name_vi}]</span>
                </div>
              ) : (
                <div
                  key={item.id}
                  data-testid={`inner-${slot}`}
                  className="w-full h-full garment-enter pointer-events-none"
                >
                  <img
                    src={itemSrc}
                    alt={item.name_vi}
                    className="w-full h-full object-contain pointer-events-none"
                    onError={() => handleImageError(layerKey)}
                    draggable={false}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
