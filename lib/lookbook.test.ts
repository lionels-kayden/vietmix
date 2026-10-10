import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveToLookbook,
  getLookbook,
  deleteFromLookbook,
  clearLookbook,
  isStorageAvailable,
  dataUrlToFile,
  downloadDataUrl,
  LEGACY_STORAGE_KEY,
} from './lookbook';

describe('Lookbook Album storage (lib/lookbook.ts)', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearLookbook();
    vi.restoreAllMocks();
  });

  it('checks storage availability', () => {
    expect(isStorageAvailable()).toBe(true);
  });

  it('saves and retrieves lookbook entries in descending chronological order with PNG imageData', async () => {
    const fakeDataUrl1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const entry1 = await saveToLookbook({
      gender: 'male',
      itemIds: ['M_A_TOP_ao_ngu_than'],
      sceneId: 'tet',
      summary: 'Tết Hoàng Cung',
      remixLevel: 0,
      title: 'Áo Ngũ Thân Truyền Thống',
      imageData: fakeDataUrl1,
      timestamp: 1000,
    });
    expect(entry1).toBeDefined();
    expect(entry1?.id).toBeTruthy();
    expect(entry1?.imageData).toBe(fakeDataUrl1);

    const fakeDataUrl2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const entry2 = await saveToLookbook({
      gender: 'female',
      itemIds: ['F_C_TOP_ao_nhat_binh'],
      sceneId: 'ky-yeu',
      summary: 'Kỷ yếu Nhật Bình',
      remixLevel: 1,
      title: 'Nhật Bình Cách Tân',
      imageData: fakeDataUrl2,
      timestamp: 2000,
    });
    expect(entry2).toBeDefined();

    const lookbook = await getLookbook();
    expect(lookbook).toHaveLength(2);
    // Most recent entry first
    expect(lookbook[0].id).toBe(entry2!.id);
    expect(lookbook[0].imageData).toBe(fakeDataUrl2);
    expect(lookbook[1].id).toBe(entry1!.id);
    expect(lookbook[1].imageData).toBe(fakeDataUrl1);
  });

  it('deletes specific lookbook entry by id', async () => {
    const entry1 = (await saveToLookbook({
      gender: 'male',
      itemIds: ['M_A_TOP_ao_ngu_than'],
      sceneId: 'tet',
      summary: 'Test 1',
      remixLevel: 0,
    }))!;

    const entry2 = (await saveToLookbook({
      gender: 'female',
      itemIds: ['F_A_TOP_ao_ngu_than'],
      sceneId: 'le-hoi',
      summary: 'Test 2',
      remixLevel: 0,
    }))!;

    expect(await getLookbook()).toHaveLength(2);

    const deleteSuccess = await deleteFromLookbook(entry1.id);
    expect(deleteSuccess).toBe(true);

    const remaining = await getLookbook();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(entry2.id);
  });

  it('preserves and automatically migrates previously saved outfits from localStorage', async () => {
    // Simulate outfits previously saved in localStorage before the album upgrade
    const oldOutfits = [
      {
        id: 'legacy_outfit_01',
        timestamp: 1600000000000,
        gender: 'male',
        itemIds: ['M_A_TOP_ao_ngu_than', 'M_A_BOTTOM_quan_trang'],
        sceneId: 'tet',
        summary: 'Bộ đồ cổ truyền lưu trước đây',
        remixLevel: 0,
      },
      {
        id: 'legacy_outfit_02',
        timestamp: 1600000001000,
        gender: 'female',
        itemIds: ['F_B_TOP_ao_giao_linh', 'F_B_BOTTOM_vay_xep_ly'],
        sceneId: 'doi-thuong',
        summary: 'Bộ giao lĩnh lưu trước đây',
        remixLevel: 1,
      },
    ];

    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(oldOutfits));

    // When getLookbook is called, it should migrate and preserve them!
    const loaded = await getLookbook();
    expect(loaded.length).toBeGreaterThanOrEqual(2);

    const found1 = loaded.find((e) => e.id === 'legacy_outfit_01');
    const found2 = loaded.find((e) => e.id === 'legacy_outfit_02');
    expect(found1).toBeDefined();
    expect(found1?.summary).toBe('Bộ đồ cổ truyền lưu trước đây');
    expect(found2).toBeDefined();
    expect(found2?.summary).toBe('Bộ giao lĩnh lưu trước đây');
  });

  it('converts dataUrl to File correctly and allows downloading', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const file = dataUrlToFile(dataUrl, 'my-outfit.png');
    expect(file).not.toBeNull();
    expect(file?.name).toBe('my-outfit.png');
    expect(file?.type).toBe('image/png');
    expect(file?.size).toBeGreaterThan(0);

    const clickSpy = vi.fn();
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = origCreateElement(tagName);
      if (tagName === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    const downloaded = downloadDataUrl(dataUrl, 'download-test.png');
    expect(downloaded).toBe(true);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('recovers gracefully from corrupt JSON in legacy localStorage without throwing', async () => {
    window.localStorage.setItem(LEGACY_STORAGE_KEY, 'INVALID_CORRUPT_JSON{{{');

    const lookbook = await getLookbook();
    expect(lookbook).toEqual([]);

    // Can still save new entries normally after recovery
    const newEntry = await saveToLookbook({
      gender: 'male',
      itemIds: ['M_B_TOP_ao_giao_linh'],
      sceneId: 'doi-thuong',
      summary: 'Recovered',
      remixLevel: 1,
    });
    expect(newEntry).toBeDefined();
    expect(await getLookbook()).toHaveLength(1);
  });
});
