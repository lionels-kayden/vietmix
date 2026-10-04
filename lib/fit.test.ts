import { describe, it, expect } from 'vitest';
import {
  DEFAULT_FIT_ENTRY,
  getFitEntry,
  isValidFitEntry,
  transformCoordinates,
  getFitLayerStyle,
} from './fit';

describe('T3: Fit Adapter Contract (lib/fit.ts)', () => {
  it('returns default fit entry {x: 0, y: 0, scale: 1} for missing or empty data', () => {
    expect(getFitEntry('non_existent')).toEqual(DEFAULT_FIT_ENTRY);
    expect(getFitEntry('test', {})).toEqual(DEFAULT_FIT_ENTRY);
    expect(getFitEntry('test', null)).toEqual(DEFAULT_FIT_ENTRY);
    expect(getFitEntry('test', undefined)).toEqual(DEFAULT_FIT_ENTRY);
  });

  it('safely ignores invalid entries and returns default', () => {
    const invalidFixtures = {
      entry_str: { x: '10', y: 20, scale: 1 },
      entry_nan: { x: NaN, y: 20, scale: 1 },
      entry_neg_scale: { x: 0, y: 0, scale: -1 },
      entry_zero_scale: { x: 0, y: 0, scale: 0 },
      entry_missing_field: { x: 10, y: 20 },
      entry_null: null,
      entry_arr: [10, 20, 1],
    };

    expect(isValidFitEntry(invalidFixtures.entry_str)).toBe(false);
    expect(isValidFitEntry(invalidFixtures.entry_nan)).toBe(false);
    expect(isValidFitEntry(invalidFixtures.entry_neg_scale)).toBe(false);
    expect(isValidFitEntry(invalidFixtures.entry_zero_scale)).toBe(false);
    expect(isValidFitEntry(invalidFixtures.entry_missing_field)).toBe(false);

    expect(getFitEntry('entry_str', invalidFixtures)).toEqual(DEFAULT_FIT_ENTRY);
    expect(getFitEntry('entry_nan', invalidFixtures)).toEqual(DEFAULT_FIT_ENTRY);
    expect(getFitEntry('entry_neg_scale', invalidFixtures)).toEqual(DEFAULT_FIT_ENTRY);
    expect(getFitEntry('entry_zero_scale', invalidFixtures)).toEqual(DEFAULT_FIT_ENTRY);
    expect(getFitEntry('entry_missing_field', invalidFixtures)).toEqual(DEFAULT_FIT_ENTRY);
    expect(getFitEntry('entry_null', invalidFixtures)).toEqual(DEFAULT_FIT_ENTRY);
    expect(getFitEntry('entry_arr', invalidFixtures)).toEqual(DEFAULT_FIT_ENTRY);
  });

  it('correctly reads valid non-zero offsets and uniform scale', () => {
    const customFit = {
      M_A_TOP_ao_ngu_than: { x: 15, y: -20, scale: 1.05 },
      F_A_HEAD_conical_hat: { x: 0, y: 50, scale: 0.95 },
    };

    const entry1 = getFitEntry('M_A_TOP_ao_ngu_than', customFit);
    expect(entry1).toEqual({ x: 15, y: -20, scale: 1.05 });

    const entry2 = getFitEntry('F_A_HEAD_conical_hat', customFit);
    expect(entry2).toEqual({ x: 0, y: 50, scale: 0.95 });
  });

  it('transforms coordinates using x_out=x+scale*x_in and y_out=y+scale*y_in with top-left origin', () => {
    const fit = { x: 50, y: 100, scale: 1.5 };
    const pointIn = { x: 200, y: 400 };

    const pointOut = transformCoordinates(pointIn, fit);
    // x_out = 50 + 1.5 * 200 = 350
    // y_out = 100 + 1.5 * 400 = 700
    expect(pointOut).toEqual({ x: 350, y: 700 });
  });

  it('generates responsive layer CSS styles using percentage offsets and uniform scale', () => {
    const fit = { x: 108, y: 192, scale: 1.1 };
    const style = getFitLayerStyle(fit);

    // 108 / 1080 = 10%
    // 192 / 1920 = 10%
    expect(style.transform).toBe('translate(10%, 10%) scale(1.1)');
    expect(style.transformOrigin).toBe('top left');
    expect(style.position).toBe('absolute');
    expect(style.width).toBe('100%');
    expect(style.height).toBe('100%');
  });
});
