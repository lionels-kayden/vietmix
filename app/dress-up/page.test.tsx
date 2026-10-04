import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import DressUpPage from "./page";

describe("Dress-up entry route and design foundation (T1)", () => {
  it("renders character-choice heading and controls", () => {
    render(<DressUpPage />);

    // Character choice heading
    const heading = screen.getByRole("heading", { name: /Chọn nhân vật/i });
    expect(heading).toBeInTheDocument();

    // Nam and Nữ choice buttons
    const maleButton = screen.getByRole("button", { name: /Chọn nhân vật Nam/i });
    const femaleButton = screen.getByRole("button", { name: /Chọn nhân vật Nữ/i });

    expect(maleButton).toBeInTheDocument();
    expect(femaleButton).toBeInTheDocument();

    // Navigation back to home exists
    const backLink = screen.getByRole("link", { name: /Quay lại trang chủ/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("transitions between character selection and dressing shell", () => {
    render(<DressUpPage />);

    // Select Male
    const maleButton = screen.getByRole("button", { name: /Chọn nhân vật Nam/i });
    fireEvent.click(maleButton);

    // Shows selected character and dressing area
    expect(screen.getByText(/Nhân vật:/i)).toBeInTheDocument();
    expect(screen.getByText("Nam")).toBeInTheDocument();
    expect(screen.getByTestId("dressing-area")).toBeInTheDocument();

    // Click "Đổi nhân vật" to go back
    const changeBtn = screen.getByRole("button", { name: /Đổi nhân vật/i });
    fireEvent.click(changeBtn);

    // Heading returns
    expect(screen.getByRole("heading", { name: /Chọn nhân vật/i })).toBeInTheDocument();
  });
});
