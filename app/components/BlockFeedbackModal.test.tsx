import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BlockFeedbackModal } from "./BlockFeedbackModal";
import { RuleHit } from "@/lib/types";

describe("P6 - T2: BlockFeedbackModal component", () => {
  const sampleBlockHits: RuleHit[] = [
    {
      ruleId: "R_SKIRT_NGU_THAN",
      level: "block",
      message_key: "skirt_ngu_than",
      message_vi: "Áo ngũ thân truyền thống thời Nguyễn không kết hợp cùng váy dài.",
      itemIds: ["F_A_TOP_ao_ngu_than", "F_B_BOTTOM_vay_dai"],
    },
  ];

  it("renders block modal with violation message and return-to-edit button", () => {
    const handleClose = vi.fn();
    render(<BlockFeedbackModal blockHits={sampleBlockHits} onClose={handleClose} />);

    expect(screen.getByTestId("block-feedback-modal")).toBeInTheDocument();
    expect(screen.getByText(/Chưa thể chốt bộ trang phục/i)).toBeInTheDocument();
    expect(screen.getByText(/Áo ngũ thân truyền thống thời Nguyễn không kết hợp cùng váy dài/i)).toBeInTheDocument();

    const closeBtn = screen.getByTestId("btn-close-block-modal");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when blockHits is empty", () => {
    const handleClose = vi.fn();
    render(<BlockFeedbackModal blockHits={[]} onClose={handleClose} />);
    expect(screen.queryByTestId("block-feedback-modal")).not.toBeInTheDocument();
  });
});
