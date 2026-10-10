import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveToLookbook,
  getLookbook,
  deleteFromLookbook,
  clearLookbook,
  isStorageAvailable,
} from './lookbook';

describe('P7 - T3 & T4: Lookbook storage (lib/lookbook.ts)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves and retrieves lookbook entries in descending chronological order', () => {
    const entry1 = saveToLookbook({
      gender: 'male',
      itemIds: ['M_A_TOP_ao_ngu_than'],
      sceneId: 'tet',
      summary: 'Tết Hoàng Cung',
      remixLevel: 0,
    });
    expect(entry1).toBeDefined();
    expect(entry1?.id).toBeTruthy();

    const entry2 = saveToLookbook({
      gender: 'female',
      itemIds: ['F_C_TOP_ao_nhat_binh'],
      sceneId: 'ky-yeu',
      summary: 'Kỷ yếu Nhật Bình',
      remixLevel: 1,
    });
    expect(entry2).toBeDefined();

    const lookbook = getLookbook();
    expect(lookbook).toHaveLength(2);
    // Most recent entry first
    expect(lookbook[0].id).toBe(entry2!.id);
    expect(lookbook[1].id).toBe(entry1!.id);
  });

  it('deletes specific lookbook entry by id', () => {
    const entry1 = saveToLookbook({
      gender: 'male',
      itemIds: ['M_A_TOP_ao_ngu_than'],
      sceneId: 'tet',
      summary: 'Test',
      remixLevel: 0,
    })!;

    const entry2 = saveToLookbook({
      gender: 'female',
      itemIds: ['F_A_TOP_ao_ngu_than'],
      sceneId: 'le-hoi',
      summary: 'Test 2',
      remixLevel: 0,
    })!;

    expect(getLookbook()).toHaveLength(2);

    const deleteSuccess = deleteFromLookbook(entry1.id);
    expect(deleteSuccess).toBe(true);

    const remaining = getLookbook();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(entry2.id);
  });

  it('recovers gracefully from corrupt JSON in localStorage without throwing', () => {
    window.localStorage.setItem('vietmix_lookbook_v1', 'INVALID_CORRUPT_JSON{{{');

    const lookbook = getLookbook();
    expect(lookbook).toEqual([]);

    // Can still save new entries normally after recovery
    const newEntry = saveToLookbook({
      gender: 'male',
      itemIds: ['M_B_TOP_ao_giao_linh'],
      sceneId: 'doi-thuong',
      summary: 'Recovered',
      remixLevel: 1,
    });
    expect(newEntry).toBeDefined();
    expect(getLookbook()).toHaveLength(1);
  });

  it('handles QuotaExceededError or storage exceptions gracefully', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const result = saveToLookbook({
      gender: 'male',
      itemIds: [],
      sceneId: 'tet',
      summary: 'Overflow',
      remixLevel: 0,
    });

    expect(result).toBeNull();
  });
});
