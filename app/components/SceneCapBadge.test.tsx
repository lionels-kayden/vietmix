import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SceneCapBadge } from "./SceneCapBadge";
import { loadAll, getScene } from "@/lib/data";
import { Outfit } from "@/lib/types";

describe("T3: SceneCapBadge Component", () => {
  beforeAll(() => {
    loadAll();
  });

  it("renders within-cap positive indicator when modern count <= scene cap", () => {
    const tetScene = getScene("tet")!; // cap = 1
    const outfitWithinCap: Outfit = {
      gender: "female",
      itemIds: ["F_A_TOP_ao_ngu_than", "F_MIX_BOTTOM_quan_hien_dai"], // 1 modern item
    };

    render(<SceneCapBadge scene={tetScene} outfit={outfitWithinCap} />);

    const badge = screen.getByTestId("scene-cap-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("data-status", "within-cap");
    expect(badge).toHaveTextContent(/Hòa hợp bối cảnh Tết/i);
    expect(badge).toHaveTextContent(/Đang dùng 1\/1 món hiện đại/i);
  });

  it("renders non-binding cultural suggestion when modern count > scene cap", () => {
    const tetScene = getScene("tet")!; // cap = 1
    const outfitExceedingCap: Outfit = {
      gender: "female",
      itemIds: [
        "F_A_TOP_ao_ngu_than",
        "F_MIX_BOTTOM_quan_hien_dai",
        "F_MIX_SHOES_giay_sneaker",
      ], // 2 modern items in Tet (cap 1)
    };

    render(<SceneCapBadge scene={tetScene} outfit={outfitExceedingCap} />);

    const badge = screen.getByTestId("scene-cap-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("data-status", "exceeding-cap");
    expect(badge).toHaveTextContent(/Gợi ý văn hóa cho bối cảnh Tết/i);
    expect(badge).toHaveTextContent(/Khuyên dùng: max 1 món/i);
    // Explicitly states suggestion is non-binding
    expect(badge).toHaveTextContent(/Gợi ý này không bắt buộc/i);
  });
});
