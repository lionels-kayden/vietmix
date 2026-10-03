import { Outfit, Scene, Item } from './types';
import { getItem } from './data';

export function modernCount(
  outfit: Outfit,
  itemLookup?: (id: string) => Item | undefined
): number {
  const lookup = itemLookup ?? getItem;
  const seenIds = new Set<string>();
  let count = 0;

  for (const id of outfit.itemIds) {
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    const item = lookup(id);
    if (item && item.modern) {
      count++;
    }
  }

  return count;
}

export function remixLevel(
  outfit: Outfit,
  itemLookup?: (id: string) => Item | undefined
): number {
  return Math.min(modernCount(outfit, itemLookup), 2);
}

export function sceneCapLevel(scene: Scene): number {
  return Math.min(scene.remix_cap, 2);
}

export function isWithinSceneCap(
  outfit: Outfit,
  scene: Scene,
  itemLookup?: (id: string) => Item | undefined
): boolean {
  return modernCount(outfit, itemLookup) <= scene.remix_cap;
}
