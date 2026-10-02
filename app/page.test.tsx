import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Home, { loadData } from "./page";

describe("Home Page", () => {
  it("loads all data files correctly on server side", () => {
    const data = loadData();
    expect(data).toHaveProperty("items");
    expect(data).toHaveProperty("stories");
    expect(data).toHaveProperty("rules");
    expect(data).toHaveProperty("anchors");
    expect(data).toHaveProperty("fit");
    expect(data).toHaveProperty("fit_defaults");
    expect(data).toHaveProperty("manifest");
    expect(data).toHaveProperty("scenes");
  });

  it("renders the page without throwing and displays title and status line", () => {
    expect(() => {
      render(<Home />);
    }).not.toThrow();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Việt phục Remix"
    );
    expect(screen.getByText(/Trạng thái:/i)).toBeInTheDocument();
    expect(screen.getByText(/4 scenes/i)).toBeInTheDocument();
  });
});
