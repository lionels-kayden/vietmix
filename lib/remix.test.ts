import { describe, it, expect, beforeAll } from 'vitest';
import { loadAll } from './data';
import { modernCount, remixLevel, sceneCapLevel, isWithinSceneCap } from './remix';
import { Item, Outfit } from './types';
import scenesJson from '../data/scenes.json';
import presetsJson from '../data/presets.json';

describe('T4: Remix level and scene cap', () => {
  beforeAll(() => {
    loadAll();
  });

  it('counts 0, 1, 2, and 3 modern items and calculates remix level correctly', () => {
    // Mock lookup for 0, 1, 2, 3 modern items
    const mockMap = new Map<string, Item>([
      ['mod_1', { id: 'mod_1', modern: true } as Item],
      ['mod_2', { id: 'mod_2', modern: true } as Item],
      ['mod_3', { id: 'mod_3', modern: true } as Item],
      ['trad_1', { id: 'trad_1', modern: false } as Item],
    ]);
    const mockLookup = (id: string) => mockMap.get(id);

    // 0 modern items
    const outfit0: Outfit = { gender: 'male', itemIds: ['trad_1'] };
    expect(modernCount(outfit0, mockLookup)).toBe(0);
    expect(remixLevel(outfit0, mockLookup)).toBe(0);

    // 1 modern item
    const outfit1: Outfit = { gender: 'male', itemIds: ['trad_1', 'mod_1'] };
    expect(modernCount(outfit1, mockLookup)).toBe(1);
    expect(remixLevel(outfit1, mockLookup)).toBe(1);

    // 2 modern items
    const outfit2: Outfit = { gender: 'male', itemIds: ['trad_1', 'mod_1', 'mod_2'] };
    expect(modernCount(outfit2, mockLookup)).toBe(2);
    expect(remixLevel(outfit2, mockLookup)).toBe(2);

    // 3 modern items (capped at 2 for remixLevel)
    const outfit3: Outfit = { gender: 'male', itemIds: ['mod_1', 'mod_2', 'mod_3'] };
    expect(modernCount(outfit3, mockLookup)).toBe(3);
    expect(remixLevel(outfit3, mockLookup)).toBe(2);
  });

  it('verifies scene caps equal PROJECT.md (le-hoi: 1, tet: 1, ky-yeu: 2, doi-thuong: 2)', () => {
    const sceneMap = new Map(scenesJson.map((s) => [s.id, s]));

    const leHoi = sceneMap.get('le-hoi');
    const tet = sceneMap.get('tet');
    const kyYeu = sceneMap.get('ky-yeu');
    const doiThuong = sceneMap.get('doi-thuong');

    expect(leHoi).toBeDefined();
    expect(leHoi?.remix_cap).toBe(1);
    expect(sceneCapLevel(leHoi!)).toBe(1);

    expect(tet).toBeDefined();
    expect(tet?.remix_cap).toBe(1);
    expect(sceneCapLevel(tet!)).toBe(1);

    expect(kyYeu).toBeDefined();
    expect(kyYeu?.remix_cap).toBe(2);
    expect(sceneCapLevel(kyYeu!)).toBe(2);

    expect(doiThuong).toBeDefined();
    expect(doiThuong?.remix_cap).toBe(2);
    expect(sceneCapLevel(doiThuong!)).toBe(2);
  });

  it('verifies RX-01 and RX-02 have remix level 2 and fail le-hoi and tet caps', () => {
    const presetMap = new Map(presetsJson.map((p) => [p.id, p]));
    const sceneMap = new Map(scenesJson.map((s) => [s.id, s]));

    const leHoi = sceneMap.get('le-hoi')!;
    const tet = sceneMap.get('tet')!;
    const kyYeu = sceneMap.get('ky-yeu')!;
    const doiThuong = sceneMap.get('doi-thuong')!;

    const rxPresets = ['rx-01-male', 'rx-01-female', 'rx-02-male', 'rx-02-female'];

    rxPresets.forEach((rxId) => {
      const preset = presetMap.get(rxId)!;
      expect(preset).toBeDefined();
      const outfit: Outfit = {
        gender: preset.gender as 'male' | 'female',
        itemIds: preset.item_ids,
      };

      expect(modernCount(outfit)).toBe(2);
      expect(remixLevel(outfit)).toBe(2);

      // Fails le-hoi and tet caps (cap = 1)
      expect(isWithinSceneCap(outfit, leHoi)).toBe(false);
      expect(isWithinSceneCap(outfit, tet)).toBe(false);

      // Passes ky-yeu and doi-thuong caps (cap = 2)
      expect(isWithinSceneCap(outfit, kyYeu)).toBe(true);
      expect(isWithinSceneCap(outfit, doiThuong)).toBe(true);
    });
  });

  it('verifies Set A, Set B, and Set C presets have remix level 0', () => {
    const presetMap = new Map(presetsJson.map((p) => [p.id, p]));
    const sceneMap = new Map(scenesJson.map((s) => [s.id, s]));

    const leHoi = sceneMap.get('le-hoi')!;
    const tet = sceneMap.get('tet')!;

    const setPresets = [
      'set-a-male',
      'set-a-female',
      'set-b-male',
      'set-b-female',
      'set-c-male',
      'set-c-female',
    ];

    setPresets.forEach((setId) => {
      const preset = presetMap.get(setId)!;
      expect(preset).toBeDefined();
      const outfit: Outfit = {
        gender: preset.gender as 'male' | 'female',
        itemIds: preset.item_ids,
      };

      expect(modernCount(outfit)).toBe(0);
      expect(remixLevel(outfit)).toBe(0);

      // Traditional sets pass all scene caps
      expect(isWithinSceneCap(outfit, leHoi)).toBe(true);
      expect(isWithinSceneCap(outfit, tet)).toBe(true);
    });
  });
});
