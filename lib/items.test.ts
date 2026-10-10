import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('T1: items.json and presets.json', () => {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const itemsPath = path.join(rootDir, 'data', 'items.json');
  const presetsPath = path.join(rootDir, 'data', 'presets.json');

  const items = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));
  const presets = JSON.parse(fs.readFileSync(presetsPath, 'utf-8'));

  const expectedMaleKinds = [
    'ao_ngu_than',
    'ao_giao_linh',
    'ao_tac',
    'quan_lua_trang',
    'quan_hien_dai',
    'giay_vai_den',
    'giay_sneaker',
    'non_la',
  ];

  const expectedFemaleKinds = [
    'ao_ngu_than',
    'ao_giao_linh',
    'ao_nhat_binh',
    'quan_lua_trang',
    'vay_dai',
    'quan_hien_dai',
    'giay_vai_den',
    'giay_sneaker',
    'non_la',
    'tram_cai',
  ];

  it('verifies 18 items (8 male, 10 female)', () => {
    expect(items).toHaveLength(18);
    const maleItems = items.filter((i: any) => i.gender === 'male');
    const femaleItems = items.filter((i: any) => i.gender === 'female');
    expect(maleItems).toHaveLength(8);
    expect(femaleItems).toHaveLength(10);
  });

  it('verifies kinds per gender match the expected specification', () => {
    const maleKinds = items
      .filter((i: any) => i.gender === 'male')
      .map((i: any) => i.kind)
      .sort();
    const femaleKinds = items
      .filter((i: any) => i.gender === 'female')
      .map((i: any) => i.kind)
      .sort();

    expect(maleKinds).toEqual([...expectedMaleKinds].sort());
    expect(femaleKinds).toEqual([...expectedFemaleKinds].sort());
  });

  it('verifies item ids are unique', () => {
    const ids = items.map((i: any) => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(items.length);
  });

  it('verifies every image_file exists under assets/<gender>/', () => {
    items.forEach((item: any) => {
      const assetPath = path.join(rootDir, 'assets', item.gender, item.image_file);
      expect(fs.existsSync(assetPath)).toBe(true);
      expect(item.id).toBe(item.image_file.replace(/\.png$/, ''));
    });
  });

  it('verifies every item has needs_review = true', () => {
    items.forEach((item: any) => {
      expect(item.needs_review).toBe(true);
      expect(item.region).toBeNull();
      expect(item.period).toBeNull();
      expect(item.sources).toEqual([]);
    });
  });

  it('verifies presets.json has 10 presets whose item ids exist, share the preset gender, and have at most one item per slot', () => {
    expect(presets).toHaveLength(10);
    const itemMap = new Map(items.map((i: any) => [i.id, i]));

    presets.forEach((preset: any) => {
      expect(preset).toHaveProperty('id');
      expect(preset).toHaveProperty('name_vi');
      expect(preset).toHaveProperty('gender');
      expect(['male', 'female']).toContain(preset.gender);
      expect(preset).toHaveProperty('type');
      expect(['set', 'remix']).toContain(preset.type);
      expect(Array.isArray(preset.item_ids)).toBe(true);
      expect(preset.item_ids.length).toBeGreaterThan(0);

      const slotsSeen = new Set<string>();
      preset.item_ids.forEach((itemId: string) => {
        const item: any = itemMap.get(itemId);
        expect(item, `Item id ${itemId} in preset ${preset.id} must exist`).toBeDefined();
        expect(item.gender, `Item ${itemId} must match preset gender ${preset.gender}`).toBe(preset.gender);
        expect(slotsSeen.has(item.slot), `Preset ${preset.id} has duplicate slot: ${item.slot}`).toBe(false);
        slotsSeen.add(item.slot);
      });
    });
  });
});
