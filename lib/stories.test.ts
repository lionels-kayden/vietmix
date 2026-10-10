import { describe, it, expect, beforeAll } from 'vitest';
import {
  validateStories,
  loadStories,
  getKindStory,
  getItemStory,
  getPresetStory,
  getRemixLevelStory,
  getAllItemStories,
} from './stories';
import { loadAll, getItem } from './data';
import { ITEM_KINDS } from './types';

describe('P5 - T1 & T2: Story cards data and loader (lib/stories.ts)', () => {
  beforeAll(() => {
    loadAll();
  });

  it('validates real data/stories.json successfully with zero errors', () => {
    const stories = loadStories();
    expect(stories).toBeDefined();
    expect(stories.items).toBeDefined();
    expect(stories.presets).toBeDefined();
    expect(stories.remix_levels).toBeDefined();
  });

  it('covers all 12 item kinds with complete cultural stories', () => {
    for (const kind of ITEM_KINDS) {
      const story = getKindStory(kind);
      expect(story, `Story for kind "${kind}" must exist`).toBeDefined();
      expect(story!.title_vi).toBeTruthy();
      expect(story!.period).toBeTruthy();
      expect(story!.origin).toBeTruthy();
      expect(story!.occasion).toBeTruthy();
      expect(story!.remix_note).toBeTruthy();
      expect(Array.isArray(story!.sources)).toBe(true);
      expect(typeof story!.needs_review).toBe('boolean');
    }
  });

  it('covers all 10 presets with summaries and cultural sources', () => {
    const presetIds = [
      'set-a-male',
      'set-b-male',
      'set-c-male',
      'rx-01-male',
      'rx-02-male',
      'set-a-female',
      'set-b-female',
      'set-c-female',
      'rx-01-female',
      'rx-02-female',
    ];

    for (const id of presetIds) {
      const story = getPresetStory(id);
      expect(story, `Story for preset "${id}" must exist`).toBeDefined();
      expect(story!.name_vi).toBeTruthy();
      expect(story!.summary).toBeTruthy();
      expect(Array.isArray(story!.sources)).toBe(true);
    }
  });

  it('covers all 3 remix levels (0, 1, 2)', () => {
    for (let level = 0; level <= 2; level++) {
      const story = getRemixLevelStory(level);
      expect(story, `Story for remix level ${level} must exist`).toBeDefined();
      expect(story!.level).toBe(level);
      expect(story!.title).toBeTruthy();
      expect(story!.summary).toBeTruthy();
    }
  });

  it('resolves item story correctly via getItemStory', () => {
    const nguThanStory = getItemStory('M_A_TOP_ao_ngu_than');
    expect(nguThanStory).toBeDefined();
    expect(nguThanStory!.kind).toBe('ao_ngu_than');
    expect(nguThanStory!.title_vi).toBe('Áo ngũ thân');

    const sneakerStory = getItemStory('F_MIX_SHOES_giay_sneaker');
    expect(sneakerStory).toBeDefined();
    expect(sneakerStory!.kind).toBe('giay_sneaker');

    // Unknown item returns undefined
    const unknownStory = getItemStory('non_existent_item_id');
    expect(unknownStory).toBeUndefined();
  });

  it('rejects invalid story structures and kinds during validation', () => {
    const invalidData = {
      items: {
        invalid_item: {
          kind: 'unknown_kind_foo',
          title_vi: 'Test',
          period: 'Test',
          origin: 'Test',
          occasion: 'Test',
          remix_note: 'Test',
          sources: [],
          needs_review: 'not-a-boolean',
        },
      },
      presets: 'not-an-object',
      remix_levels: {},
    };

    const errors = validateStories(invalidData);
    expect(errors.some((e) => e.includes('invalid kind'))).toBe(true);
    expect(errors.some((e) => e.includes('needs_review must be a boolean'))).toBe(true);
    expect(errors.some((e) => e.includes('"presets" object'))).toBe(true);
  });
});
