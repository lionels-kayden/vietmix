import { describe, it, expect, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import DressUpPage from "./page";
import { loadAll } from "@/lib/data";

describe("Dress-up entry route and outfit state (T1 & T2 & T4)", () => {
  beforeAll(() => {
    loadAll();
  });

  it("renders character-choice heading and controls on initial load", () => {
    render(<DressUpPage />);

    const heading = screen.getByRole("heading", { name: /Chọn nhân vật/i });
    expect(heading).toBeInTheDocument();

    const maleButton = screen.getByRole("button", { name: /Chọn nhân vật Nam/i });
    const femaleButton = screen.getByRole("button", { name: /Chọn nhân vật Nữ/i });

    expect(maleButton).toBeInTheDocument();
    expect(femaleButton).toBeInTheDocument();

    const backLink = screen.getByRole("link", { name: /Quay lại trang chủ/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("handles tab filtering, equipping, replacing same slot, and switching gender", () => {
    render(<DressUpPage />);

    // 1. Choose Male character
    const maleButton = screen.getByRole("button", { name: /Chọn nhân vật Nam/i });
    fireEvent.click(maleButton);

    // Enters dressing step
    expect(screen.getByTestId("selected-character")).toHaveTextContent("Nam");
    expect(screen.getByTestId("dressing-area")).toBeInTheDocument();

    // Initial tab is Áo: male items are shown
    expect(screen.getByText("Áo tấc")).toBeInTheDocument();
    expect(screen.getByText("Áo ngũ thân")).toBeInTheDocument();
    expect(screen.queryByText("Áo nhật bình")).not.toBeInTheDocument();

    // Equip Áo tấc
    const equipTacBtn = screen.getByRole("button", { name: /Mặc Áo tấc/i });
    fireEvent.click(equipTacBtn);

    expect(screen.getByText(/Đang mặc: 1 món/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cởi Áo tấc/i })).toBeInTheDocument();

    // Equip Áo ngũ thân: replaces Áo tấc in the same slot
    const equipNguThanBtn = screen.getByRole("button", { name: /Mặc Áo ngũ thân/i });
    fireEvent.click(equipNguThanBtn);

    expect(screen.getByText(/Đang mặc: 1 món/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cởi Áo ngũ thân/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mặc Áo tấc/i })).toBeInTheDocument();

    // Switch to tab Quần/Váy
    fireEvent.click(screen.getByRole("tab", { name: "Quần/Váy" }));
    expect(screen.getByText("Quần lụa trắng")).toBeInTheDocument();
    const equipQuanBtn = screen.getByRole("button", { name: /Mặc Quần lụa trắng/i });
    fireEvent.click(equipQuanBtn);

    expect(screen.getByText(/Đang mặc: 2 món/i)).toBeInTheDocument();

    // 2. Change character to Female
    const changeToFemaleBtn = screen.getByRole("button", { name: /Đổi sang nhân vật Nữ/i });
    fireEvent.click(changeToFemaleBtn);

    expect(screen.getByTestId("selected-character")).toHaveTextContent("Nữ");
    // Worn items are cleared on gender switch
    expect(screen.getByText(/Đang mặc: 0 món/i)).toBeInTheDocument();

    // Catalog now shows female items for Quần/Váy tab
    expect(screen.getByText("Váy dài đen")).toBeInTheDocument();

    // Switch to tab Áo to verify female top Áo nhật bình is shown and Áo tấc is gone
    fireEvent.click(screen.getByRole("tab", { name: "Áo" }));
    expect(screen.getByText("Áo nhật bình")).toBeInTheDocument();
    expect(screen.queryByText("Áo tấc")).not.toBeInTheDocument();
  });

  it("demonstrates hat-to-hairpin exclusive replacement and independent necklace in Phụ kiện tab", () => {
    render(<DressUpPage />);

    // Select Female
    const femaleButton = screen.getByRole("button", { name: /Chọn nhân vật Nữ/i });
    fireEvent.click(femaleButton);

    // Click tab Phụ kiện
    const accessoryTab = screen.getByRole("tab", { name: "Phụ kiện" });
    fireEvent.click(accessoryTab);

    // Equip Nón lá (head slot)
    const equipHatBtn = screen.getByRole("button", { name: /Mặc Nón lá/i });
    fireEvent.click(equipHatBtn);
    expect(screen.getByText(/Đang mặc: 1 món/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cởi Nón lá/i })).toBeInTheDocument();

    // Equip Trâm cài bạc (also head slot): replaces Nón lá
    const equipPinBtn = screen.getByRole("button", { name: /Mặc Trâm cài bạc/i });
    fireEvent.click(equipPinBtn);

    expect(screen.getByText(/Đang mặc: 1 món/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cởi Trâm cài bạc/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mặc Nón lá/i })).toBeInTheDocument();

    // Equip Vòng cổ bạc (neck slot): worn concurrently with Trâm cài bạc (independent slot)
    const equipNecklaceBtn = screen.getByRole("button", { name: /Mặc Vòng cổ bạc/i });
    fireEvent.click(equipNecklaceBtn);

    expect(screen.getByText(/Đang mặc: 2 món/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cởi Trâm cài bạc/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cởi Vòng cổ bạc/i })).toBeInTheDocument();
  });

  it("completes full integrated flow: select-character -> preset -> replace -> remove -> change-character", () => {
    render(<DressUpPage />);

    // Step 1: Select character Nam
    const maleButton = screen.getByRole("button", { name: /Chọn nhân vật Nam/i });
    fireEvent.click(maleButton);

    expect(screen.getByTestId("selected-character")).toHaveTextContent("Nam");
    expect(screen.queryByTestId("active-preset-badge")).not.toBeInTheDocument();

    // Step 2: Apply preset RX-01 (male: Áo ngũ thân, beige trousers, sneakers)
    const rx01Btn = screen.getByTestId("preset-button-rx-01-male");
    fireEvent.click(rx01Btn);

    expect(rx01Btn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("active-preset-badge")).toHaveTextContent(
      "Đang áp dụng: RX-01 - Ngũ thân hiện đại"
    );
    expect(screen.getByText(/Đang mặc: 3 món/i)).toBeInTheDocument();

    // Step 3: Replace item manually (Switch to tab Áo and equip Áo giao lĩnh)
    fireEvent.click(screen.getByRole("tab", { name: "Áo" }));
    const equipGiaoLinhBtn = screen.getByRole("button", { name: /Mặc Áo giao lĩnh/i });
    fireEvent.click(equipGiaoLinhBtn);

    // After replacing top with Áo giao lĩnh, the outfit has Áo giao lĩnh, beige trousers, sneakers.
    // This is no longer RX-01, so RX-01 active state is cleared.
    expect(rx01Btn).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByTestId("active-preset-badge")).not.toBeInTheDocument();

    // If we now equip Vòng cổ bạc, it matches RX-02 exactly!
    fireEvent.click(screen.getByRole("tab", { name: "Phụ kiện" }));
    const equipNecklaceBtn = screen.getByRole("button", { name: /Mặc Vòng cổ bạc/i });
    fireEvent.click(equipNecklaceBtn);

    const rx02Btn = screen.getByTestId("preset-button-rx-02-male");
    expect(rx02Btn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("active-preset-badge")).toHaveTextContent(
      "Đang áp dụng: RX-02 - Giao lĩnh phá cách"
    );
    expect(screen.getByText(/Đang mặc: 4 món/i)).toBeInTheDocument();

    // Step 4: Remove item manually (Remove Vòng cổ bạc)
    const removeNecklaceBtn = screen.getByRole("button", { name: /Cởi Vòng cổ bạc/i });
    fireEvent.click(removeNecklaceBtn);

    expect(screen.getByText(/Đang mặc: 3 món/i)).toBeInTheDocument();
    expect(rx02Btn).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByTestId("active-preset-badge")).not.toBeInTheDocument();

    // Step 5: Change character to Female
    const changeToFemaleBtn = screen.getByRole("button", { name: /Đổi sang nhân vật Nữ/i });
    fireEvent.click(changeToFemaleBtn);

    expect(screen.getByTestId("selected-character")).toHaveTextContent("Nữ");
    expect(screen.getByText(/Đang mặc: 0 món/i)).toBeInTheDocument();
    expect(screen.queryByTestId("active-preset-badge")).not.toBeInTheDocument();
    expect(screen.getByTestId("preset-button-set-c-female")).toBeInTheDocument();

    // Additional check: Applying preset replaces entire outfit and removes accessories
    fireEvent.click(screen.getByRole("tab", { name: "Phụ kiện" }));
    fireEvent.click(screen.getByRole("button", { name: /Mặc Nón lá/i }));
    fireEvent.click(screen.getByRole("button", { name: /Mặc Vòng cổ bạc/i }));
    expect(screen.getByText(/Đang mặc: 2 món/i)).toBeInTheDocument();

    // Now apply Set A female (which has 0 accessories: top, trousers, shoes)
    const setAFemaleBtn = screen.getByTestId("preset-button-set-a-female");
    fireEvent.click(setAFemaleBtn);

    expect(screen.getByText(/Đang mặc: 3 món/i)).toBeInTheDocument();
    expect(screen.getByTestId("active-preset-badge")).toHaveTextContent(
      "Đang áp dụng: Set A - Áo ngũ thân"
    );
    // Neither Nón lá nor Vòng cổ bạc should be worn
    expect(screen.queryByRole("button", { name: /Cởi Nón lá/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Cởi Vòng cổ bạc/i })).not.toBeInTheDocument();
  });
});
