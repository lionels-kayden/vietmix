import { describe, it, expect, beforeAll } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
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

  it("demonstrates hat-to-hairpin exclusive replacement in Phụ kiện tab", () => {
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

    // Verify Vòng cổ bạc is completely absent from wardrobe
    expect(screen.queryByText(/Vòng cổ bạc/i)).not.toBeInTheDocument();
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
    // This matches RX-02 exactly!
    const rx02Btn = screen.getByTestId("preset-button-rx-02-male");
    expect(rx02Btn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("active-preset-badge")).toHaveTextContent(
      "Đang áp dụng: RX-02 - Giao lĩnh phá cách"
    );
    expect(screen.getByText(/Đang mặc: 3 món/i)).toBeInTheDocument();

    // Step 4: Equip an accessory (Nón lá) -> RX-02 is no longer active
    fireEvent.click(screen.getByRole("tab", { name: "Phụ kiện" }));
    const equipHatBtn = screen.getByRole("button", { name: /Mặc Nón lá/i });
    fireEvent.click(equipHatBtn);

    expect(screen.getByText(/Đang mặc: 4 món/i)).toBeInTheDocument();
    expect(rx02Btn).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByTestId("active-preset-badge")).not.toBeInTheDocument();

    // Remove Nón lá -> restores RX-02
    const removeHatBtn = screen.getByRole("button", { name: /Cởi Nón lá/i });
    fireEvent.click(removeHatBtn);
    expect(screen.getByText(/Đang mặc: 3 món/i)).toBeInTheDocument();
    expect(rx02Btn).toHaveAttribute("aria-pressed", "true");

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
    expect(screen.getByText(/Đang mặc: 1 món/i)).toBeInTheDocument();

    // Now apply Set A female (which has 0 accessories: top, trousers, shoes)
    const setAFemaleBtn = screen.getByTestId("preset-button-set-a-female");
    fireEvent.click(setAFemaleBtn);

    expect(screen.getByText(/Đang mặc: 3 món/i)).toBeInTheDocument();
    expect(screen.getByTestId("active-preset-badge")).toHaveTextContent(
      "Đang áp dụng: Set A - Áo ngũ thân"
    );
    // Nón lá should no longer be worn
    expect(screen.queryByRole("button", { name: /Cởi Nón lá/i })).not.toBeInTheDocument();
  });

  it("integrates SceneSelector, RemixSlider, and SceneCapBadge dynamically with outfits", () => {
    render(<DressUpPage />);

    // Select Male character
    fireEvent.click(screen.getByRole("button", { name: /Chọn nhân vật Nam/i }));

    // Initial scene is Tết (cap: 1)
    expect(screen.getByTestId("scene-btn-tet")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("img", { name: "Bối cảnh tet" })).toBeInTheDocument();

    // With 0 modern items, RemixSlider is at level 0 and SceneCapBadge is within-cap
    expect(screen.getByTestId("remix-level-badge")).toHaveTextContent("Mốc 0: Cổ điển");
    expect(screen.getByTestId("scene-cap-badge")).toHaveAttribute("data-status", "within-cap");

    // Apply RX-01 (contains 2 modern items: Quần âu + Giày sneaker)
    const rx01Btn = screen.getByTestId("preset-button-rx-01-male");
    fireEvent.click(rx01Btn);

    // RemixSlider is now at level 2 (Đột phá)
    expect(screen.getByTestId("remix-count-badge")).toHaveTextContent("2 món hiện đại");
    expect(screen.getByTestId("remix-level-badge")).toHaveTextContent("Mốc 2: Đột phá");

    // In Tết scene (cap 1), 2 modern items exceeds cap -> SceneCapBadge shows cultural suggestion
    const capBadge = screen.getByTestId("scene-cap-badge");
    expect(capBadge).toHaveAttribute("data-status", "exceeding-cap");
    expect(capBadge).toHaveTextContent(/Gợi ý văn hóa cho bối cảnh Tết/i);
    expect(capBadge).toHaveTextContent(/Khuyên dùng: max 1 món/i);

    // Change scene to Kỷ yếu (cap 2)
    const kyYeuBtn = screen.getByTestId("scene-btn-ky-yeu");
    fireEvent.click(kyYeuBtn);

    // Canvas background updates to ky-yeu
    expect(kyYeuBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("img", { name: "Bối cảnh ky-yeu" })).toBeInTheDocument();

    // In Kỷ yếu scene (cap 2), 2 modern items is now WITHIN cap!
    expect(screen.getByTestId("scene-cap-badge")).toHaveAttribute("data-status", "within-cap");
    expect(screen.getByTestId("scene-cap-badge")).toHaveTextContent(/Hòa hợp bối cảnh Kỷ yếu/i);

    // Switch gender to Female: scene selection (ky-yeu) is preserved
    fireEvent.click(screen.getByRole("button", { name: /Đổi sang nhân vật Nữ/i }));
    expect(screen.getByTestId("selected-character")).toHaveTextContent("Nữ");
    expect(screen.getByTestId("scene-btn-ky-yeu")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("img", { name: "Bối cảnh ky-yeu" })).toBeInTheDocument();
  });

  it("dynamically shows and flips cultural story cards for equipped garments", () => {
    render(<DressUpPage />);

    // Select Female
    fireEvent.click(screen.getByRole("button", { name: /Chọn nhân vật Nữ/i }));

    // Initially with 0 items: empty story state
    expect(screen.getByTestId("story-cards-empty")).toBeInTheDocument();
    expect(screen.getByText("Chưa chọn trang phục")).toBeInTheDocument();

    // Equip Áo nhật bình (slot: top)
    const equipNhatBinhBtn = screen.getByRole("button", { name: /Mặc Áo nhật bình/i });
    fireEvent.click(equipNhatBinhBtn);

    // Empty state disappears, story card for ao_nhat_binh appears
    expect(screen.queryByTestId("story-cards-empty")).not.toBeInTheDocument();
    const storyCard = screen.getByTestId("story-card-ao_nhat_binh");
    expect(storyCard).toBeInTheDocument();
    expect(screen.getByText("1 thẻ tư liệu")).toBeInTheDocument();

    // Verify story card front shows origin
    expect(within(storyCard).getByText("Áo nhật bình")).toBeInTheDocument();
    expect(within(storyCard).getByText(/Lễ phục dành riêng cho Hoàng hậu/i)).toBeInTheDocument();

    // Flip the card
    const cardBtn = screen.getByRole("button", { name: /Thẻ câu chuyện văn hóa: Áo nhật bình/i });
    fireEvent.click(cardBtn);

    // Back shows occasion, remix note, and sources
    expect(within(storyCard).getByText(/Lễ tiết cung đình, đại triều/i)).toBeInTheDocument();
    expect(within(storyCard).getByText(/Hoa văn cổ áo lộng lẫy/i)).toBeInTheDocument();

    // Remove Áo nhật bình -> empty state returns
    const removeNhatBinhBtn = screen.getByRole("button", { name: /Cởi Áo nhật bình/i });
    fireEvent.click(removeNhatBinhBtn);

    expect(screen.getByTestId("story-cards-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("story-card-ao_nhat_binh")).not.toBeInTheDocument();
  });

  it("handles confirm outfit flow: blocks rule violations and opens result view on valid outfit", () => {
    render(<DressUpPage />);

    // Select Female
    fireEvent.click(screen.getByRole("button", { name: /Chọn nhân vật Nữ/i }));

    // 1. Equip Áo ngũ thân + Váy dài -> Triggers R_SKIRT_NGU_THAN (block)
    fireEvent.click(screen.getByRole("button", { name: /Mặc Áo ngũ thân/i }));
    fireEvent.click(screen.getByRole("tab", { name: "Quần/Váy" }));
    fireEvent.click(screen.getByRole("button", { name: /Mặc Váy dài/i }));

    // Click "Chốt bộ"
    const confirmBtn = screen.getByTestId("btn-confirm-outfit");
    fireEvent.click(confirmBtn);

    // Block feedback modal pops up
    expect(screen.getByTestId("block-feedback-modal")).toBeInTheDocument();
    expect(
      screen.getByText(/Áo ngũ thân truyền thống thời Nguyễn không kết hợp cùng váy dài/i)
    ).toBeInTheDocument();

    // Close block modal -> returns to editing
    fireEvent.click(screen.getByTestId("btn-close-block-modal"));
    expect(screen.queryByTestId("block-feedback-modal")).not.toBeInTheDocument();
    expect(screen.getByTestId("dressing-area")).toBeInTheDocument();

    // 2. Fix the violation: replace Váy dài with Quần lụa trắng
    fireEvent.click(screen.getByRole("button", { name: /Mặc Quần lụa trắng/i }));

    // Now outfit is valid! Click "Chốt bộ"
    fireEvent.click(screen.getByTestId("btn-confirm-outfit"));

    // Enters Result View
    expect(screen.getByTestId("result-view")).toBeInTheDocument();
    expect(screen.getByText(/Bộ Cánh Đã Chốt/i)).toBeInTheDocument();
    expect(screen.getByTestId("outfit-summary-card")).toBeInTheDocument();
    expect(screen.getByTestId("result-story-cards")).toBeInTheDocument();

    // 3. Return to edit flow
    fireEvent.click(screen.getByTestId("btn-return-edit"));
    expect(screen.queryByTestId("result-view")).not.toBeInTheDocument();
    expect(screen.getByTestId("dressing-area")).toBeInTheDocument();
    // Items are preserved (Áo ngũ thân + Quần lụa trắng)
    expect(screen.getByText(/Đang mặc: 2 món/i)).toBeInTheDocument();
  });
});
