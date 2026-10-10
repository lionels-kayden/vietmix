import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Wardrobe } from "./Wardrobe";
import { loadAll } from "@/lib/data";

describe("T4: Wardrobe Tabs and Item Controls", () => {
  beforeAll(() => {
    loadAll();
  });

  it("renders all four Vietnamese tabs: Áo, Quần/Váy, Giày, Phụ kiện", () => {
    render(
      <Wardrobe
        gender="female"
        itemIds={[]}
        onEquip={vi.fn()}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByRole("tab", { name: "Áo" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Quần/Váy" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Giày" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Phụ kiện" })).toBeInTheDocument();
  });

  it("filters items according to the active tab", () => {
    render(
      <Wardrobe
        gender="female"
        itemIds={[]}
        onEquip={vi.fn()}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    );

    // Initial tab is "Áo" (tops)
    expect(screen.getByText("Áo ngũ thân")).toBeInTheDocument();
    expect(screen.getByText("Áo giao lĩnh")).toBeInTheDocument();
    expect(screen.getByText("Áo nhật bình")).toBeInTheDocument();
    expect(screen.queryByText("Quần lụa trắng")).not.toBeInTheDocument();
    expect(screen.queryByText("Giày vải đen đế trắng")).not.toBeInTheDocument();

    // Click tab "Quần/Váy" (bottoms)
    fireEvent.click(screen.getByRole("tab", { name: "Quần/Váy" }));
    expect(screen.getByText("Quần lụa trắng")).toBeInTheDocument();
    expect(screen.getByText("Váy dài đen")).toBeInTheDocument();
    expect(screen.getByText("Quần ống rộng màu be")).toBeInTheDocument();
    expect(screen.queryByText("Áo ngũ thân")).not.toBeInTheDocument();

    // Click tab "Giày" (shoes)
    fireEvent.click(screen.getByRole("tab", { name: "Giày" }));
    expect(screen.getByText("Giày vải đen đế trắng")).toBeInTheDocument();
    expect(screen.getByText("Giày sneaker trắng")).toBeInTheDocument();
    expect(screen.queryByText("Quần lụa trắng")).not.toBeInTheDocument();

    // Click tab "Phụ kiện" (accessories: head)
    fireEvent.click(screen.getByRole("tab", { name: "Phụ kiện" }));
    expect(screen.getByText("Nón lá")).toBeInTheDocument();
    expect(screen.getByText("Trâm cài bạc")).toBeInTheDocument();
    expect(screen.queryByText("Vòng cổ bạc")).not.toBeInTheDocument();
    expect(screen.queryByText("Giày vải đen đế trắng")).not.toBeInTheDocument();
  });

  it("triggers onEquip, onRemove, and onClear callbacks", () => {
    const handleEquip = vi.fn();
    const handleRemove = vi.fn();
    const handleClear = vi.fn();

    const { rerender } = render(
      <Wardrobe
        gender="male"
        itemIds={[]}
        onEquip={handleEquip}
        onRemove={handleRemove}
        onClear={handleClear}
      />
    );

    // Click Mặc on Áo tấc
    const equipBtn = screen.getByRole("button", { name: /Mặc Áo tấc/i });
    fireEvent.click(equipBtn);
    expect(handleEquip).toHaveBeenCalledWith("M_C_TOP_ao_tac");

    // Re-render with Áo tấc equipped
    rerender(
      <Wardrobe
        gender="male"
        itemIds={["M_C_TOP_ao_tac"]}
        onEquip={handleEquip}
        onRemove={handleRemove}
        onClear={handleClear}
      />
    );

    // Badge "Đang mặc" is visible
    expect(screen.getByTestId("badge-worn-M_C_TOP_ao_tac")).toHaveTextContent("Đang mặc");

    // Click Cởi ra
    const removeBtn = screen.getByRole("button", { name: /Cởi Áo tấc/i });
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledWith("M_C_TOP_ao_tac");

    // Click Cởi hết
    const clearBtn = screen.getByRole("button", { name: /Cởi tất cả trang phục/i });
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalled();
  });
});
