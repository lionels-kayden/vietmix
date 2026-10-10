import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ResultView } from "./ResultView";
import { loadAll } from "@/lib/data";

describe("P6 - T4 & P7: ResultView component", () => {
  beforeAll(() => {
    loadAll();
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders result view with canvas, summary card, story cards, and actions", () => {
    const handleEdit = vi.fn();
    const handleDownload = vi.fn();
    const handleSaveLookbook = vi.fn();

    render(
      <ResultView
        gender="male"
        itemIds={["M_A_TOP_ao_ngu_than", "M_COMMON_BOTTOM_quan_lua_trang"]}
        sceneId="tet"
        onEdit={handleEdit}
        onDownload={handleDownload}
        onSaveLookbook={handleSaveLookbook}
      />
    );

    expect(screen.getByTestId("result-view")).toBeInTheDocument();
    expect(screen.getByText(/Bộ Cánh Đã Chốt/i)).toBeInTheDocument();

    // Summary card
    expect(screen.getByTestId("outfit-summary-card")).toBeInTheDocument();
    expect(screen.getByTestId("outfit-summary-text")).toHaveTextContent(/Áo ngũ thân/i);

    // Return to edit button
    const editBtn = screen.getByTestId("btn-return-edit");
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledTimes(1);

    // Download button
    const downloadBtn = screen.getByTestId("btn-download");
    fireEvent.click(downloadBtn);
    expect(handleDownload).toHaveBeenCalledTimes(1);

    // Lookbook button
    const lookbookBtn = screen.getByTestId("btn-lookbook");
    fireEvent.click(lookbookBtn);
    expect(handleSaveLookbook).toHaveBeenCalledTimes(1);
  });

  it("saves to Lookbook and opens Lookbook modal to view and delete saved outfits", () => {
    const handleEdit = vi.fn();

    render(
      <ResultView
        gender="female"
        itemIds={["F_A_TOP_ao_ngu_than"]}
        sceneId="tet"
        onEdit={handleEdit}
      />
    );

    // 1. Click Lookbook button without prop -> triggers default saveToLookbook
    const lookbookBtn = screen.getByTestId("btn-lookbook");
    fireEvent.click(lookbookBtn);

    // Toast notification appears
    expect(screen.getByTestId("toast-notification")).toHaveTextContent(/Đã lưu trang phục vào Tủ đồ Lookbook/i);

    // 2. Open Lookbook modal
    const viewLookbookBtn = screen.getByTestId("btn-view-lookbook");
    fireEvent.click(viewLookbookBtn);

    expect(screen.getByTestId("lookbook-modal")).toBeInTheDocument();
    expect(screen.getByText(/Tủ Đồ Cá Nhân/i)).toBeInTheDocument();

    // Delete the saved entry
    const deleteBtn = screen.getByRole("button", { name: /Xóa/i });
    fireEvent.click(deleteBtn);

    // Now empty state is shown
    expect(screen.getByTestId("lookbook-empty")).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByTestId("btn-close-lookbook"));
    expect(screen.queryByTestId("lookbook-modal")).not.toBeInTheDocument();
  });

  it("opens ShareModal when Share button is clicked without onShare prop", () => {
    const handleEdit = vi.fn();

    render(
      <ResultView
        gender="male"
        itemIds={["M_A_TOP_ao_ngu_than"]}
        sceneId="tet"
        onEdit={handleEdit}
      />
    );

    // Initial: Share modal is closed
    expect(screen.queryByTestId("share-modal")).not.toBeInTheDocument();

    // Click Share button
    const shareBtn = screen.getByTestId("btn-share");
    fireEvent.click(shareBtn);

    // Modal is now open
    expect(screen.getByTestId("share-modal")).toBeInTheDocument();
    expect(screen.getByText("Chia sẻ trang phục")).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByTestId("btn-close-share"));
    expect(screen.queryByTestId("share-modal")).not.toBeInTheDocument();
  });

  it("calls onShare prop when provided", () => {
    const handleEdit = vi.fn();
    const handleShare = vi.fn();

    render(
      <ResultView
        gender="female"
        itemIds={["F_A_TOP_ao_ngu_than"]}
        sceneId="tet"
        onEdit={handleEdit}
        onShare={handleShare}
      />
    );

    const shareBtn = screen.getByTestId("btn-share");
    fireEvent.click(shareBtn);

    expect(handleShare).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("share-modal")).not.toBeInTheDocument();
  });
});
