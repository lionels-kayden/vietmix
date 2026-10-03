import { describe, it, expect, beforeAll } from 'vitest';
import { loadAll } from './data';
import { evaluate } from './rules';
import presetsJson from '../data/presets.json';

describe('T5: Integration tests for presets', () => {
  beforeAll(() => {
    loadAll();
  });

  it('verifies every preset has no block and no warn hits', () => {
    presetsJson.forEach((preset) => {
      const res = evaluate({
        gender: preset.gender as 'male' | 'female',
        itemIds: preset.item_ids,
      });

      expect(
        res.block,
        `Preset ${preset.id} should have 0 block hits, got: ${JSON.stringify(res.block)}`
      ).toHaveLength(0);

      expect(
        res.warn,
        `Preset ${preset.id} should have 0 warn hits, got: ${JSON.stringify(res.warn)}`
      ).toHaveLength(0);

      expect(res.canConfirm, `Preset ${preset.id} must have canConfirm = true`).toBe(true);
    });
  });

  it('verifies Set A (both genders) and Set B female produce the expected suggest hit', () => {
    // Set A male: ao_ngu_than + quan_lua_trang triggers R_NGU_THAN_WHITE
    const setAMale = evaluate({
      gender: 'male',
      itemIds: ['M_A_TOP_ao_ngu_than', 'M_A_BOTTOM_white_silk_trousers', 'M_A_SHOES_cloth_shoes'],
    });
    expect(setAMale.suggest.some((h) => h.ruleId === 'R_NGU_THAN_WHITE')).toBe(true);

    // Set A female: ao_ngu_than + quan_lua_trang triggers R_NGU_THAN_WHITE
    const setAFemale = evaluate({
      gender: 'female',
      itemIds: ['F_A_TOP_ao_ngu_than', 'F_A_BOTTOM_white_silk_trousers', 'F_A_SHOES_cloth_shoes'],
    });
    expect(setAFemale.suggest.some((h) => h.ruleId === 'R_NGU_THAN_WHITE')).toBe(true);

    // Set B female: ao_giao_linh + vay_dai triggers R_GIAO_LINH_SKIRT
    const setBFemale = evaluate({
      gender: 'female',
      itemIds: ['F_B_TOP_ao_giao_linh', 'F_B_BOTTOM_black_skirt', 'F_A_SHOES_cloth_shoes'],
    });
    expect(setBFemale.suggest.some((h) => h.ruleId === 'R_GIAO_LINH_SKIRT')).toBe(true);
  });
});
