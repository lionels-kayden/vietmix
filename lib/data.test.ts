import { describe, it, expect } from 'vitest';
import {
  validateItems,
  validatePresets,
  validateScenes,
  validateRules,
  loadAll,
  getItem,
  itemsByGender,
  itemsBySlot,
} from './data';
import { Item } from './types';

describe('T2: Types and loader', () => {
  const sampleValidItem: Item = {
    id: 'test_top',
    gender: 'male',
    set: 'A',
    slot: 'top',
    kind: 'ao_ngu_than',
    name_vi: 'Áo ngũ thân',
    name_en: 'five-panel tunic',
    fabric_class: 'fitted',
    modern: false,
    stand_collar: true,
    ceremonial: false,
    image_file: 'non_existent_file.png', // missing image files are NOT a loader error
    region: null,
    period: null,
    sources: [],
    needs_review: true,
  };

  describe('validateItems', () => {
    it('passes for valid items, even if image_file does not exist on disk', () => {
      const errors = validateItems([sampleValidItem]);
      expect(errors).toHaveLength(0);
    });

    it('rejects duplicate item ids', () => {
      const errors = validateItems([sampleValidItem, { ...sampleValidItem }]);
      expect(errors.some((e) => e.includes('Duplicate item id'))).toBe(true);
    });

    it('rejects unknown enum values', () => {
      const invalidEnums = [
        { ...sampleValidItem, id: '1', gender: 'other' },
        { ...sampleValidItem, id: '2', set: 'INVALID' },
        { ...sampleValidItem, id: '3', slot: 'wrist' },
        { ...sampleValidItem, id: '4', kind: 'unknown_kind' },
        { ...sampleValidItem, id: '5', fabric_class: 'stretchy' },
      ];
      const errors = validateItems(invalidEnums);
      expect(errors.some((e) => e.includes('invalid gender'))).toBe(true);
      expect(errors.some((e) => e.includes('invalid set'))).toBe(true);
      expect(errors.some((e) => e.includes('invalid slot'))).toBe(true);
      expect(errors.some((e) => e.includes('invalid kind'))).toBe(true);
      expect(errors.some((e) => e.includes('invalid fabric_class'))).toBe(true);
    });

    it('rejects wrong gender-kind combinations', () => {
      const wrongCombinations = [
        { ...sampleValidItem, id: 'w1', gender: 'female', kind: 'ao_tac' },
        { ...sampleValidItem, id: 'w2', gender: 'male', kind: 'ao_nhat_binh' },
        { ...sampleValidItem, id: 'w3', gender: 'male', kind: 'vay_dai' },
        { ...sampleValidItem, id: 'w4', gender: 'male', kind: 'tram_cai' },
      ];
      const errors = validateItems(wrongCombinations);
      expect(errors).toHaveLength(4);
      expect(errors[0]).toContain('restricted to male, got female');
      expect(errors[1]).toContain('restricted to female, got male');
      expect(errors[2]).toContain('restricted to female, got male');
      expect(errors[3]).toContain('restricted to female, got male');
    });
  });

  describe('validatePresets', () => {
    const validItems: Item[] = [
      sampleValidItem,
      {
        ...sampleValidItem,
        id: 'test_bottom',
        slot: 'bottom',
        kind: 'quan_lua_trang',
      },
      {
        ...sampleValidItem,
        id: 'test_female_top',
        gender: 'female',
        kind: 'ao_ngu_than',
      },
    ];

    const validPreset = {
      id: 'test_preset',
      name_vi: 'Bộ phối thử',
      gender: 'male',
      type: 'set',
      item_ids: ['test_top', 'test_bottom'],
    };

    it('passes for valid presets', () => {
      const errors = validatePresets([validPreset], validItems);
      expect(errors).toHaveLength(0);
    });

    it('rejects duplicate preset ids', () => {
      const errors = validatePresets([validPreset, { ...validPreset }], validItems);
      expect(errors.some((e) => e.includes('Duplicate preset id'))).toBe(true);
    });

    it('rejects unknown enum values in presets', () => {
      const errors = validatePresets(
        [{ ...validPreset, gender: 'unisex', type: 'unknown_type' }],
        validItems
      );
      expect(errors.some((e) => e.includes('invalid gender'))).toBe(true);
      expect(errors.some((e) => e.includes('invalid type'))).toBe(true);
    });

    it('rejects unknown item ids, gender mismatch, and duplicate slots', () => {
      const invalidPresets = [
        {
          ...validPreset,
          id: 'p_unknown',
          item_ids: ['non_existent_item'],
        },
        {
          ...validPreset,
          id: 'p_mismatch',
          item_ids: ['test_female_top'],
        },
        {
          ...validPreset,
          id: 'p_dup_slot',
          item_ids: ['test_top', 'test_top'],
        },
      ];
      const errors = validatePresets(invalidPresets, validItems);
      expect(errors.some((e) => e.includes('unknown item id'))).toBe(true);
      expect(errors.some((e) => e.includes('does not match item'))).toBe(true);
      expect(errors.some((e) => e.includes('duplicate slot'))).toBe(true);
    });
  });

  describe('validateScenes', () => {
    const validScene = {
      id: 'tet',
      name_vi: 'Tết',
      remix_cap: 1,
      suggested_sets: [],
    };

    it('passes for valid scenes', () => {
      const errors = validateScenes([validScene]);
      expect(errors).toHaveLength(0);
    });

    it('rejects duplicate scene id and invalid fields', () => {
      const errors = validateScenes([
        validScene,
        { ...validScene, remix_cap: -1 },
        { id: '', name_vi: '', remix_cap: 0, suggested_sets: [] },
      ]);
      expect(errors.some((e) => e.includes('Duplicate scene id'))).toBe(true);
      expect(errors.some((e) => e.includes('non-negative number'))).toBe(true);
      expect(errors.some((e) => e.includes('missing or empty id'))).toBe(true);
    });

    it('accepts empty suggested_sets and valid set codes', () => {
      const sceneEmpty = { ...validScene, suggested_sets: [] };
      const sceneAllValid = {
        ...validScene,
        suggested_sets: ['A', 'B', 'C', 'MIX', 'COMMON'],
      };
      expect(validateScenes([sceneEmpty])).toHaveLength(0);
      expect(validateScenes([sceneAllValid])).toHaveLength(0);
    });

    it('rejects invalid suggested_sets entries', () => {
      const sceneInvalid = { ...validScene, suggested_sets: ['INVALID'] };
      const errorsInvalid = validateScenes([sceneInvalid]);
      expect(errorsInvalid.some((e) => e.includes('INVALID'))).toBe(true);

      const sceneMixed = { ...validScene, suggested_sets: ['A', 'INVALID'] };
      const errorsMixed = validateScenes([sceneMixed]);
      expect(errorsMixed.some((e) => e.includes('INVALID'))).toBe(true);
    });

    it('rejects non-string entries such as null and 123 without throwing', () => {
      expect(() => {
        const sceneNonString = { ...validScene, suggested_sets: [null, 123] };
        const errors = validateScenes([sceneNonString]);
        expect(errors.length).toBeGreaterThanOrEqual(2);
      }).not.toThrow();
    });
  });

  describe('validateRules', () => {
    const validRules = [
      {
        id: 'R_DUP_TOP',
        level: 'block',
        type: 'duplicate_slot',
        slot: 'top',
        message_key: 'duplicate_top',
        message_vi: 'Không thể mặc 2 áo cùng lúc.',
        needs_review: true,
      },
      {
        id: 'R_COMBO_TEST',
        level: 'warn',
        type: 'combo',
        all: [{ kind: 'ao_tac' }, { attr: 'ceremonial' }, { set: 'MIX' }],
        message_key: 'combo_test',
        message_vi: 'Thử nghiệm combo.',
        needs_review: true,
      },
    ];

    it('passes for valid rules', () => {
      const errors = validateRules(validRules);
      expect(errors).toHaveLength(0);
    });

    it('rejects duplicate rule ids, invalid level, and unknown kind in matcher', () => {
      const invalidRules = [
        { ...validRules[0] },
        { ...validRules[0] },
        { ...validRules[0], id: 'R_INVALID_LEVEL', level: 'critical' },
        {
          id: 'R_UNKNOWN_KIND',
          level: 'block',
          type: 'combo',
          all: [{ kind: 'ao_dai_cach_tan_unknown' }],
          message_key: 'test',
          message_vi: 'Test',
          needs_review: true,
        },
      ];
      const errors = validateRules(invalidRules);
      expect(errors.some((e) => e.includes('Duplicate rule id'))).toBe(true);
      expect(errors.some((e) => e.includes('invalid level'))).toBe(true);
      expect(errors.some((e) => e.includes('references unknown kind'))).toBe(true);
    });
  });

  describe('loadAll and helpers on real data', () => {
    it('successfully loads all real data without errors', () => {
      const data = loadAll();
      expect(data.items.length).toBe(20);
      expect(data.presets.length).toBe(10);
      expect(data.scenes.length).toBe(4);
      expect(Array.isArray(data.rules)).toBe(true);
    });

    it('throws when loadAll receives invalid data', () => {
      expect(() => {
        loadAll({
          items: [{ invalid: 'item' }],
        });
      }).toThrow(/Data validation failed/);
    });

    it('throws when loadAll receives a scene with invalid suggested_sets', () => {
      expect(() => {
        loadAll({
          scenes: [
            {
              id: 'tet',
              name_vi: 'Tết',
              remix_cap: 1,
              suggested_sets: ['INVALID'],
            },
          ],
        });
      }).toThrow(/Data validation failed/);
    });

    it('getItem finds items by id', () => {
      loadAll();
      const item = getItem('M_A_TOP_ao_ngu_than');
      expect(item).toBeDefined();
      expect(item?.kind).toBe('ao_ngu_than');
      expect(item?.gender).toBe('male');

      const nonExistent = getItem('non_existent');
      expect(nonExistent).toBeUndefined();
    });

    it('itemsByGender filters correctly', () => {
      loadAll();
      const maleItems = itemsByGender('male');
      const femaleItems = itemsByGender('female');
      expect(maleItems).toHaveLength(9);
      expect(femaleItems).toHaveLength(11);
      expect(maleItems.every((i) => i.gender === 'male')).toBe(true);
      expect(femaleItems.every((i) => i.gender === 'female')).toBe(true);
    });

    it('itemsBySlot filters correctly', () => {
      loadAll();
      const maleTops = itemsBySlot('male', 'top');
      expect(maleTops).toHaveLength(3);
      expect(maleTops.every((i) => i.slot === 'top' && i.gender === 'male')).toBe(true);

      const femaleHead = itemsBySlot('female', 'head');
      expect(femaleHead).toHaveLength(2); // non_la and tram_cai
      expect(femaleHead.map((i) => i.kind).sort()).toEqual(['non_la', 'tram_cai'].sort());
    });
  });
});
