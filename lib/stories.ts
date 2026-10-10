import {
  ItemStory,
  PresetStory,
  RemixLevelStory,
  StoriesData,
  ItemKind,
  ITEM_KINDS,
  Item,
} from './types';
import rawStoriesJson from '../data/stories.json';
import { getItem } from './data';

const VALID_KINDS = new Set<string>(ITEM_KINDS);

export function validateStories(data: unknown): string[] {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return ['Stories data must be an object'];
  }

  const { items, presets, remix_levels } = data as Record<string, any>;

  // Validate items
  if (!items || typeof items !== 'object') {
    errors.push('Stories data must contain an "items" object');
  } else {
    for (const [key, itemStory] of Object.entries(items)) {
      if (!itemStory || typeof itemStory !== 'object') {
        errors.push(`Item story "${key}" must be an object`);
        continue;
      }
      const { kind, title_vi, period, origin, occasion, remix_note, sources, needs_review } =
        itemStory as Record<string, any>;

      if (!VALID_KINDS.has(kind)) {
        errors.push(`Item story "${key}" has invalid kind: ${kind}`);
      }
      if (typeof title_vi !== 'string' || !title_vi.trim()) {
        errors.push(`Item story "${key}" has missing title_vi`);
      }
      if (typeof period !== 'string' || !period.trim()) {
        errors.push(`Item story "${key}" has missing period`);
      }
      if (typeof origin !== 'string' || !origin.trim()) {
        errors.push(`Item story "${key}" has missing origin`);
      }
      if (typeof occasion !== 'string' || !occasion.trim()) {
        errors.push(`Item story "${key}" has missing occasion`);
      }
      if (typeof remix_note !== 'string' || !remix_note.trim()) {
        errors.push(`Item story "${key}" has missing remix_note`);
      }
      if (!Array.isArray(sources)) {
        errors.push(`Item story "${key}" sources must be an array`);
      }
      if (typeof needs_review !== 'boolean') {
        errors.push(`Item story "${key}" needs_review must be a boolean`);
      }
    }
  }

  // Validate presets
  if (!presets || typeof presets !== 'object') {
    errors.push('Stories data must contain a "presets" object');
  } else {
    for (const [key, presetStory] of Object.entries(presets)) {
      if (!presetStory || typeof presetStory !== 'object') {
        errors.push(`Preset story "${key}" must be an object`);
        continue;
      }
      const { preset_id, name_vi, summary, sources, needs_review } =
        presetStory as Record<string, any>;

      if (typeof preset_id !== 'string' || !preset_id.trim()) {
        errors.push(`Preset story "${key}" has missing preset_id`);
      }
      if (typeof name_vi !== 'string' || !name_vi.trim()) {
        errors.push(`Preset story "${key}" has missing name_vi`);
      }
      if (typeof summary !== 'string' || !summary.trim()) {
        errors.push(`Preset story "${key}" has missing summary`);
      }
      if (!Array.isArray(sources)) {
        errors.push(`Preset story "${key}" sources must be an array`);
      }
      if (typeof needs_review !== 'boolean') {
        errors.push(`Preset story "${key}" needs_review must be a boolean`);
      }
    }
  }

  // Validate remix levels
  if (!remix_levels || typeof remix_levels !== 'object') {
    errors.push('Stories data must contain a "remix_levels" object');
  } else {
    for (const [key, levelStory] of Object.entries(remix_levels)) {
      if (!levelStory || typeof levelStory !== 'object') {
        errors.push(`Remix level story "${key}" must be an object`);
        continue;
      }
      const { level, title, summary, sources, needs_review } = levelStory as Record<string, any>;

      if (typeof level !== 'number' || level < 0 || level > 2) {
        errors.push(`Remix level story "${key}" has invalid level: ${level}`);
      }
      if (typeof title !== 'string' || !title.trim()) {
        errors.push(`Remix level story "${key}" has missing title`);
      }
      if (typeof summary !== 'string' || !summary.trim()) {
        errors.push(`Remix level story "${key}" has missing summary`);
      }
      if (!Array.isArray(sources)) {
        errors.push(`Remix level story "${key}" sources must be an array`);
      }
      if (typeof needs_review !== 'boolean') {
        errors.push(`Remix level story "${key}" needs_review must be a boolean`);
      }
    }
  }

  return errors;
}

let cachedStories: StoriesData = rawStoriesJson as unknown as StoriesData;

export function loadStories(customData?: unknown): StoriesData {
  const data = customData ?? rawStoriesJson;
  const errors = validateStories(data);
  if (errors.length > 0) {
    throw new Error(`Stories validation failed:\n${errors.join('\n')}`);
  }
  cachedStories = data as StoriesData;
  return cachedStories;
}

export function getKindStory(kind: ItemKind): ItemStory | undefined {
  return cachedStories.items[kind];
}

export function getItemStory(
  itemId: string,
  itemLookup: (id: string) => Item | undefined = getItem
): ItemStory | undefined {
  const item = itemLookup(itemId);
  if (!item) return undefined;
  return getKindStory(item.kind);
}

export function getPresetStory(presetId: string): PresetStory | undefined {
  return cachedStories.presets[presetId];
}

export function getRemixLevelStory(level: number): RemixLevelStory | undefined {
  const normalizedLevel = Math.min(Math.max(level, 0), 2);
  return cachedStories.remix_levels[String(normalizedLevel)];
}

export function getAllItemStories(): ItemStory[] {
  return Object.values(cachedStories.items);
}
