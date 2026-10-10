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

  it("renders layers in strict logical order: body, shoes, bottom, top, head", () => {
    // Equipping all slots for male:
    // top: M_A_TOP_ao_ngu_than
    // bottom: M_COMMON_BOTTOM_quan_lua_trang
    // shoes: M_COMMON_SHOES_giay_vai_den
    // head: M_COMMON_HEAD_non_la
    const maleFullOutfit = [
      "M_A_TOP_ao_ngu_than",
      "M_COMMON_BOTTOM_quan_lua_trang",
      "M_COMMON_SHOES_giay_vai_den",
      "M_COMMON_HEAD_non_la",
    ];

    render(<CharacterCanvas gender="male" itemIds={maleFullOutfit} />);

    const bodyLayer = screen.getByTestId("layer-body");
    const shoesLayer = screen.getByTestId("layer-shoes");
    const bottomLayer = screen.getByTestId("layer-bottom");
    const topLayer = screen.getByTestId("layer-top");
    const headLayer = screen.getByTestId("layer-head");

    // Check z-index progression matches layer order: body (0) < shoes (10) < bottom (20) < top (30) < head (50)
    expect(bodyLayer).toHaveClass("z-0");
    expect(shoesLayer).toHaveStyle({ zIndex: 10 });
    expect(bottomLayer).toHaveStyle({ zIndex: 20 });
    expect(topLayer).toHaveStyle({ zIndex: 30 });
    expect(headLayer).toHaveStyle({ zIndex: 50 });

    // Verify correct item src attributes
    const topImg = screen.getByRole("img", { name: "Áo ngũ thân" });
    expect(topImg).toHaveAttribute("src", "/assets/male/M_A_TOP_ao_ngu_than.png");

    const bottomImg = screen.getByRole("img", { name: "Quần lụa trắng" });
    expect(bottomImg).toHaveAttribute("src", "/assets/male/M_COMMON_BOTTOM_quan_lua_trang.png");

    const shoesImg = screen.getByRole("img", { name: "Giày vải đen đế trắng" });
    expect(shoesImg).toHaveAttribute("src", "/assets/male/M_COMMON_SHOES_giay_vai_den.png");
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
        itemIds={["M_A_TOP_ao_ngu_than", "M_COMMON_BOTTOM_quan_lua_trang"]}
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
          "M_COMMON_HEAD_non_la",
          "M_A_TOP_ao_ngu_than",
          "M_COMMON_BOTTOM_quan_lua_trang",
          "M_COMMON_SHOES_giay_vai_den",
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
        itemIds={["M_A_TOP_ao_ngu_than", "M_COMMON_SHOES_giay_vai_den"]}
      />
    );

    const updatedTopInner = screen.getByTestId("inner-top");
    const shoesInner = screen.getByTestId("inner-shoes");

    // The top inner element node is identical (not re-mounted/replayed)
    expect(updatedTopInner).toBe(initialTopInner);
    // Newly equipped shoes has garment-enter class
    expect(shoesInner).toHaveClass("garment-enter");
  });

  it("verifies all expected PNG files exist in public/assets/", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const publicAssetsDir = path.resolve(process.cwd(), "public", "assets");

    expect(fs.existsSync(path.join(publicAssetsDir, "male", "male_base.png"))).toBe(true);
    expect(fs.existsSync(path.join(publicAssetsDir, "female", "female_base.png"))).toBe(true);

    const itemsPath = path.resolve(process.cwd(), "data", "items.json");
    const items = JSON.parse(fs.readFileSync(itemsPath, "utf-8"));

    expect(items).toHaveLength(18);
    items.forEach((item: any) => {
      const filePath = path.join(publicAssetsDir, item.gender, item.image_file);
      expect(fs.existsSync(filePath), `Expected ${filePath} to exist`).toBe(true);
    });
  });

  it("renders scene background at z-0 and character within 85% scale bottom container", () => {
    render(<CharacterCanvas gender="female" itemIds={[]} sceneId="tet" />);

    // Scene layer exists and renders tet.jpg at z-0
    const sceneLayer = screen.getByTestId("layer-scene");
    expect(sceneLayer).toHaveClass("z-0");
    const sceneImg = screen.getByRole("img", { name: "Bối cảnh tet" });
    expect(sceneImg).toHaveAttribute("src", "/assets/scenes/tet.jpg");

    // Character container has 85% scale and bottom-center anchoring
    const characterContainer = screen.getByTestId("character-container");
    expect(characterContainer).toHaveClass("w-[85%]");
    expect(characterContainer).toHaveClass("h-[85%]");
    expect(characterContainer).toHaveClass("bottom-0");
  });

  it("handles broken scene background gracefully without affecting character rendering", () => {
    render(<CharacterCanvas gender="male" itemIds={[]} sceneId="ky-yeu" />);

    const sceneImg = screen.getByRole("img", { name: "Bối cảnh ky-yeu" });
    fireEvent.error(sceneImg);

    expect(screen.getByTestId("fallback-scene")).toHaveTextContent(/Lỗi ảnh bối cảnh: ky-yeu/i);
    expect(screen.getByRole("img", { name: /Hình mẫu nhân vật Nam/i })).toBeInTheDocument();
  });

  it("dynamically resolves Giao Linh variant: in_skirt when paired with black skirt, full robe when paired with pants", () => {
    // 1. Paired with skirt (F_B_BOTTOM_vay_dai) -> uses shortened/in_skirt variant
    const { unmount } = render(
      <CharacterCanvas
        gender="female"
        itemIds={["F_B_TOP_ao_giao_linh", "F_B_BOTTOM_vay_dai"]}
      />
    );
    const topImgWithSkirt = screen.getByRole("img", { name: "Áo giao lĩnh" });
    expect(topImgWithSkirt).toHaveAttribute(
      "src",
      "/assets/female/F_B_TOP_ao_giao_linh_in_skirt.png"
    );
    unmount();

    // 2. Paired with pants (F_COMMON_BOTTOM_quan_lua_trang) -> uses full loose robe variant
    render(
      <CharacterCanvas
        gender="female"
        itemIds={["F_B_TOP_ao_giao_linh", "F_COMMON_BOTTOM_quan_lua_trang"]}
      />
    );
    const topImgWithPants = screen.getByRole("img", { name: "Áo giao lĩnh" });
    expect(topImgWithPants).toHaveAttribute(
      "src",
      "/assets/female/F_B_TOP_ao_giao_linh.png"
    );
  });
});
