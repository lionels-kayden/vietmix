import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PresetsSelector } from './PresetsSelector';
import { loadAll, presetsByGender } from '@/lib/data';

describe('T5: PresetsSelector component (app/components/PresetsSelector.tsx)', () => {
  beforeAll(() => {
    loadAll();
  });

  it('renders all 5 presets for male character with proper accessibility attributes', () => {
    const handleSelect = vi.fn();
    render(
      <PresetsSelector
        gender="male"
        activePresetId={undefined}
        onSelectPreset={handleSelect}
      />
    );

    const heading = screen.getByRole('heading', { name: /Gợi ý phối sẵn/i });
    expect(heading).toBeInTheDocument();

    const malePresets = presetsByGender('male');
    expect(malePresets).toHaveLength(5);

    for (const preset of malePresets) {
      const button = screen.getByTestId(`preset-button-${preset.id}`);
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveTextContent(preset.name_vi);
    }

    // Active badge should not exist when activePresetId is undefined
    expect(screen.queryByTestId('active-preset-badge')).not.toBeInTheDocument();
  });

  it('renders all 5 presets for female character including Áo nhật bình', () => {
    const handleSelect = vi.fn();
    render(
      <PresetsSelector
        gender="female"
        activePresetId="set-c-female"
        onSelectPreset={handleSelect}
      />
    );

    expect(screen.getByTestId('preset-button-set-c-female')).toHaveTextContent(/Set C - Áo nhật bình/i);

    const activeButton = screen.getByTestId('preset-button-set-c-female');
    expect(activeButton).toHaveAttribute('aria-pressed', 'true');

    const activeBadge = screen.getByTestId('active-preset-badge');
    expect(activeBadge).toHaveTextContent('Đang áp dụng: Set C - Áo nhật bình');
  });

  it('calls onSelectPreset with the clicked preset object', () => {
    const handleSelect = vi.fn();
    render(
      <PresetsSelector
        gender="male"
        activePresetId={undefined}
        onSelectPreset={handleSelect}
      />
    );

    const rx01Btn = screen.getByTestId('preset-button-rx-01-male');
    fireEvent.click(rx01Btn);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'rx-01-male',
        name_vi: 'RX-01 - Ngũ thân hiện đại',
        gender: 'male',
      })
    );
  });
});
