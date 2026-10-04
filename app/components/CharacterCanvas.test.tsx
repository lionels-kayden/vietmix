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

    // Other layers remain intact and functional
    expect(screen.getByRole("img", { name: "Quần lụa trắng" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Hình mẫu nhân vật Nam/i })).toBeInTheDocument();
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
