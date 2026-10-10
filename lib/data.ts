import {
  Item,
  Preset,
  Scene,
  Rule,
  Gender,
  Slot,
  SetCode,
  FabricClass,
  ItemKind,
  ITEM_KINDS,
  RuleLevel,
} from './types';

import rawItemsJson from '../data/items.json';
import rawPresetsJson from '../data/presets.json';
import rawScenesJson from '../data/scenes.json';
import rawRulesJson from '../data/rules.json';

const VALID_GENDERS = new Set<string>(['male', 'female']);
const VALID_SETS = new Set<string>(['A', 'B', 'C', 'MIX', 'COMMON']);
const VALID_SLOTS = new Set<string>(['top', 'bottom', 'shoes', 'neck', 'head']);
const VALID_FABRIC_CLASSES = new Set<string | null>(['fitted', 'draping', 'structured', null]);
const VALID_KINDS = new Set<string>(ITEM_KINDS);
const VALID_RULE_LEVELS = new Set<string>(['block', 'warn', 'suggest']);
const VALID_RULE_TYPES = new Set<string>(['duplicate_slot', 'combo']);
const VALID_ATTRS = new Set<string>(['stand_collar', 'ceremonial', 'modern']);

const KIND_GENDER_RESTRICTIONS: Record<string, 'male' | 'female' | 'both'> = {
  ao_tac: 'male',
  ao_nhat_binh: 'female',
  vay_dai: 'female',
  tram_cai: 'female',
  ao_ngu_than: 'both',
  ao_giao_linh: 'both',
  quan_lua_trang: 'both',
  quan_hien_dai: 'both',
  giay_vai_den: 'both',
  giay_sneaker: 'both',
  non_la: 'both',
  vong_co_bac: 'both',
};

export function validateItems(items: unknown): string[] {
  const errors: string[] = [];
  if (!Array.isArray(items)) {
    return ['Items data must be an array'];
  }

  const seenIds = new Set<string>();

  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push(`Item at index ${index} is not an object`);
      return;
    }

    const {
      id,
      gender,
      set,
      slot,
      kind,
      name_vi,
      name_en,
      fabric_class,
      modern,
      stand_collar,
      ceremonial,
      image_file,
      needs_review,
      sources,
    } = item as Record<string, any>;

    if (typeof id !== 'string' || id.trim() === '') {
      errors.push(`Item at index ${index} has missing or empty id`);
    } else if (seenIds.has(id)) {
      errors.push(`Duplicate item id: ${id}`);
    } else {
      seenIds.add(id);
    }

    if (!VALID_GENDERS.has(gender)) {
      errors.push(`Item ${id || index} has invalid gender: ${gender}`);
    }

    if (!VALID_SETS.has(set)) {
      errors.push(`Item ${id || index} has invalid set: ${set}`);
    }

    if (!VALID_SLOTS.has(slot)) {
      errors.push(`Item ${id || index} has invalid slot: ${slot}`);
    }

    if (!VALID_KINDS.has(kind)) {
      errors.push(`Item ${id || index} has invalid kind: ${kind}`);
    }

    if (!VALID_FABRIC_CLASSES.has(fabric_class)) {
      errors.push(`Item ${id || index} has invalid fabric_class: ${fabric_class}`);
    }

    if (typeof modern !== 'boolean') {
      errors.push(`Item ${id || index} modern must be boolean`);
    }

    if (typeof stand_collar !== 'boolean') {
      errors.push(`Item ${id || index} stand_collar must be boolean`);
    }

    if (typeof ceremonial !== 'boolean') {
      errors.push(`Item ${id || index} ceremonial must be boolean`);
    }

    if (typeof image_file !== 'string' || image_file.trim() === '') {
      errors.push(`Item ${id || index} image_file must be non-empty string`);
    }

    if (typeof name_vi !== 'string' || name_vi.trim() === '') {
      errors.push(`Item ${id || index} name_vi must be non-empty string`);
    }

    if (typeof name_en !== 'string' || name_en.trim() === '') {
      errors.push(`Item ${id || index} name_en must be non-empty string`);
    }

    if (typeof needs_review !== 'boolean') {
      errors.push(`Item ${id || index} needs_review must be boolean`);
    }

    if (!Array.isArray(sources)) {
      errors.push(`Item ${id || index} sources must be an array`);
    }

    // Gender-kind compatibility
    if (VALID_KINDS.has(kind) && VALID_GENDERS.has(gender)) {
      const allowed = KIND_GENDER_RESTRICTIONS[kind];
      if (allowed && allowed !== 'both' && allowed !== gender) {
        errors.push(
          `Item ${id || index}: kind "${kind}" is restricted to ${allowed}, got ${gender}`
        );
      }
    }
  });

  return errors;
}

