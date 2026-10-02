import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Data files verification', () => {
  const dataDir = path.resolve(import.meta.dirname, '../data');

  const expectedFiles: { name: string; type: 'array' | 'object' }[] = [
    { name: 'items.json', type: 'array' },
    { name: 'stories.json', type: 'object' },
    { name: 'rules.json', type: 'array' },
    { name: 'anchors.json', type: 'object' },
    { name: 'fit.json', type: 'object' },
    { name: 'fit_defaults.json', type: 'object' },
    { name: 'manifest.json', type: 'object' },
    { name: 'scenes.json', type: 'array' },
  ];

  expectedFiles.forEach(({ name, type }) => {
    it(`loads ${name} and verifies it is valid JSON of expected type (${type})`, () => {
      const filePath = path.join(dataDir, name);
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8');
      let parsed: unknown;
      expect(() => {
        parsed = JSON.parse(content);
      }).not.toThrow();

      if (type === 'array') {
        expect(Array.isArray(parsed)).toBe(true);
      } else {
        expect(typeof parsed).toBe('object');
        expect(parsed).not.toBeNull();
        expect(Array.isArray(parsed)).toBe(false);
      }
    });
  });

  it('verifies scenes.json has exactly four entries with a numeric remix_cap', () => {
    const filePath = path.join(dataDir, 'scenes.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    const scenes = JSON.parse(content);

    expect(Array.isArray(scenes)).toBe(true);
    expect(scenes).toHaveLength(4);

    scenes.forEach((scene: any) => {
      expect(scene).toHaveProperty('id');
      expect(typeof scene.id).toBe('string');
      expect(scene).toHaveProperty('name_vi');
      expect(typeof scene.name_vi).toBe('string');
      expect(scene).toHaveProperty('remix_cap');
      expect(typeof scene.remix_cap).toBe('number');
      expect(scene).toHaveProperty('suggested_sets');
      expect(Array.isArray(scene.suggested_sets)).toBe(true);
    });
  });
});
