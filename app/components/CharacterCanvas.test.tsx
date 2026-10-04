import { describe, it, expect, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { CharacterCanvas } from "./CharacterCanvas";
import { loadAll } from "@/lib/data";

describe("T3: CharacterCanvas Layered Renderer", () => {
  beforeAll(() => {
    loadAll();
  });

  it("renders male base image with gender-specific path and z-0", () => {
    render(<CharacterCanvas gender="male" itemIds={[]} />);

    const baseImg = screen.getByRole("img", { name: /Hình mẫu nhân vật Nam/i });
    expect(baseImg).toBeInTheDocument();
    expect(baseImg).toHaveAttribute("src", "/assets/male/male_base.png");

    const bodyLayer = screen.getByTestId("layer-body");
    expect(bodyLayer).toHaveClass("z-0");
  });

  it("renders female base image with gender-specific path", () => {
    render(<CharacterCanvas gender="female" itemIds={[]} />);

    const baseImg = screen.getByRole("img", { name: /Hình mẫu nhân vật Nữ/i });
    expect(baseImg).toBeInTheDocument();
    expect(baseImg).toHaveAttribute("src", "/assets/female/female_base.png");
  });

  it("renders layers in strict logical order: body, shoes, bottom, top, neck, head", () => {
    // Equipping all slots for male:
    // top: M_A_TOP_ao_ngu_than
    // bottom: M_A_BOTTOM_white_silk_trousers
    // shoes: M_A_SHOES_cloth_shoes
    // neck: M_A_NECK_silver_necklace
    // head: M_A_HEAD_conical_hat
    const maleFullOutfit = [
      "M_A_TOP_ao_ngu_than",
      "M_A_BOTTOM_white_silk_trousers",
      "M_A_SHOES_cloth_shoes",
      "M_A_NECK_silver_necklace",
      "M_A_HEAD_conical_hat",
    ];

    render(<CharacterCanvas gender="male" itemIds={maleFullOutfit} />);

    const bodyLayer = screen.getByTestId("layer-body");
    const shoesLayer = screen.getByTestId("layer-shoes");
    const bottomLayer = screen.getByTestId("layer-bottom");
    const topLayer = screen.getByTestId("layer-top");
    const neckLayer = screen.getByTestId("layer-neck");
    const headLayer = screen.getByTestId("layer-head");

    // Check z-index progression matches layer order: body (0) < shoes (10) < bottom (20) < top (30) < neck (40) < head (50)
    expect(bodyLayer).toHaveClass("z-0");
    expect(shoesLayer).toHaveStyle({ zIndex: 10 });
    expect(bottomLayer).toHaveStyle({ zIndex: 20 });
    expect(topLayer).toHaveStyle({ zIndex: 30 });
    expect(neckLayer).toHaveStyle({ zIndex: 40 });
    expect(headLayer).toHaveStyle({ zIndex: 50 });

    // Verify correct item src attributes
    const topImg = screen.getByRole("img", { name: "Áo ngũ thân" });
    expect(topImg).toHaveAttribute("src", "/assets/male/M_A_TOP_ao_ngu_than.png");

    const bottomImg = screen.getByRole("img", { name: "Quần lụa trắng" });
    expect(bottomImg).toHaveAttribute("src", "/assets/male/M_A_BOTTOM_white_silk_trousers.png");

    const shoesImg = screen.getByRole("img", { name: "Giày vải đen đế trắng" });
    expect(shoesImg).toHaveAttribute("src", "/assets/male/M_A_SHOES_cloth_shoes.png");
  });

  it("applies fit offsets and scale to garment layers", () => {
    const customFit = {
      M_A_TOP_ao_ngu_than: { x: 54, y: 96, scale: 1.1 },
    };

    render(
      <CharacterCanvas
        gender="male"
        itemIds={["M_A_TOP_ao_ngu_than"]}
        fitData={customFit}
      />
    );

    const topLayer = screen.getByTestId("layer-top");
    // 54/1080 = 5%
    // 96/1920 = 5%
    expect(topLayer).toHaveStyle({
      transform: "translate(5%, 5%) scale(1.1)",
      transformOrigin: "top left",
    });
  });

  it("shows grey labeled fallback when an image fails to load without breaking other layers", () => {
    render(
      <CharacterCanvas
        gender="male"
        itemIds={["M_A_TOP_ao_ngu_than", "M_A_BOTTOM_white_silk_trousers"]}
      />
    );

    const topImg = screen.getByRole("img", { name: "Áo ngũ thân" });
    expect(topImg).toBeInTheDocument();

    // Trigger error on top image
    fireEvent.error(topImg);

    // Fallback appears for top layer
    const fallback = screen.getByTestId("fallback-top");
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent(/Lỗi ảnh: Áo ngũ thân/i);
    // Bounded positioning, not covering entire canvas
    expect(fallback.className).not.toContain("inset-0");
    expect(fallback).toHaveStyle({
      top: "38%",
      left: "50%",
      transform: "translateX(-50%)",
    });

    // Other layers remain intact and functional
    expect(screen.getByRole("img", { name: "Quần lụa trắng" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Hình mẫu nhân vật Nam/i })).toBeInTheDocument();
  });

  it("prevents a failed head image from obscuring lower layers (shoes, bottom, top, body)", () => {
    render(
      <CharacterCanvas
        gender="male"
        itemIds={[
          "M_A_HEAD_conical_hat",
          "M_A_TOP_ao_ngu_than",
          "M_A_BOTTOM_white_silk_trousers",
          "M_A_SHOES_cloth_shoes",
        ]}
      />
    );

    const headImg = screen.getByRole("img", { name: "Nón lá" });
    const topImg = screen.getByRole("img", { name: "Áo ngũ thân" });
    const bottomImg = screen.getByRole("img", { name: "Quần lụa trắng" });
    const shoesImg = screen.getByRole("img", { name: /Giày vải đen/i });
    const bodyImg = screen.getByRole("img", { name: /Hình mẫu nhân vật Nam/i });

    // Trigger image loading failure ONLY on head layer (zIndex 50)
    fireEvent.error(headImg);

    // Head fallback appears as bounded indicator
    const headFallback = screen.getByTestId("fallback-head");
    expect(headFallback).toBeInTheDocument();
    expect(headFallback).toHaveTextContent(/Lỗi ảnh: Nón lá/i);

    // Verify head fallback is bounded and not full-bleed inset-0
    expect(headFallback.className).not.toContain("inset-0");
    expect(headFallback).toHaveStyle({
      top: "6%",
      left: "50%",
      transform: "translateX(-50%)",
    });

    // Verify all lower layers remain intact, rendered as img elements, and have no fallback indicators
    expect(topImg).toBeInTheDocument();
    expect(bottomImg).toBeInTheDocument();
    expect(shoesImg).toBeInTheDocument();
    expect(bodyImg).toBeInTheDocument();

    expect(screen.queryByTestId("fallback-top")).not.toBeInTheDocument();
    expect(screen.queryByTestId("fallback-bottom")).not.toBeInTheDocument();
    expect(screen.queryByTestId("fallback-shoes")).not.toBeInTheDocument();
    expect(screen.queryByTestId("fallback-body")).not.toBeInTheDocument();

    // Verify layer order and zIndex are preserved
    expect(screen.getByTestId("layer-body")).toHaveClass("z-0");
    expect(screen.getByTestId("layer-shoes")).toHaveStyle({ zIndex: 10 });
    expect(screen.getByTestId("layer-bottom")).toHaveStyle({ zIndex: 20 });
    expect(screen.getByTestId("layer-top")).toHaveStyle({ zIndex: 30 });
    expect(screen.getByTestId("layer-head")).toHaveStyle({ zIndex: 50 });
  });

  it("animates inner visual element with garment-enter class while preserving outer fit layer transform", () => {
    const customFit = {
      M_A_TOP_ao_ngu_than: { x: 54, y: 96, scale: 1.15 },
    };

    render(
      <CharacterCanvas
        gender="male"
        itemIds={["M_A_TOP_ao_ngu_than"]}
        fitData={customFit}
      />
    );

    const outerLayer = screen.getByTestId("layer-top");
    // Outer fit layer preserves its exact transform and origin
    expect(outerLayer).toHaveStyle({
      transform: "translate(5%, 5%) scale(1.15)",
      transformOrigin: "top left",
    });

    // Inner element has garment-enter class for gentle entry motion
    const innerElement = screen.getByTestId("inner-top");
    expect(innerElement).toBeInTheDocument();
    expect(innerElement).toHaveClass("garment-enter");
  });

  it("avoids replaying entry animation for equipped garments when an unrelated item is changed", () => {
    const { rerender } = render(
      <CharacterCanvas
        gender="male"
        itemIds={["M_A_TOP_ao_ngu_than"]}
      />
    );

    const initialTopInner = screen.getByTestId("inner-top");
    expect(initialTopInner).toBeInTheDocument();

    // Re-render adding an unrelated item (shoes)
    rerender(
      <CharacterCanvas
        gender="male"
        itemIds={["M_A_TOP_ao_ngu_than", "M_A_SHOES_cloth_shoes"]}
      />
    );

    const updatedTopInner = screen.getByTestId("inner-top");
    const shoesInner = screen.getByTestId("inner-shoes");

    // The top inner element node is identical (not re-mounted/replayed)
    expect(updatedTopInner).toBe(initialTopInner);
    // Newly equipped shoes has garment-enter class
    expect(shoesInner).toHaveClass("garment-enter");
  });

  it("verifies all 22 expected PNG files exist in public/assets/", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const publicAssetsDir = path.resolve(process.cwd(), "public", "assets");

    expect(fs.existsSync(path.join(publicAssetsDir, "male", "male_base.png"))).toBe(true);
    expect(fs.existsSync(path.join(publicAssetsDir, "female", "female_base.png"))).toBe(true);

    const itemsPath = path.resolve(process.cwd(), "data", "items.json");
    const items = JSON.parse(fs.readFileSync(itemsPath, "utf-8"));

    expect(items).toHaveLength(20);
    items.forEach((item: any) => {
      const filePath = path.join(publicAssetsDir, item.gender, item.image_file);
      expect(fs.existsSync(filePath), `Expected ${filePath} to exist`).toBe(true);
    });
  });
});
