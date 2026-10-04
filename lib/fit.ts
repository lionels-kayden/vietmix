import React from 'react';
import rawFitJson from '../data/fit.json';

/**
 * P2 Fit Adapter Contract
 * -----------------------
 * data/fit.json provides an optional mapping of item ID -> FitEntry.
 *
 * Each FitEntry specifies offsets and scale on the logical 1080x1920 canvas:
 *   - x: number, horizontal offset in logical canvas pixels (positive = right, negative = left).
 *   - y: number, vertical offset in logical canvas pixels (positive = down, negative = up).
 *   - scale: number, uniform scale multiplier > 0 (1.0 = 100% natural size).
 *
 * Defaults:
 *   - If an item ID is not present in fit.json, or if an entry is invalid,
 *     the default is x=0, y=0, scale=1.
 *
 * Coordinate transformation formula (top-left origin):
 *   x_out = x + scale * x_in
 *   y_out = y + scale * y_in
 *
 * Responsive canvas rendering:
 *   Because the canvas maintains a 1080x1920 aspect ratio (9:16), offsets and scaling
 *   are applied using percentage or CSS transform:
 *   `translate(${(x / 1080) * 100}%, ${(y / 1920) * 100}%) scale(${scale})`
 *   with transformOrigin: "top left".
 */

export interface FitEntry {
  x: number;
  y: number;
  scale: number;
}

export const DEFAULT_FIT_ENTRY: FitEntry = {
  x: 0,
  y: 0,
  scale: 1,
};

export function isValidFitEntry(entry: unknown): entry is FitEntry {
  if (!entry || typeof entry !== 'object') return false;
  const { x, y, scale } = entry as Record<string, unknown>;
  return (
    typeof x === 'number' &&
    Number.isFinite(x) &&
    typeof y === 'number' &&
    Number.isFinite(y) &&
    typeof scale === 'number' &&
    Number.isFinite(scale) &&
    scale > 0
  );
}

export function getFitEntry(
  itemId: string,
  fitData: unknown = rawFitJson
): FitEntry {
  if (!fitData || typeof fitData !== 'object') {
    return DEFAULT_FIT_ENTRY;
  }

  const record = fitData as Record<string, unknown>;
  const entry = record[itemId];

  if (isValidFitEntry(entry)) {
    return {
      x: entry.x,
      y: entry.y,
      scale: entry.scale,
    };
  }

  return DEFAULT_FIT_ENTRY;
}

export function transformCoordinates(
  point: { x: number; y: number },
  fit: FitEntry
): { x: number; y: number } {
  return {
    x: fit.x + fit.scale * point.x,
    y: fit.y + fit.scale * point.y,
  };
}

export function getFitLayerStyle(fit: FitEntry): React.CSSProperties {
  const xPercent = (fit.x / 1080) * 100;
  const yPercent = (fit.y / 1920) * 100;

  return {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transform: `translate(${xPercent}%, ${yPercent}%) scale(${fit.scale})`,
    transformOrigin: 'top left',
    pointerEvents: 'none',
  };
}
