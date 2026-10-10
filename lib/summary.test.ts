import { describe, it, expect, beforeAll } from 'vitest';
import { assembleOutfitSummary } from './summary';
import { loadAll, getPreset, getScene } from './data';
import { Outfit } from './types';

describe('P6 - T3: Summary assembly (lib/summary.ts)', () => {
  beforeAll(() => {
    loadAll();
  });

  it('uses preset cultural summary when preset is provided', () => {
    const rx01Preset = getPreset('rx-01-male')!;
    const outfit: Outfit = {
      gender: 'male',
      itemIds: rx01Preset.item_ids,
    };
    const tetScene = getScene('tet');

    const summary = assembleOutfitSummary(outfit, tetScene, rx01Preset);
    expect(summary).toContain('Bản phối cách tân đột phá');
    expect(summary).toContain('Tết');
  });

  it('assembles cultural fragments for custom outfits without preset', () => {
    const customOutfit: Outfit = {
      gender: 'female',
      itemIds: [
        'F_A_TOP_ao_ngu_than',
        'F_MIX_BOTTOM_quan_hien_dai',
        'F_COMMON_SHOES_giay_vai_den',
        'F_COMMON_HEAD_tram_cai',
      ],
    };
    const kyYeuScene = getScene('ky-yeu');

    const summary = assembleOutfitSummary(customOutfit, kyYeuScene);
    expect(summary).toContain('Cách tân nhẹ');
    expect(summary).toContain('Áo ngũ thân');
    expect(summary).toContain('Quần ống rộng màu be');
    expect(summary).toContain('Giày vải đen');
    expect(summary).toContain('Trâm cài bạc');
    expect(summary).toContain('Kỷ yếu');
  });

  it('includes cultural warning notes when evaluation detects warnings', () => {
    // Áo tấc + nón lá triggers R_HAT_CEREMONIAL warning
    const warnOutfit: Outfit = {
      gender: 'male',
      itemIds: ['M_C_TOP_ao_tac', 'M_COMMON_HEAD_non_la'],
    };

    const summary = assembleOutfitSummary(warnOutfit);
    expect(summary).toContain('Lưu ý văn hóa');
  });

  it('generates rich, specific cultural commentary for all scenes with presets', () => {
    const rx01Female = getPreset('rx-01-female')!;
    const kyYeuScene = getScene('ky-yeu')!;
    const kyYeuSummary = assembleOutfitSummary(
      { gender: 'female', itemIds: rx01Female.item_ids },
      kyYeuScene,
      rx01Female
    );
    expect(kyYeuSummary).toContain('Kỷ Yếu Quốc Học');
    expect(kyYeuSummary).toContain('Áo ngũ thân');

    const setBFemale = getPreset('set-b-female')!;
    const doiThuongScene = getScene('doi-thuong')!;
    const doiThuongSummary = assembleOutfitSummary(
      { gender: 'female', itemIds: setBFemale.item_ids },
      doiThuongScene,
      setBFemale
    );
    expect(doiThuongSummary).toContain('Phố Cổ');
    expect(doiThuongSummary).toContain('Giao lĩnh');

    const rx02Female = getPreset('rx-02-female')!;
    const leHoiScene = getScene('le-hoi')!;
    const leHoiSummary = assembleOutfitSummary(
      { gender: 'female', itemIds: rx02Female.item_ids },
      leHoiScene,
      rx02Female
    );
    expect(leHoiSummary).toContain('Lễ Hội Đình Làng');
    expect(leHoiSummary).toContain('sneaker');
  });
});
