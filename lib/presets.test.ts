import { describe, it, expect, beforeAll } from 'vitest';
import { loadAll, presetsByGender, getPreset, getItem } from './data';
import {
  createInitialOutfit,
  equipItem,
  removeItem,
  applyPreset,
  getMatchingPreset,
  outfitReducer,
} from './outfit';
import rawPresets from '../data/presets.json';

describe('T5: Presets logic and integration (lib/outfit.ts & lib/data.ts)', () => {
  beforeAll(() => {
    loadAll();
  });

  it('loads and retrieves presets for both genders (all 10 presets)', () => {
    const malePresets = presetsByGender('male');
    const femalePresets = presetsByGender('female');

    expect(malePresets).toHaveLength(5);
    expect(femalePresets).toHaveLength(5);

    const expectedMaleIds = [
      'set-a-male',
      'set-b-male',
      'set-c-male',
      'rx-01-male',
      'rx-02-male',
    ];
    const expectedFemaleIds = [
      'set-a-female',
      'set-b-female',
      'set-c-female',
      'rx-01-female',
      'rx-02-female',
    ];

    expect(malePresets.map((p) => p.id)).toEqual(expectedMaleIds);
    expect(femalePresets.map((p) => p.id)).toEqual(expectedFemaleIds);

    // Verify getPreset lookup by ID
    for (const preset of rawPresets) {
      const found = getPreset(preset.id);
      expect(found).toBeDefined();
      expect(found?.name_vi).toBe(preset.name_vi);
      expect(found?.item_ids).toEqual(preset.item_ids);
    }
  });

  it('applies all 10 presets cleanly with exact catalog resolution', () => {
    for (const preset of rawPresets) {
      const state = createInitialOutfit(preset.gender as 'male' | 'female');
      const updated = applyPreset(state, preset.item_ids);

      // Verify all items are worn
      expect(updated.itemIds).toEqual(preset.item_ids);

      // Verify each item resolves in the catalog and matches gender
      for (const itemId of updated.itemIds) {
        const item = getItem(itemId);
        expect(item).toBeDefined();
        expect(item?.gender).toBe(preset.gender);
      }

      // Verify getMatchingPreset derives this exact preset
      const matched = getMatchingPreset(
        updated,
        presetsByGender(preset.gender as 'male' | 'female')
      );
      expect(matched?.id).toBe(preset.id);
    }
  });

  it('replaces the whole outfit and clears stale accessories', () => {
    // 1. Male: Dress with full suit + hat
    let maleState = createInitialOutfit('male');
    maleState = equipItem(maleState, 'M_C_TOP_ao_tac');
    maleState = equipItem(maleState, 'M_COMMON_BOTTOM_quan_lua_trang');
    maleState = equipItem(maleState, 'M_COMMON_SHOES_giay_vai_den');
    maleState = equipItem(maleState, 'M_COMMON_HEAD_non_la'); // head accessory
    expect(maleState.itemIds).toHaveLength(4);

    // Apply RX-01 male preset (has top, modern bottom, sneakers; NO accessories)
    const rx01Male = getPreset('rx-01-male')!;
    const afterRx01 = applyPreset(maleState, rx01Male.item_ids);

    expect(afterRx01.itemIds).toEqual(rx01Male.item_ids);
    expect(afterRx01.itemIds).not.toContain('M_COMMON_HEAD_non_la');
    expect(afterRx01.itemIds).not.toContain('M_C_TOP_ao_tac');

    // 2. Female: Start with RX-02 plus manually equipped hairpin
    let femaleState = createInitialOutfit('female');
    const rx02Female = getPreset('rx-02-female')!;
    femaleState = applyPreset(femaleState, rx02Female.item_ids);
    femaleState = equipItem(femaleState, 'F_COMMON_HEAD_tram_cai');
    expect(femaleState.itemIds).toContain('F_COMMON_HEAD_tram_cai');

    // Apply Set B female (top, skirt, shoes; NO accessories)
    const setBFemale = getPreset('set-b-female')!;
    const afterSetB = applyPreset(femaleState, setBFemale.item_ids);

    expect(afterSetB.itemIds).toEqual(setBFemale.item_ids);
    expect(afterSetB.itemIds).not.toContain('F_COMMON_HEAD_tram_cai');
  });

  it('handles manual edits after preset without leaving misleading preset active', () => {
    const malePresets = presetsByGender('male');
    let state = createInitialOutfit('male');

    // Apply Set A male
    const setA = getPreset('set-a-male')!;
    state = applyPreset(state, setA.item_ids);
    expect(getMatchingPreset(state, malePresets)?.id).toBe('set-a-male');

    // Edit 1: Replace shoes with sneakers
    state = equipItem(state, 'M_MIX_SHOES_giay_sneaker');
    // Now wearing: Set A top, Set A bottom, sneakers -> no matching preset
    expect(getMatchingPreset(state, malePresets)).toBeUndefined();

    // Edit 2: Replace bottom with modern trousers -> Now wearing Set A top, modern trousers, sneakers
    // This matches RX-01!
    state = equipItem(state, 'M_MIX_BOTTOM_quan_hien_dai');
    expect(getMatchingPreset(state, malePresets)?.id).toBe('rx-01-male');

    // Edit 3: Add an accessory (hat) -> RX-01 does not include hat
    state = equipItem(state, 'M_COMMON_HEAD_non_la');
    expect(getMatchingPreset(state, malePresets)).toBeUndefined();

    // Edit 4: Remove hat -> back to RX-01
    state = removeItem(state, 'M_COMMON_HEAD_non_la');
    expect(getMatchingPreset(state, malePresets)?.id).toBe('rx-01-male');

    // Edit 5: Replace top with Áo giao lĩnh -> Now matches RX-02!
    state = equipItem(state, 'M_B_TOP_ao_giao_linh');
    expect(getMatchingPreset(state, malePresets)?.id).toBe('rx-02-male');
  });

  it('rejects cross-gender items in applyPreset', () => {
    // Attempting to apply female preset on male character
    const maleState = createInitialOutfit('male');
    const femalePreset = getPreset('set-a-female')!;

    const result = applyPreset(maleState, femalePreset.item_ids);
    // All female items should be rejected
    expect(result.itemIds).toEqual([]);

    // Attempting to apply mixed items (one male, two female)
    const mixed = applyPreset(maleState, [
      'M_A_TOP_ao_ngu_than',
      'F_COMMON_BOTTOM_quan_lua_trang',
      'F_COMMON_SHOES_giay_vai_den',
    ]);
    expect(mixed.itemIds).toEqual(['M_A_TOP_ao_ngu_than']);
  });

  it('dispatches APPLY_PRESET in outfitReducer cleanly', () => {
    let state = createInitialOutfit('female');
    const setCFemale = getPreset('set-c-female')!;

    state = outfitReducer(state, {
      type: 'APPLY_PRESET',
      itemIds: setCFemale.item_ids,
    });

    expect(state.itemIds).toEqual(setCFemale.item_ids);
    expect(getMatchingPreset(state, presetsByGender('female'))?.id).toBe(
      'set-c-female'
    );
  });
});