export function validatePresets(presets: unknown, items?: Item[]): string[] {
  const errors: string[] = [];
  if (!Array.isArray(presets)) {
    return ['Presets data must be an array'];
  }

  const seenIds = new Set<string>();
  const itemMap = items ? new Map(items.map((i) => [i.id, i])) : null;

  presets.forEach((preset, index) => {
    if (!preset || typeof preset !== 'object') {
      errors.push(`Preset at index ${index} is not an object`);
      return;
    }

    const { id, name_vi, gender, type, item_ids } = preset as Record<string, any>;

    if (typeof id !== 'string' || id.trim() === '') {
      errors.push(`Preset at index ${index} has missing or empty id`);
    } else if (seenIds.has(id)) {
      errors.push(`Duplicate preset id: ${id}`);
    } else {
      seenIds.add(id);
    }

    if (typeof name_vi !== 'string' || name_vi.trim() === '') {
      errors.push(`Preset ${id || index} has missing or empty name_vi`);
    }

    if (!VALID_GENDERS.has(gender)) {
      errors.push(`Preset ${id || index} has invalid gender: ${gender}`);
    }

    if (type !== 'set' && type !== 'remix') {
      errors.push(`Preset ${id || index} has invalid type: ${type}`);
    }

    if (!Array.isArray(item_ids)) {
      errors.push(`Preset ${id || index} item_ids must be an array`);
    } else if (itemMap) {
      const slotsSeen = new Set<string>();
      item_ids.forEach((itemId) => {
        const item = itemMap.get(itemId);
        if (!item) {
          errors.push(`Preset ${id || index} references unknown item id: ${itemId}`);
        } else {
          if (item.gender !== gender) {
            errors.push(
              `Preset ${id || index} gender (${gender}) does not match item ${itemId} gender (${item.gender})`
            );
          }
          if (slotsSeen.has(item.slot)) {
            errors.push(`Preset ${id || index} has duplicate slot: ${item.slot}`);
          }
          slotsSeen.add(item.slot);
        }
      });
    }
  });

  return errors;
}

export function validateScenes(scenes: unknown): string[] {
  const errors: string[] = [];
  if (!Array.isArray(scenes)) {
    return ['Scenes data must be an array'];
  }

  const seenIds = new Set<string>();

  scenes.forEach((scene, index) => {
    if (!scene || typeof scene !== 'object') {
      errors.push(`Scene at index ${index} is not an object`);
      return;
    }

    const { id, name_vi, remix_cap, suggested_sets } = scene as Record<string, any>;

    if (typeof id !== 'string' || id.trim() === '') {
      errors.push(`Scene at index ${index} has missing or empty id`);
    } else if (seenIds.has(id)) {
      errors.push(`Duplicate scene id: ${id}`);
    } else {
      seenIds.add(id);
    }

    if (typeof name_vi !== 'string' || name_vi.trim() === '') {
      errors.push(`Scene ${id || index} has missing or empty name_vi`);
    }

    if (typeof remix_cap !== 'number' || remix_cap < 0) {
      errors.push(`Scene ${id || index} remix_cap must be a non-negative number`);
    }

    if (!Array.isArray(suggested_sets)) {
      errors.push(`Scene ${id || index} suggested_sets must be an array`);
    } else {
      suggested_sets.forEach((setCode, setIdx) => {
        if (typeof setCode !== 'string' || !VALID_SETS.has(setCode)) {
          errors.push(
            `Scene ${id || index} has invalid suggested_set at index ${setIdx}: ${String(setCode)}`
          );
        }
      });
    }
  });

  return errors;
}

