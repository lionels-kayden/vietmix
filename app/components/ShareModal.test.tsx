import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ShareModal } from "./ShareModal";
import * as shareLib from "@/lib/share";

describe("Phase 8 - ShareModal Component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: "Áo ngũ thân truyền thống",
    caption: "Lời bình mẫu về áo ngũ thân\n#VietPhucRemix",
    url: "https://vietmix.vercel.app",
    onNativeShare: vi.fn(),
    onDownloadImage: vi.fn(),
  };

  it("does not render when isOpen is false", () => {
    render(<ShareModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("share-modal")).toBeNull();
  });

  it("renders modal with title, social links, and proper attributes when open", () => {
    render(<ShareModal {...defaultProps} />);

    expect(screen.getByTestId("share-modal")).toBeInTheDocument();
    expect(screen.getByText("Chia sẻ trang phục")).toBeInTheDocument();

    const fbLink = screen.getByTestId("share-link-facebook");
    expect(fbLink).toHaveAttribute("target", "_blank");
    expect(fbLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(fbLink.getAttribute("href")).toContain("facebook.com/sharer");

    const threadsLink = screen.getByTestId("share-link-threads");
    expect(threadsLink).toHaveAttribute("target", "_blank");
    expect(threadsLink.getAttribute("href")).toContain("threads.net/intent/post");

    const zaloLink = screen.getByTestId("share-link-zalo");
    expect(zaloLink).toHaveAttribute("target", "_blank");
    expect(zaloLink.getAttribute("href")).toContain("sp.zalo.me/share_inline");
  });

  it("calls onClose when close button is clicked or Escape key is pressed", () => {
    const onClose = vi.fn();
    render(<ShareModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByTestId("btn-close-share"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("copies caption to clipboard and indicates success", async () => {
    const copySpy = vi.spyOn(shareLib, "copyToClipboard").mockResolvedValue(true);
    render(<ShareModal {...defaultProps} />);

    const copyBtn = screen.getByTestId("btn-copy-caption");
    fireEvent.click(copyBtn);

    expect(copySpy).toHaveBeenCalledWith(defaultProps.caption);
    await waitFor(() => {
      expect(screen.getByText("Đã chép hashtag!")).toBeInTheDocument();
    });

    copySpy.mockRestore();
  });

  it("calls onNativeShare when native share button is clicked", () => {
    const onNativeShare = vi.fn();
    render(<ShareModal {...defaultProps} onNativeShare={onNativeShare} />);

    fireEvent.click(screen.getByTestId("btn-native-share"));
    expect(onNativeShare).toHaveBeenCalledTimes(1);
  });

  it("renders visual outfit card with CharacterCanvas and corner QR code when gender and itemIds are provided", async () => {
    render(
      <ShareModal
        {...defaultProps}
        gender="female"
        itemIds={["F_B_TOP_ao_giao_linh", "F_B_BOTTOM_vay_dai"]}
        sceneId="tet"
      />
    );

    expect(screen.getByTestId("share-outfit-card")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("share-qr-code")).toBeInTheDocument();
    });
    expect(screen.getByText("Quét thử đồ")).toBeInTheDocument();
  });

  it("calls onDownloadImage when download share card button is clicked", () => {
    const onDownloadImage = vi.fn();
    render(
      <ShareModal
        {...defaultProps}
        gender="female"
        itemIds={["F_B_TOP_ao_giao_linh"]}
        onDownloadImage={onDownloadImage}
      />
    );

    const downloadBtn = screen.getByTestId("btn-download-share-card");
    fireEvent.click(downloadBtn);
    expect(onDownloadImage).toHaveBeenCalledTimes(1);
  });
});
