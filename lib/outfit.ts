import { Gender, Slot, Item, Preset } from './types';
import { getItem } from './data';

export interface OutfitState {
  gender: Gender | null;
  itemIds: string[];
  sceneId?: string;
}

export type OutfitAction =
  | { type: 'SELECT_GENDER'; gender: Gender }
  | { type: 'EQUIP_ITEM'; itemId: string }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'CLEAR_OUTFIT' }
  | { type: 'APPLY_PRESET'; itemIds: string[] }
  | { type: 'SELECT_SCENE'; sceneId: string };

export function createInitialOutfit(
  gender: Gender | null = null,
  sceneId: string = 'tet'
): OutfitState {
  return {
    gender,
    itemIds: [],
    sceneId,
  };
}

export function selectGender(state: OutfitState, newGender: Gender): OutfitState {
  if (state.gender === newGender) {
    return state;
  }
  // A gender change clears the outfit but preserves scene selection
  return {
    ...state,
    gender: newGender,
    itemIds: [],
  };
}

export function equipItem(
  state: OutfitState,
  itemId: string,
  itemLookup: (id: string) => Item | undefined = getItem
): OutfitState {
  if (!state.gender) {
    return state;
  }

  const item = itemLookup(itemId);
  // Reject unknown items
  if (!item) {
    return state;
  }

  // Reject wrong-gender items
  if (item.gender !== state.gender) {
    return state;
  }

  // Equipping replaces the current item in that slot, never duplicates it
  const remainingIds = state.itemIds.filter((id) => {
    const existing = itemLookup(id);
    return existing && existing.slot !== item.slot;
  });

  return {
    ...state,
    itemIds: [...remainingIds, item.id],
  };
}

export function removeItem(state: OutfitState, itemId: string): OutfitState {
  return {
    ...state,
    itemIds: state.itemIds.filter((id) => id !== itemId),
  };
}

export function clearOutfit(state: OutfitState): OutfitState {
  return {
    ...state,
    itemIds: [],
  };
}

export function applyPreset(
  state: OutfitState,
  itemIds: string[],
  itemLookup: (id: string) => Item | undefined = getItem
): OutfitState {
  if (!state.gender) return state;

  // Filter preset items to ensure they exist and match gender, keeping one per slot
  const validIds: string[] = [];
  const seenSlots = new Set<Slot>();

  for (const id of itemIds) {
    const item = itemLookup(id);
    if (item && item.gender === state.gender && !seenSlots.has(item.slot)) {
      validIds.push(item.id);
      seenSlots.add(item.slot);
    }
  }

  return {
    ...state,
    itemIds: validIds,
  };
}

export function getMatchingPreset(
  state: OutfitState,
  presets: Preset[]
): Preset | undefined {
  if (!state.gender || state.itemIds.length === 0) return undefined;

  const currentSet = new Set(state.itemIds);
  return presets.find(
    (preset) =>
      preset.gender === state.gender &&
      preset.item_ids.length === currentSet.size &&
      preset.item_ids.every((id) => currentSet.has(id))
  );
}

export function getEquippedItem(
  state: OutfitState,
  slot: Slot,
  itemLookup: (id: string) => Item | undefined = getItem
): Item | undefined {
  for (const id of state.itemIds) {
    const item = itemLookup(id);
    if (item && item.slot === slot) {
      return item;
    }
  }
  return undefined;
}

export function outfitReducer(
  state: OutfitState,
  action: OutfitAction
): OutfitState {
  return applyOutfitAction(state, action, getItem);
}

export function applyOutfitAction(
  state: OutfitState,
  action: OutfitAction,
  itemLookup: (id: string) => Item | undefined = getItem
): OutfitState {
  switch (action.type) {
    case 'SELECT_GENDER':
      return selectGender(state, action.gender);

    case 'EQUIP_ITEM':
      return equipItem(state, action.itemId, itemLookup);

    case 'REMOVE_ITEM':
      return removeItem(state, action.itemId);

    case 'CLEAR_OUTFIT':
      return clearOutfit(state);

    case 'APPLY_PRESET':
      return applyPreset(state, action.itemIds, itemLookup);

    case 'SELECT_SCENE':
      return {
        ...state,
        sceneId: action.sceneId,
      };

    default:
      return state;
  }
}