export function validateRules(rules: unknown, items?: Item[]): string[] {
  const errors: string[] = [];
  if (!Array.isArray(rules)) {
    return ['Rules data must be an array'];
  }

  const seenIds = new Set<string>();

  rules.forEach((rule, index) => {
    if (!rule || typeof rule !== 'object') {
      errors.push(`Rule at index ${index} is not an object`);
      return;
    }

    const { id, level, type, message_key, message_vi, needs_review } = rule as Record<string, any>;

    if (typeof id !== 'string' || id.trim() === '') {
      errors.push(`Rule at index ${index} has missing or empty id`);
    } else if (seenIds.has(id)) {
      errors.push(`Duplicate rule id: ${id}`);
    } else {
      seenIds.add(id);
    }

    if (!VALID_RULE_LEVELS.has(level)) {
      errors.push(`Rule ${id || index} has invalid level: ${level}`);
    }

    if (!VALID_RULE_TYPES.has(type)) {
      errors.push(`Rule ${id || index} has invalid type: ${type}`);
    }

    if (typeof message_key !== 'string' || message_key.trim() === '') {
      errors.push(`Rule ${id || index} has missing or empty message_key`);
    }

    if (typeof message_vi !== 'string' || message_vi.trim() === '') {
      errors.push(`Rule ${id || index} has missing or empty message_vi`);
    }

    if (typeof needs_review !== 'boolean') {
      errors.push(`Rule ${id || index} needs_review must be boolean`);
    }

    if (type === 'duplicate_slot') {
      const slot = (rule as any).slot;
      if (!VALID_SLOTS.has(slot)) {
        errors.push(`Rule ${id || index} duplicate_slot has invalid slot: ${slot}`);
      }
    } else if (type === 'combo') {
      const all = (rule as any).all;
      if (!Array.isArray(all) || all.length === 0) {
        errors.push(`Rule ${id || index} combo must have a non-empty 'all' array`);
      } else {
        all.forEach((matcher, mIdx) => {
          if (!matcher || typeof matcher !== 'object') {
            errors.push(`Rule ${id || index} matcher at ${mIdx} must be an object`);
            return;
          }
          const hasKind = 'kind' in matcher;
          const hasAttr = 'attr' in matcher;
          const hasSet = 'set' in matcher;

          const keys = Object.keys(matcher);
          if (keys.length !== 1 || (!hasKind && !hasAttr && !hasSet)) {
            errors.push(
              `Rule ${id || index} matcher at ${mIdx} must have exactly one of kind, attr, or set`
            );
            return;
          }

          if (hasKind) {
            if (!VALID_KINDS.has(matcher.kind)) {
              errors.push(
                `Rule ${id || index} matcher at ${mIdx} references unknown kind: ${matcher.kind}`
              );
            }
          } else if (hasAttr) {
            if (!VALID_ATTRS.has(matcher.attr)) {
              errors.push(
                `Rule ${id || index} matcher at ${mIdx} references invalid attr: ${matcher.attr}`
              );
            }
          } else if (hasSet) {
            if (!VALID_SETS.has(matcher.set)) {
              errors.push(
                `Rule ${id || index} matcher at ${mIdx} references invalid set: ${matcher.set}`
              );
            }
          }
        });
      }
    }
  });

  return errors;
}

// Global cached collections initialized from default files
let loadedItems: Item[] = rawItemsJson as unknown as Item[];
let loadedPresets: Preset[] = rawPresetsJson as unknown as Preset[];
let loadedScenes: Scene[] = rawScenesJson as unknown as Scene[];
let loadedRules: Rule[] = rawRulesJson as unknown as Rule[];

export function loadAll(customData?: {
  items?: unknown;
  presets?: unknown;
  scenes?: unknown;
  rules?: unknown;
}): {
  items: Item[];
  presets: Preset[];
  scenes: Scene[];
  rules: Rule[];
} {
  const rawItems = customData?.items ?? rawItemsJson;
  const rawPresets = customData?.presets ?? rawPresetsJson;
  const rawScenes = customData?.scenes ?? rawScenesJson;
  const rawRules = customData?.rules ?? rawRulesJson;

  const itemErrors = validateItems(rawItems);
  const items = (itemErrors.length === 0 ? rawItems : []) as Item[];
  const presetErrors = validatePresets(rawPresets, items);
  const sceneErrors = validateScenes(rawScenes);
  const ruleErrors = validateRules(rawRules, items);

  const allErrors = [...itemErrors, ...presetErrors, ...sceneErrors, ...ruleErrors];
  if (allErrors.length > 0) {
    throw new Error(`Data validation failed:\n${allErrors.join('\n')}`);
  }

  loadedItems = rawItems as Item[];
  loadedPresets = rawPresets as Preset[];
  loadedScenes = rawScenes as Scene[];
  loadedRules = rawRules as Rule[];

  return {
    items: loadedItems,
    presets: loadedPresets,
    scenes: loadedScenes,
    rules: loadedRules,
  };
}

export function getItem(id: string): Item | undefined {
  return loadedItems.find((item) => item.id === id);
}

export function itemsByGender(g: Gender): Item[] {
  return loadedItems.filter((item) => item.gender === g);
}

export function itemsBySlot(g: Gender, slot: Slot): Item[] {
  return loadedItems.filter((item) => item.gender === g && item.slot === slot);
}

export function getPreset(id: string): Preset | undefined {
  return loadedPresets.find((preset) => preset.id === id);
}

export function presetsByGender(g: Gender): Preset[] {
  return loadedPresets.filter((preset) => preset.gender === g);
}

export function getAllScenes(): Scene[] {
  return loadedScenes;
}

export function getScene(id: string): Scene | undefined {
  return loadedScenes.find((scene) => scene.id === id);
}
