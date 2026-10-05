import { describe, it, expect, beforeAll } from 'vitest';
import { loadAll } from './data';
import {
  createInitialOutfit,
  selectGender,
  equipItem,
  removeItem,
  clearOutfit,
  outfitReducer,
  getEquippedItem,
} from './outfit';

describe('T2: Character selection and outfit state (lib/outfit.ts)', () => {
  beforeAll(() => {
    loadAll();
  });

  it('selects gender and clears outfit on gender change', () => {
    let state = createInitialOutfit('male');
    state = equipItem(state, 'M_A_TOP_ao_ngu_than');
    expect(state.itemIds).toEqual(['M_A_TOP_ao_ngu_than']);

    // Reselecting same gender does not clear outfit
    state = selectGender(state, 'male');
    expect(state.itemIds).toEqual(['M_A_TOP_ao_ngu_than']);

    // Changing gender clears worn items
    state = selectGender(state, 'female');
    expect(state.gender).toBe('female');
    expect(state.itemIds).toEqual([]);
  });

  it('rejects unknown and wrong-gender IDs', () => {
    const state = createInitialOutfit('male');

    // Unknown ID
    const afterUnknown = equipItem(state, 'non_existent_item');
    expect(afterUnknown.itemIds).toEqual([]);

    // Wrong-gender ID (female item on male character)
    const afterWrongGender = equipItem(state, 'F_A_TOP_ao_ngu_than');
    expect(afterWrongGender.itemIds).toEqual([]);
  });

  it('equips item and replaces same slot without duplication', () => {
    let state = createInitialOutfit('male');

    // Equip top
    state = equipItem(state, 'M_A_TOP_ao_ngu_than');
    expect(state.itemIds).toEqual(['M_A_TOP_ao_ngu_than']);

    // Equip another top in the same slot: replaces previous top
    state = equipItem(state, 'M_B_TOP_ao_giao_linh');
    expect(state.itemIds).toEqual(['M_B_TOP_ao_giao_linh']);

    // Equip bottom in different slot: both worn
    state = equipItem(state, 'M_COMMON_BOTTOM_quan_lua_trang');
    expect(state.itemIds).toContain('M_B_TOP_ao_giao_linh');
    expect(state.itemIds).toContain('M_COMMON_BOTTOM_quan_lua_trang');
    expect(state.itemIds).toHaveLength(2);

    // Re-equipping exact same item does not duplicate
    state = equipItem(state, 'M_B_TOP_ao_giao_linh');
    expect(state.itemIds).toHaveLength(2);
  });

  it('replaces head accessory when switching between conical hat and silver hairpin', () => {
    let state = createInitialOutfit('female');

    // Equip conical hat (slot: head)
    state = equipItem(state, 'F_COMMON_HEAD_non_la');
    expect(state.itemIds).toEqual(['F_COMMON_HEAD_non_la']);

    // Equip silver hairpin (slot: head): replaces conical hat
    state = equipItem(state, 'F_COMMON_HEAD_tram_cai');
    expect(state.itemIds).toEqual(['F_COMMON_HEAD_tram_cai']);

    // Equip necklace (slot: neck): worn concurrently with head accessory
    state = equipItem(state, 'F_COMMON_NECK_vong_co_bac');
    expect(state.itemIds).toContain('F_COMMON_HEAD_tram_cai');
    expect(state.itemIds).toContain('F_COMMON_NECK_vong_co_bac');
  });

  it('removes item and clears outfit', () => {
    let state = createInitialOutfit('male');
    state = equipItem(state, 'M_A_TOP_ao_ngu_than');
    state = equipItem(state, 'M_COMMON_BOTTOM_quan_lua_trang');

    state = removeItem(state, 'M_A_TOP_ao_ngu_than');
    expect(state.itemIds).toEqual(['M_COMMON_BOTTOM_quan_lua_trang']);

    state = clearOutfit(state);
    expect(state.itemIds).toEqual([]);
  });

  it('works correctly with outfitReducer', () => {
    let state = createInitialOutfit();

    state = outfitReducer(state, { type: 'SELECT_GENDER', gender: 'female' });
    expect(state.gender).toBe('female');

    state = outfitReducer(state, { type: 'EQUIP_ITEM', itemId: 'F_A_TOP_ao_ngu_than' });
    expect(state.itemIds).toEqual(['F_A_TOP_ao_ngu_than']);

    expect(getEquippedItem(state, 'top')?.id).toBe('F_A_TOP_ao_ngu_than');
    expect(getEquippedItem(state, 'bottom')).toBeUndefined();

    state = outfitReducer(state, { type: 'REMOVE_ITEM', itemId: 'F_A_TOP_ao_ngu_than' });
    expect(state.itemIds).toEqual([]);
  });
});
