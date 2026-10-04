import { describe, it, expect, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import DressUpPage from "./page";
import { loadAll } from "@/lib/data";

describe("Dress-up entry route and outfit state (T1 & T2)", () => {
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

  it("choosing a character enters the dressing step, equipping items updates state, and changing character clears worn items and shows only the new gender's catalog", () => {
    render(<DressUpPage />);

    // 1. Choose Male character
    const maleButton = screen.getByRole("button", { name: /Chọn nhân vật Nam/i });
    fireEvent.click(maleButton);

    // Enters dressing step
    expect(screen.getByTestId("selected-character")).toHaveTextContent("Nam");
    expect(screen.getByTestId("dressing-area")).toBeInTheDocument();

    // Catalog shows male items and specifically male-only item Áo tấc
    expect(screen.getByText("Áo tấc")).toBeInTheDocument();
    // Female-only items must not be shown
    expect(screen.queryByText("Áo nhật bình")).not.toBeInTheDocument();
    expect(screen.queryByText("Váy dài đen")).not.toBeInTheDocument();
    expect(screen.queryByText("Trâm cài bạc")).not.toBeInTheDocument();

    // 2. Equip an item (Áo tấc)
    const equipTacBtn = screen.getByRole("button", { name: /Mặc Áo tấc/i });
    fireEvent.click(equipTacBtn);

    expect(screen.getByText(/Đang mặc: 1 món/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cởi Áo tấc/i })).toBeInTheDocument();
    expect(screen.getByTestId("worn-items-summary")).toHaveTextContent("Áo tấc");

    // Equip another top (Áo ngũ thân): replaces Áo tấc in the same slot
    const equipNguThanBtn = screen.getByRole("button", { name: /Mặc Áo ngũ thân/i });
    fireEvent.click(equipNguThanBtn);

    // Count is still 1 item worn (Áo tấc was replaced)
    expect(screen.getByText(/Đang mặc: 1 món/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cởi Áo ngũ thân/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mặc Áo tấc/i })).toBeInTheDocument();

    // 3. Changing character clears worn items and displays female catalog
    const changeToFemaleBtn = screen.getByRole("button", { name: /Đổi sang nhân vật Nữ/i });
    fireEvent.click(changeToFemaleBtn);

    expect(screen.getByTestId("selected-character")).toHaveTextContent("Nữ");
    // Worn items are cleared
    expect(screen.getByText(/Đang mặc: 0 món/i)).toBeInTheDocument();
    expect(screen.getByTestId("worn-items-summary")).toHaveTextContent("Chưa chọn món đồ nào");

    // Catalog now shows female items and female-only items
    expect(screen.getByText("Áo nhật bình")).toBeInTheDocument();
    expect(screen.getByText("Váy dài đen")).toBeInTheDocument();
    expect(screen.getByText("Trâm cài bạc")).toBeInTheDocument();
    // Male-only items must not be shown
    expect(screen.queryByText("Áo tấc")).not.toBeInTheDocument();
  });
});
