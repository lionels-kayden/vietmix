import { describe, it, expect, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { RemixSlider } from "./RemixSlider";
import { loadAll, getScene } from "@/lib/data";
import { Outfit } from "@/lib/types";

describe("T2: RemixSlider Component", () => {
  beforeAll(() => {
    loadAll();
  });

  it("renders level 0 (Cổ điển) for traditional outfit with 0 modern items", () => {
    const outfit: Outfit = {
      gender: "male",
      itemIds: ["M_A_TOP_ao_ngu_than", "M_COMMON_BOTTOM_quan_lua_trang"],
    };
    const scene = getScene("tet");

    render(<RemixSlider outfit={outfit} scene={scene} />);

    expect(screen.getByTestId("remix-slider")).toBeInTheDocument();
    expect(screen.getByTestId("remix-count-badge")).toHaveTextContent("0 món hiện đại");
    expect(screen.getByTestId("remix-level-badge")).toHaveTextContent("Mốc 0: Cổ điển");

    const track = screen.getByTestId("remix-slider-track");
    expect(track).toHaveStyle({ width: "0%" });

    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "0");
  });

  it("renders level 1 (Cách tân nhẹ) for outfit with 1 modern item", () => {
    const outfit: Outfit = {
      gender: "male",
      itemIds: ["M_A_TOP_ao_ngu_than", "M_MIX_BOTTOM_quan_hien_dai"],
    };
    const scene = getScene("tet");

    render(<RemixSlider outfit={outfit} scene={scene} />);

    expect(screen.getByTestId("remix-count-badge")).toHaveTextContent("1 món hiện đại");
    expect(screen.getByTestId("remix-level-badge")).toHaveTextContent("Mốc 1: Cách tân nhẹ");

    const track = screen.getByTestId("remix-slider-track");
    expect(track).toHaveStyle({ width: "50%" });

    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "1");
  });

  it("renders level 2 (Đột phá) for outfit with 2 modern items", () => {
    const outfit: Outfit = {
      gender: "male",
      itemIds: [
        "M_A_TOP_ao_ngu_than",
        "M_MIX_BOTTOM_quan_hien_dai",
        "M_MIX_SHOES_giay_sneaker",
      ],
    };
    const scene = getScene("ky-yeu");

    render(<RemixSlider outfit={outfit} scene={scene} />);

    expect(screen.getByTestId("remix-count-badge")).toHaveTextContent("2 món hiện đại");
    expect(screen.getByTestId("remix-level-badge")).toHaveTextContent("Mốc 2: Đột phá");

    const track = screen.getByTestId("remix-slider-track");
    expect(track).toHaveStyle({ width: "100%" });

    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "2");
  });

  it("displays scene cap marker on corresponding step node", () => {
    const outfit: Outfit = { gender: "male", itemIds: [] };
    const tetScene = getScene("tet"); // cap = 1

    render(<RemixSlider outfit={outfit} scene={tetScene} />);

    expect(screen.getByTestId("scene-cap-marker-1")).toBeInTheDocument();
    expect(screen.queryByTestId("scene-cap-marker-2")).not.toBeInTheDocument();
  });

  it("allows inspecting different steps by clicking on step buttons", () => {
    const outfit: Outfit = { gender: "male", itemIds: [] };
    render(<RemixSlider outfit={outfit} />);

    // Initially shows active step (0)
    expect(screen.getByTestId("remix-description-card")).toHaveTextContent("Mốc 0: Cổ điển");

    // Click step 2
    fireEvent.click(screen.getByTestId("remix-step-2"));
    expect(screen.getByTestId("remix-description-card")).toHaveTextContent("Mốc 2: Đột phá");
  });
});
