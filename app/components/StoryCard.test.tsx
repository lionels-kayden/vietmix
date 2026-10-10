import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { StoryCard } from "./StoryCard";
import { ItemStory } from "@/lib/types";

describe("P5 - T3: StoryCard component (app/components/StoryCard.tsx)", () => {
  const sampleVerifiedStory: ItemStory = {
    kind: "ao_ngu_than",
    title_vi: "Áo ngũ thân",
    period: "Thời Nguyễn (thế kỷ 18–20)",
    origin: "Định hình từ cải cách của Chúa Nguyễn Phúc Khoát.",
    occasion: "Trang phục thường nhật lẫn công vụ.",
    remix_note: "Phối cùng quần âu màu be hoặc sneaker.",
    sources: ["Ngàn năm áo mũ (2013)", "https://vi.wikipedia.org/wiki/Ao_ngu_than"],
    needs_review: false,
  };

  const sampleUnverifiedStory: ItemStory = {
    ...sampleVerifiedStory,
    needs_review: true,
  };

  it("renders front face by default with title, origin, and verified badge", () => {
    render(<StoryCard story={sampleVerifiedStory} />);

    expect(screen.getByTestId("story-card-front")).toBeInTheDocument();
    expect(screen.queryByTestId("story-card-back")).not.toBeInTheDocument();

    expect(screen.getByText("Áo ngũ thân")).toBeInTheDocument();
    expect(screen.getByText(/Thời Nguyễn/i)).toBeInTheDocument();
    expect(screen.getByText(/Chúa Nguyễn Phúc Khoát/i)).toBeInTheDocument();

    // Verified badge
    const badge = screen.getByTestId("story-review-badge");
    expect(badge).toHaveTextContent(/Tư liệu đã xác minh/i);
  });

  it("renders unverified badge when needs_review is true", () => {
    render(<StoryCard story={sampleUnverifiedStory} />);

    const badge = screen.getByTestId("story-review-badge");
    expect(badge).toHaveTextContent(/Tư liệu đang đối chiếu/i);
  });

  it("flips to back face on click to show occasion, remix note, and sources", () => {
    render(<StoryCard story={sampleVerifiedStory} />);

    // Click to flip
    const cardBtn = screen.getByRole("button", { name: /Thẻ câu chuyện văn hóa/i });
    fireEvent.click(cardBtn);

    expect(screen.getByTestId("story-card-back")).toBeInTheDocument();
    expect(screen.queryByTestId("story-card-front")).not.toBeInTheDocument();

    expect(screen.getByText(/Trang phục thường nhật lẫn công vụ/i)).toBeInTheDocument();
    expect(screen.getByText(/Phối cùng quần âu màu be hoặc sneaker/i)).toBeInTheDocument();
    expect(screen.getByText(/Ngàn năm áo mũ/i)).toBeInTheDocument();

    // Click again to flip back
    fireEvent.click(cardBtn);
    expect(screen.getByTestId("story-card-front")).toBeInTheDocument();
  });

  it("flips using keyboard (Enter / Space keys)", () => {
    render(<StoryCard story={sampleVerifiedStory} />);

    const cardBtn = screen.getByRole("button", { name: /Thẻ câu chuyện văn hóa/i });

    // Press Enter to flip
    fireEvent.keyDown(cardBtn, { key: "Enter" });
    expect(screen.getByTestId("story-card-back")).toBeInTheDocument();

    // Press Space to flip back
    fireEvent.keyDown(cardBtn, { key: " " });
    expect(screen.getByTestId("story-card-front")).toBeInTheDocument();
  });
});
