import { describe, it, expect, beforeAll } from 'vitest';
import { loadAll } from './data';
import { evaluate } from './rules';

describe('T3: Rules and the rule engine', () => {
  beforeAll(() => {
    loadAll();
  });

  it('empty outfit returns no hits and canConfirm is true', () => {
    const res = evaluate({ gender: 'male', itemIds: [] });
    expect(res.block).toHaveLength(0);
    expect(res.warn).toHaveLength(0);
    expect(res.suggest).toHaveLength(0);
    expect(res.canConfirm).toBe(true);
  });

  describe('Rule R_DUP_TOP', () => {
    it('triggers when 2 tops are in the outfit', () => {
      const res = evaluate({
        gender: 'male',
        itemIds: ['M_A_TOP_ao_ngu_than', 'M_B_TOP_ao_giao_linh'],
      });
      expect(res.block.some((h) => h.ruleId === 'R_DUP_TOP')).toBe(true);
      expect(res.canConfirm).toBe(false);
    });

    it('does not trigger with 1 top', () => {
      const res = evaluate({
        gender: 'male',
        itemIds: ['M_A_TOP_ao_ngu_than'],
      });
      expect(res.block.some((h) => h.ruleId === 'R_DUP_TOP')).toBe(false);
    });
  });

  describe('Rule R_DUP_BOTTOM', () => {
    it('triggers when 2 bottoms are in the outfit', () => {
      const res = evaluate({
        gender: 'male',
        itemIds: ['M_COMMON_BOTTOM_quan_lua_trang', 'M_MIX_BOTTOM_quan_hien_dai'],
      });
      expect(res.block.some((h) => h.ruleId === 'R_DUP_BOTTOM')).toBe(true);
      expect(res.canConfirm).toBe(false);
    });

    it('does not trigger with 1 bottom', () => {
      const res = evaluate({
        gender: 'male',
        itemIds: ['M_COMMON_BOTTOM_quan_lua_trang'],
      });
      expect(res.block.some((h) => h.ruleId === 'R_DUP_BOTTOM')).toBe(false);
    });
  });

  describe('Rule R_NECKLACE_STAND_COLLAR', () => {
    it('triggers when silver necklace is combined with a stand collar top', () => {
      const res = evaluate({
        gender: 'male',
        itemIds: ['M_COMMON_NECK_vong_co_bac', 'M_A_TOP_ao_ngu_than'],
      });
      expect(res.block.some((h) => h.ruleId === 'R_NECKLACE_STAND_COLLAR')).toBe(true);
      expect(res.canConfirm).toBe(false);
    });

    it('does not trigger when silver necklace is combined with cross-collar (no stand collar)', () => {
      const res = evaluate({
        gender: 'male',
        itemIds: ['M_COMMON_NECK_vong_co_bac', 'M_B_TOP_ao_giao_linh'],
      });
      expect(res.block.some((h) => h.ruleId === 'R_NECKLACE_STAND_COLLAR')).toBe(false);
    });
  });

  describe('Rule R_HAT_HAIRPIN', () => {
    it('triggers when conical hat and silver hairpin are both present', () => {
      const res = evaluate({
        gender: 'female',
        itemIds: ['F_COMMON_HEAD_non_la', 'F_COMMON_HEAD_tram_cai'],
      });
      expect(res.block.some((h) => h.ruleId === 'R_HAT_HAIRPIN')).toBe(true);
      expect(res.canConfirm).toBe(false);
    });

    it('does not trigger with conical hat alone', () => {
      const res = evaluate({
        gender: 'female',
        itemIds: ['F_COMMON_HEAD_non_la'],
      });
      expect(res.block.some((h) => h.ruleId === 'R_HAT_HAIRPIN')).toBe(false);
    });
  });

  describe('Rule R_HAT_CEREMONIAL', () => {
    it('triggers when conical hat is combined with ceremonial garment (ao tac)', () => {
      const res = evaluate({
        gender: 'male',
        itemIds: ['M_COMMON_HEAD_non_la', 'M_C_TOP_ao_tac'],
      });
      expect(res.warn.some((h) => h.ruleId === 'R_HAT_CEREMONIAL')).toBe(true);
    });

    it('does not trigger when conical hat is combined with non-ceremonial garment (ao ngu than)', () => {
      const res = evaluate({
        gender: 'male',
        itemIds: ['M_COMMON_HEAD_non_la', 'M_A_TOP_ao_ngu_than'],
      });
      expect(res.warn.some((h) => h.ruleId === 'R_HAT_CEREMONIAL')).toBe(false);
    });
  });

  describe('Rule R_SNEAKER_SET_C', () => {
    it('triggers when sneakers are paired with set C garment', () => {
      const res = evaluate({
        gender: 'male',
        itemIds: ['M_MIX_SHOES_giay_sneaker', 'M_C_TOP_ao_tac'],
      });
      expect(res.warn.some((h) => h.ruleId === 'R_SNEAKER_SET_C')).toBe(true);
    });

    it('does not trigger when sneakers are paired with set A', () => {
      const res = evaluate({
        gender: 'male',
        itemIds: ['M_MIX_SHOES_giay_sneaker', 'M_A_TOP_ao_ngu_than'],
      });
      expect(res.warn.some((h) => h.ruleId === 'R_SNEAKER_SET_C')).toBe(false);
    });
  });

  describe('Rule R_BEIGE_NHAT_BINH', () => {
    it('triggers when beige trousers are combined with ao nhat binh', () => {
      const res = evaluate({
        gender: 'female',
        itemIds: ['F_MIX_BOTTOM_quan_hien_dai', 'F_C_TOP_ao_nhat_binh'],
      });
      expect(res.warn.some((h) => h.ruleId === 'R_BEIGE_NHAT_BINH')).toBe(true);
    });

    it('does not trigger when white silk trousers are combined with ao nhat binh', () => {
      const res = evaluate({
        gender: 'female',
        itemIds: ['F_COMMON_BOTTOM_quan_lua_trang', 'F_C_TOP_ao_nhat_binh'],
      });
      expect(res.warn.some((h) => h.ruleId === 'R_BEIGE_NHAT_BINH')).toBe(false);
    });
  });

  describe('Rule R_SKIRT_NGU_THAN', () => {
    it('triggers when black skirt is combined with ao ngu than', () => {
      const res = evaluate({
        gender: 'female',
        itemIds: ['F_B_BOTTOM_vay_dai', 'F_A_TOP_ao_ngu_than'],
      });
      expect(res.warn.some((h) => h.ruleId === 'R_SKIRT_NGU_THAN')).toBe(true);
    });

    it('does not trigger when black skirt is combined with ao giao linh', () => {
      const res = evaluate({
        gender: 'female',
        itemIds: ['F_B_BOTTOM_vay_dai', 'F_B_TOP_ao_giao_linh'],
      });
      expect(res.warn.some((h) => h.ruleId === 'R_SKIRT_NGU_THAN')).toBe(false);
    });
  });

  describe('Rule R_GIAO_LINH_SKIRT', () => {
    it('triggers suggest when ao giao linh is combined with black skirt', () => {
      const res = evaluate({
        gender: 'female',
        itemIds: ['F_B_TOP_ao_giao_linh', 'F_B_BOTTOM_vay_dai'],
      });
      expect(res.suggest.some((h) => h.ruleId === 'R_GIAO_LINH_SKIRT')).toBe(true);
    });

    it('does not trigger when ao giao linh is combined with white silk trousers', () => {
      const res = evaluate({
        gender: 'female',
        itemIds: ['F_B_TOP_ao_giao_linh', 'F_COMMON_BOTTOM_quan_lua_trang'],
      });
      expect(res.suggest.some((h) => h.ruleId === 'R_GIAO_LINH_SKIRT')).toBe(false);
    });
  });

  describe('Rule R_NGU_THAN_WHITE', () => {
    it('triggers suggest when ao ngu than is combined with white silk trousers', () => {
      const res = evaluate({
        gender: 'male',
        itemIds: ['M_A_TOP_ao_ngu_than', 'M_COMMON_BOTTOM_quan_lua_trang'],
      });
      expect(res.suggest.some((h) => h.ruleId === 'R_NGU_THAN_WHITE')).toBe(true);
    });

    it('does not trigger when ao ngu than is combined with modern beige trousers', () => {
      const res = evaluate({
        gender: 'male',
        itemIds: ['M_A_TOP_ao_ngu_than', 'M_MIX_BOTTOM_quan_hien_dai'],
      });
      expect(res.suggest.some((h) => h.ruleId === 'R_NGU_THAN_WHITE')).toBe(false);
    });
  });

  describe('Multi-problem outfit', () => {
    it('ao_tac + giay_sneaker + non_la gives two warns', () => {
      const res = evaluate({
        gender: 'male',
        itemIds: ['M_C_TOP_ao_tac', 'M_MIX_SHOES_giay_sneaker', 'M_COMMON_HEAD_non_la'],
      });
      expect(res.block).toHaveLength(0);
      expect(res.warn).toHaveLength(2);
      expect(res.warn.map((h) => h.ruleId).sort()).toEqual(
        ['R_HAT_CEREMONIAL', 'R_SNEAKER_SET_C'].sort()
      );
      expect(res.canConfirm).toBe(true);
    });
  });
});
