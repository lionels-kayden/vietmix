import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Wardrobe } from "./components/Wardrobe";
import { PresetsSelector } from "./components/PresetsSelector";
import { SceneSelector } from "./components/SceneSelector";
import { RemixSlider } from "./components/RemixSlider";
import { ShareModal } from "./components/ShareModal";
import { BlockFeedbackModal } from "./components/BlockFeedbackModal";
import ErrorPage from "./error";
import NotFoundPage from "./not-found";

describe("Phase 9 - Accessibility (A11y) & Touch Targets Audit", () => {
  it("Wardrobe component ensures >=44px tap targets and proper tablist roles", () => {
    render(
      <Wardrobe
        gender="male"
        itemIds={[]}
        onEquip={() => {}}
        onRemove={() => {}}
        onClear={() => {}}
      />
    );

    const tablist = screen.getByRole("tablist");
    expect(tablist).toHaveAttribute("aria-label", "Phân loại tủ đồ");

    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBe(4);
    tabs.forEach((tab) => {
      expect(tab.className).toContain("min-h-[44px]");
      expect(tab).toHaveAttribute("aria-selected");
    });
  });

  it("PresetsSelector provides accessible group and touch-friendly preset buttons", () => {
    render(
      <PresetsSelector
        gender="female"
        onSelectPreset={() => {}}
      />
    );

    const group = screen.getByRole("group", { name: /Danh sách các bộ phối mẫu/i });
    expect(group).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn.className).toContain("min-h-[56px]");
      expect(btn).toHaveAttribute("aria-pressed");
      expect(btn.className).toContain("focus-visible:outline");
    });
  });

  it("SceneSelector provides accessible scene buttons with >=44px touch targets", () => {
    render(
      <SceneSelector
        selectedSceneId="tet"
        onSelectScene={() => {}}
      />
    );

    const sceneButtons = screen.getAllByRole("button");
    expect(sceneButtons.length).toBe(4);
    sceneButtons.forEach((btn) => {
      expect(btn.className).toContain("min-h-[52px]");
      expect(btn).toHaveAttribute("aria-pressed");
    });
  });

  it("RemixSlider provides accessible step nodes, labels, and keyboard focus", () => {
    render(
      <RemixSlider
        outfit={{
          gender: "male",
          itemIds: ["M_A_TOP_ao_ngu_than", "M_MIX_BOTTOM_quan_hien_dai"],
        }}
      />
    );

    const sliderContainer = screen.getByTestId("remix-slider");
    expect(sliderContainer).toBeInTheDocument();

    const stepButtons = [0, 1, 2].map((lvl) =>
      screen.getByTestId(`remix-step-${lvl}`)
    );
    stepButtons.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-label");
      expect(btn.className).toContain("focus-visible:outline");
    });
  });

  it("ShareModal satisfies WCAG modal guidelines with touch-friendly actions", () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        title="Áo ngũ thân"
        caption="Caption mẫu"
        url="https://vietmix.vercel.app"
        onNativeShare={() => {}}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "share-modal-title");

    const closeBtn = screen.getByTestId("btn-close-share");
    expect(closeBtn.className).toContain("min-h-[44px]");
    expect(closeBtn.className).toContain("min-w-[44px]");

    const copyBtn = screen.getByTestId("btn-copy-caption");
    expect(copyBtn.className).toContain("min-h-[44px]");
  });

  it("BlockFeedbackModal provides accessible alertdialog with >=44px return button", () => {
    render(
      <BlockFeedbackModal
        onClose={() => {}}
        blockHits={[
          {
            ruleId: "R_SKIRT_NGU_THAN",
            level: "block",
            message_key: "skirt_ngu_than",
            message_vi: "Áo ngũ thân không kết hợp cùng váy dài",
            itemIds: ["F_A_TOP_ao_ngu_than", "F_B_BOTTOM_vay_dai"],
          },
        ]}
      />
    );

    const alertdialog = screen.getByRole("alertdialog");
    expect(alertdialog).toHaveAttribute("aria-modal", "true");

    const returnBtn = screen.getByTestId("btn-close-block-modal");
    expect(returnBtn.className).toContain("min-h-[44px]");
  });

  it("ErrorPage and NotFoundPage render touch-friendly action controls", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorPage error={new Error("Test error")} reset={() => {}} />);
    const tryAgainBtn = screen.getByRole("button", { name: "Thử lại" });
    expect(tryAgainBtn.className).toContain("min-h-[44px]");
    errorSpy.mockRestore();

    render(<NotFoundPage />);
    const dressUpLink = screen.getByRole("link", { name: "Vào phòng phối đồ" });
    expect(dressUpLink.className).toContain("min-h-[44px]");
  });
});
