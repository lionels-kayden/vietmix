import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SceneSelector } from "./SceneSelector";
import { loadAll } from "@/lib/data";

describe("T1: SceneSelector Component", () => {
  beforeAll(() => {
    loadAll();
  });

  it("renders all 4 culture scenes with cap badges and accessibility attributes", () => {
    const handleSelect = vi.fn();
    render(<SceneSelector selectedSceneId="tet" onSelectScene={handleSelect} />);

    expect(screen.getByTestId("scene-selector")).toBeInTheDocument();

    // 4 scenes must be present
    expect(screen.getByTestId("scene-btn-tet")).toBeInTheDocument();
    expect(screen.getByTestId("scene-btn-le-hoi")).toBeInTheDocument();
    expect(screen.getByTestId("scene-btn-ky-yeu")).toBeInTheDocument();
    expect(screen.getByTestId("scene-btn-doi-thuong")).toBeInTheDocument();

    // Tết is initially selected
    const tetBtn = screen.getByTestId("scene-btn-tet");
    expect(tetBtn).toHaveAttribute("aria-pressed", "true");

    // Lễ hội is not selected
    const leHoiBtn = screen.getByTestId("scene-btn-le-hoi");
    expect(leHoiBtn).toHaveAttribute("aria-pressed", "false");

    // Caps are rendered
    expect(screen.getByTestId("scene-cap-tet")).toHaveTextContent("Cap: 1");
    expect(screen.getByTestId("scene-cap-le-hoi")).toHaveTextContent("Cap: 1");
    expect(screen.getByTestId("scene-cap-ky-yeu")).toHaveTextContent("Cap: 2");
    expect(screen.getByTestId("scene-cap-doi-thuong")).toHaveTextContent("Cap: 2");
  });

  it("triggers onSelectScene callback when clicking a scene button", () => {
    const handleSelect = vi.fn();
    render(<SceneSelector selectedSceneId="tet" onSelectScene={handleSelect} />);

    const kyYeuBtn = screen.getByTestId("scene-btn-ky-yeu");
    fireEvent.click(kyYeuBtn);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith("ky-yeu");
  });
});
