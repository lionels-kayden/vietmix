import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LookbookModal } from "./LookbookModal";
import { saveToLookbook, clearLookbook, LookbookEntry } from "@/lib/lookbook";
import * as shareLib from "@/lib/share";

describe("LookbookModal Album component (app/components/LookbookModal.tsx)", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearLookbook();
    vi.restoreAllMocks();
  });

  it("renders empty state when album is empty", () => {
    const handleClose = vi.fn();
    render(<LookbookModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByTestId("lookbook-modal")).toBeInTheDocument();
    expect(screen.getByTestId("lookbook-empty")).toHaveTextContent(/Chưa có bộ trang phục nào trong Album/i);
    expect(screen.getByText(/Tủ Đồ Cá Nhân/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("btn-close-lookbook"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders saved outfits with thumbnails, tags, and summary", async () => {
    const fakeDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    await saveToLookbook({
      id: "outfit_test_1",
      gender: "female",
      itemIds: ["F_A_TOP_ao_ngu_than", "F_A_BOTTOM_quan_trang"],
      sceneId: "tet",
      summary: "Áo ngũ thân truyền thống nền nã ngày Tết.",
      remixLevel: 0,
      title: "Ngũ Thân Truyền Thống",
      imageData: fakeDataUrl,
      timestamp: Date.now(),
    });

    render(<LookbookModal isOpen={true} onClose={vi.fn()} />);

    // Item should be visible
    expect(await screen.findByTestId("lookbook-item-outfit_test_1")).toBeInTheDocument();
    expect(screen.getByText("Ngũ Thân Truyền Thống")).toBeInTheDocument();
    const thumb = await screen.findByTestId("thumbnail-outfit_test_1");
    expect(thumb).toHaveAttribute("src", fakeDataUrl);
    expect(screen.getByText(/Áo ngũ thân truyền thống nền nã/i)).toBeInTheDocument();
  });

  it("downloads the PNG card when Tải ảnh button is clicked", async () => {
    const fakeDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    await saveToLookbook({
      id: "outfit_download",
      gender: "male",
      itemIds: ["M_A_TOP_ao_ngu_than"],
      sceneId: "tet",
      summary: "Tết Hoàng Cung",
      remixLevel: 0,
      title: "Nam Ngũ Thân",
      imageData: fakeDataUrl,
    });

    const clickSpy = vi.fn();
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = origCreate(tag);
      if (tag === "a") {
        el.click = clickSpy;
      }
      return el;
    });

    render(<LookbookModal isOpen={true} onClose={vi.fn()} />);

    // Wait for entry to be loaded from IndexedDB
    await screen.findByTestId("thumbnail-outfit_download");

    const downloadBtn = screen.getByTestId("btn-download-outfit_download");
    fireEvent.click(downloadBtn);

    expect(clickSpy).toHaveBeenCalled();
    expect(screen.getByTestId("album-toast")).toHaveTextContent(/Đang tải ảnh thẻ PNG về máy/i);
  });

  it("calls shareOutfitFile when Chia sẻ button is clicked", async () => {
    const fakeDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    await saveToLookbook({
      id: "outfit_share",
      gender: "female",
      itemIds: ["F_B_TOP_ao_giao_linh"],
      sceneId: "doi-thuong",
      summary: "Giao lĩnh dạo phố",
      remixLevel: 1,
      imageData: fakeDataUrl,
    });

    const shareSpy = vi.spyOn(shareLib, "shareOutfitFile").mockResolvedValue({ status: "handed-off", success: true });

    render(<LookbookModal isOpen={true} onClose={vi.fn()} />);

    // Wait for entry to be loaded from IndexedDB
    await screen.findByTestId("thumbnail-outfit_share");

    const shareBtn = screen.getByTestId("btn-share-outfit_share");
    fireEvent.click(shareBtn);

    await waitFor(() => {
      expect(shareSpy).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByTestId("album-toast")).toHaveTextContent(/Đã mở bảng chia sẻ thành công/i);
  });

  it("calls onReWear with the selected outfit and closes modal when Mặc lại is clicked", async () => {
    await saveToLookbook({
      id: "outfit_rewear",
      gender: "female",
      itemIds: ["F_C_TOP_ao_nhat_binh", "F_C_BOTTOM_vay_nhieu_nep"],
      sceneId: "ky-yeu",
      summary: "Kỷ yếu trang trọng",
      remixLevel: 1,
      title: "Kỷ Yếu Nhật Bình",
    });

    const handleReWear = vi.fn();
    const handleClose = vi.fn();

    render(
      <LookbookModal
        isOpen={true}
        onClose={handleClose}
        onReWear={handleReWear}
      />
    );

    const reWearBtn = screen.getByTestId("btn-rewear-outfit_rewear");
    fireEvent.click(reWearBtn);

    expect(handleReWear).toHaveBeenCalledTimes(1);
    const calledEntry: LookbookEntry = handleReWear.mock.calls[0][0];
    expect(calledEntry.id).toBe("outfit_rewear");
    expect(calledEntry.gender).toBe("female");
    expect(calledEntry.itemIds).toEqual(["F_C_TOP_ao_nhat_binh", "F_C_BOTTOM_vay_nhieu_nep"]);
    expect(calledEntry.sceneId).toBe("ky-yeu");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("deletes the outfit from the album on Xóa click", async () => {
    await saveToLookbook({
      id: "outfit_to_delete",
      gender: "male",
      itemIds: ["M_A_TOP_ao_ngu_than"],
      sceneId: "tet",
      summary: "Xóa tôi",
      remixLevel: 0,
    });

    render(<LookbookModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId("lookbook-item-outfit_to_delete")).toBeInTheDocument();

    const deleteBtn = screen.getByTestId("btn-delete-outfit_to_delete");
    fireEvent.click(deleteBtn);

    // Item is deleted immediately
    expect(screen.queryByTestId("lookbook-item-outfit_to_delete")).not.toBeInTheDocument();
    expect(screen.getByTestId("lookbook-empty")).toBeInTheDocument();
    expect(screen.getByTestId("album-toast")).toHaveTextContent(/Đã xóa bộ trang phục khỏi Album/i);
  });

  it("filters outfits by gender tabs", async () => {
    await saveToLookbook({
      id: "female_look",
      gender: "female",
      itemIds: ["F_A_TOP_ao_ngu_than"],
      sceneId: "tet",
      summary: "Nữ look",
      remixLevel: 0,
    });

    await saveToLookbook({
      id: "male_look",
      gender: "male",
      itemIds: ["M_A_TOP_ao_ngu_than"],
      sceneId: "tet",
      summary: "Nam look",
      remixLevel: 0,
    });

    render(<LookbookModal isOpen={true} onClose={vi.fn()} />);

    // Initial: both shown
    expect(screen.getByTestId("lookbook-item-female_look")).toBeInTheDocument();
    expect(screen.getByTestId("lookbook-item-male_look")).toBeInTheDocument();

    // Click Nữ filter
    fireEvent.click(screen.getByRole("tab", { name: /Nữ/i }));
    expect(screen.getByTestId("lookbook-item-female_look")).toBeInTheDocument();
    expect(screen.queryByTestId("lookbook-item-male_look")).not.toBeInTheDocument();

    // Click Nam filter
    fireEvent.click(screen.getByRole("tab", { name: /Nam/i }));
    expect(screen.queryByTestId("lookbook-item-female_look")).not.toBeInTheDocument();
    expect(screen.getByTestId("lookbook-item-male_look")).toBeInTheDocument();

    // Click Tất cả filter
    fireEvent.click(screen.getByRole("tab", { name: /Tất cả/i }));
    expect(screen.getByTestId("lookbook-item-female_look")).toBeInTheDocument();
    expect(screen.getByTestId("lookbook-item-male_look")).toBeInTheDocument();
  });

  it("opens lightbox preview when clicking on thumbnail", async () => {
    const fakeDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    await saveToLookbook({
      id: "outfit_lightbox",
      gender: "female",
      itemIds: ["F_A_TOP_ao_ngu_than"],
      sceneId: "tet",
      summary: "Chi tiết",
      remixLevel: 0,
      title: "Xem Lớn Test",
      imageData: fakeDataUrl,
    });

    render(<LookbookModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.queryByTestId("album-lightbox")).not.toBeInTheDocument();

    // Click thumbnail once loaded from IndexedDB
    const thumb = await screen.findByTestId("thumbnail-outfit_lightbox");
    fireEvent.click(thumb);

    expect(screen.getByTestId("album-lightbox")).toBeInTheDocument();

    // Close lightbox
    fireEvent.click(screen.getByRole("button", { name: /Đóng ✕/i }));
    expect(screen.queryByTestId("album-lightbox")).not.toBeInTheDocument();
  });
});
