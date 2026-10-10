import { describe, it, expect, vi, beforeAll } from 'vitest';
import { composeOutfitCanvas, downloadCanvasAsPng, exportOutfitImage } from './exportCanvas';
import { loadAll } from './data';

describe('P7 - T1 & T2: Canvas composition at 1080x1350 and PNG export (lib/exportCanvas.ts)', () => {
  beforeAll(() => {
    loadAll();

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 100 }),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
    }) as any;

    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mock');
  });

  it('creates canvas with exact dimensions 1080x1350', async () => {
    const canvas = await composeOutfitCanvas({
      gender: 'male',
      itemIds: ['M_A_TOP_ao_ngu_than'],
      sceneId: 'tet',
      summaryText: 'Tết Hoàng Cung truyền thống.',
      imageLoader: async () => null,
    });

    expect(canvas).toBeDefined();
    expect(canvas?.width).toBe(1080);
    expect(canvas?.height).toBe(1350);
  });

  it('downloads canvas as PNG via temporary anchor element', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;

    // Spy on document.body.appendChild
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    const result = downloadCanvasAsPng(canvas, 'test-outfit.png');
    expect(result).toBe(true);
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
  });

  it('handles image export end-to-end', async () => {
    const result = await exportOutfitImage({
      gender: 'female',
      itemIds: ['F_C_TOP_ao_nhat_binh'],
      sceneId: 'ky-yeu',
      summaryText: 'Kỷ yếu học đường.',
      imageLoader: async () => null,
    });

    expect(result).toBe(true);
  });
});
