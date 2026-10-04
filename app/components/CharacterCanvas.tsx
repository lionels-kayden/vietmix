"use client";

import React, { useState } from "react";
import { Gender, Item, Slot } from "@/lib/types";
import { getItem } from "@/lib/data";
import { getFitEntry, getFitLayerStyle, FitEntry } from "@/lib/fit";

export interface CharacterCanvasProps {
  gender: Gender;
  itemIds: string[];
  fitData?: unknown;
  className?: string;
}

// Ordered slots from bottom to top (excluding body base)
const LAYER_ORDER: { slot: Slot; zIndex: number }[] = [
  { slot: "shoes", zIndex: 10 },
  { slot: "bottom", zIndex: 20 },
  { slot: "top", zIndex: 30 },
  { slot: "neck", zIndex: 40 },
  { slot: "head", zIndex: 50 },
];

export function CharacterCanvas({
  gender,
  itemIds,
  fitData,
  className = "",
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

  return (
    <div
      data-testid="canvas-wrapper"
      className={`relative w-full max-w-[420px] aspect-[9/16] bg-[var(--bg-cream)] rounded-2xl border border-[var(--border-paper)] shadow-inner overflow-hidden select-none ${className}`}
    >
      {/* 1. Body Base Layer (bottom-most, z-0) */}
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
        const itemSrc = `/assets/${gender}/${item.image_file}`;

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
                className="absolute inset-0 flex items-center justify-center bg-zinc-200/85 text-zinc-700 text-xs font-semibold p-2 text-center border border-zinc-400/50 rounded"
                role="alert"
                aria-label={`Không tải được ảnh ${item.name_vi}`}
              >
                [Lỗi ảnh: {item.name_vi}]
              </div>
            ) : (
              <img
                src={itemSrc}
                alt={item.name_vi}
                className="w-full h-full object-contain pointer-events-none"
                onError={() => handleImageError(layerKey)}
                draggable={false}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
